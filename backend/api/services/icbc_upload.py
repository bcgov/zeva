import pandas as pd
import numpy as np
import math
import time
import traceback
from django.db import transaction, connection
from django.utils import timezone
from datetime import datetime
from dateutil.relativedelta import relativedelta
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.icbc_vehicle import IcbcVehicle
from api.models.model_year import ModelYear
from api.models.icbc_upload_date import IcbcUploadDate
from api.models.icbc_upload_progress import IcbcUploadProgress
from api.serializers.icbc_upload_progress import IcbcUploadProgressSerializer
from api.services.minio import get_minio_object, minio_remove_object


def get_upload_progress(upload_obj):
    try:
        progress_obj = IcbcUploadProgress.objects.get(upload=upload_obj)
        serializer = IcbcUploadProgressSerializer(progress_obj)
        return serializer.data
    except IcbcUploadProgress.DoesNotExist:
        return {
            "progress": 0,
            "status": "Upload not found",
            "complete": False,
            "error": "Upload not found",
        }


def set_upload_progress(
    upload_obj,
    progress,
    status_text,
    current_page=0,
    total_pages=0,
    complete=False,
    error=None,
):
    try:
        # Get or create the progress status object
        progress_obj, created = IcbcUploadProgress.objects.get_or_create(
            upload_id=upload_obj.id,
            defaults={
                "progress": progress,
                "status_text": status_text,
                "current_page": current_page,
                "total_pages": total_pages,
                "complete": complete,
                "error": error,
            },
        )

        # If it already exists, update it
        if not created:
            progress_obj.progress = progress
            progress_obj.status_text = status_text
            progress_obj.current_page = current_page
            progress_obj.total_pages = total_pages
            progress_obj.complete = complete
            progress_obj.error = error
            progress_obj.save()

        print(
            f"Progress updated: {upload_obj.id} - {progress}% - {status_text} - Page {current_page}/{total_pages}"
        )
        return True
    except Exception as e:
        print(f"Error updating progress for {upload_obj.id}: {e}")
        traceback.print_exc()
        return None


def clear_upload_progress(upload_obj):
    try:
        IcbcUploadProgress.objects.filter(upload=upload_obj).delete()
    except Exception as e:
        print(f"Error clearing progress for {upload_obj.id}: {e}")


def trim_all_columns(df):
    """
    Trim whitespace from ends of each value across all series in dataframe
    """
    trim_strings = lambda x: x.strip() if isinstance(x, str) else x
    return df.applymap(trim_strings)


def format_dataframe(df):
    df = df[
        (df["HYBRID_VEHICLE_FLAG"] != "N")
        | (df["ELECTRIC_VEHICLE_FLAG"] != "N")
        | (df["FUEL_TYPE"].str.upper() == "ELECTRIC")
        | (df["FUEL_TYPE"].str.upper() == "HYDROGEN")
        | (df["FUEL_TYPE"].str.upper() == "GASOLINEELECTRIC")
    ]

    df["MODEL_YEAR"].fillna(0, inplace=True)
    df["MODEL_YEAR"] = pd.to_numeric(df["MODEL_YEAR"])
    df.drop(df[df["MODEL_YEAR"] <= 2018].index, inplace=True)

    df["VIN"].fillna(0, inplace=True)
    df.drop(df[df["VIN"] == 0].index, inplace=True)

    df = df[["MODEL_YEAR", "MAKE", "MODEL", "VIN"]]

    return df


def read_csv_file(filepath, source_label):
    """
    Read CSV file in chunks and return as list of values.
    """
    df_list = []
    for df in pd.read_csv(
        filepath,
        sep=",",
        error_bad_lines=False,
        iterator=True,
        low_memory=True,
        chunksize=50000,
        header=0,
    ):
        df["SOURCE"] = source_label
        df_list.extend(df.values.tolist())
    return df_list


def compare_dataframes(df_previous, df_latest):
    """
    Compare two dataframes and return rows that are new or changed in the latest.
    """
    c_result = (
        pd.concat([df_previous, df_latest])
        .drop_duplicates(subset=["MODEL_YEAR", "MAKE", "MODEL", "VIN"])
        .reset_index(drop=True)
    )
    return c_result[c_result["SOURCE"] == "LATEST"]


def create_or_get_model_years(unique_model_years, requesting_user):
    """
    Create or get ModelYear objects for the given years.
    """
    model_years = []
    for unique_model_year in unique_model_years:
        eff_date = datetime.strptime(str(unique_model_year), "%Y")
        exp_date = eff_date + relativedelta(years=1) - relativedelta(days=1)
        (model_year, _) = ModelYear.objects.get_or_create(
            name=unique_model_year,
            defaults={
                "create_user": requesting_user,
                "update_user": requesting_user,
                "effective_date": eff_date,
                "expiration_date": exp_date,
            },
        )
        model_years.append(model_year)
    return model_years


def find_model_year_id(model_years, icbc_vehicle_year):
    """
    Find the model year ID from the list of model years.
    """
    for model_year in model_years:
        if model_year.name == icbc_vehicle_year:
            return model_year.id
    return None


def find_vehicle_id(
    icbc_vehicles, icbc_vehicle_model, icbc_vehicle_year, icbc_vehicle_make
):
    """
    Find the vehicle ID from the list of ICBC vehicles.
    """
    for vh in icbc_vehicles:
        if (
            vh.model_name == icbc_vehicle_model
            and vh.model_year == icbc_vehicle_year
            and vh.make == icbc_vehicle_make
        ):
            return vh.id
    return None


def create_or_get_vehicle(
    icbc_vehicle_model, icbc_vehicle_year_id, icbc_vehicle_make, requesting_user
):
    """
    Create or get an IcbcVehicle.
    """
    (vehicle, _) = IcbcVehicle.objects.get_or_create(
        model_name=icbc_vehicle_model,
        model_year_id=icbc_vehicle_year_id,
        make=icbc_vehicle_make,
        defaults={
            "create_user": requesting_user,
            "update_user": requesting_user,
        },
    )
    return vehicle.id


def process_registration_record(
    icbc_vehicle_vin, vehicle_id, icbc_upload_date_id, requesting_user
):
    """
    Create or update an ICBC registration data record.
    Returns (created_count, updated_count)
    """
    (row, created) = IcbcRegistrationData.objects.get_or_create(
        vin=icbc_vehicle_vin,
        defaults={
            "create_user": requesting_user,
            "update_user": requesting_user,
            "icbc_vehicle_id": vehicle_id,
            "icbc_upload_date_id": icbc_upload_date_id,
        },
    )

    if created:
        return (1, 0)

    # if vehicle id doesn't match then update id, date, username
    if row.icbc_vehicle_id != vehicle_id:
        row.icbc_vehicle_id = vehicle_id
        row.icbc_upload_date_id = icbc_upload_date_id
        row.update_user = requesting_user
        row.save()
        return (0, 1)

    return (0, 0)


def process_chunk_rows(
    df_ch, model_years, icbc_vehicles, icbc_upload_date_id, requesting_user
):
    """
    Process all rows in a dataframe chunk.
    Returns (created_count, updated_count)
    """
    created_count = 0
    updated_count = 0

    for _, row in df_ch.iterrows():
        icbc_vehicle_year = str(int(row["MODEL_YEAR"])).strip()
        icbc_vehicle_model = str(row["MODEL"]).upper().strip()
        icbc_vehicle_make = str(row["MAKE"]).upper().strip()
        icbc_vehicle_vin = str(row["VIN"]).upper().strip()

        # Find Model Year ID
        icbc_vehicle_year_id = find_model_year_id(model_years, icbc_vehicle_year)

        # Find or create Vehicle
        vehicle_id = find_vehicle_id(
            icbc_vehicles, icbc_vehicle_model, icbc_vehicle_year, icbc_vehicle_make
        )
        if vehicle_id is None:
            vehicle_id = create_or_get_vehicle(
                icbc_vehicle_model,
                icbc_vehicle_year_id,
                icbc_vehicle_make,
                requesting_user,
            )

        # Process registration record
        (created, updated) = process_registration_record(
            icbc_vehicle_vin, vehicle_id, icbc_upload_date_id, requesting_user
        )
        created_count += created
        updated_count += updated

    return (created_count, updated_count)


def ingest_icbc_spreadsheet(
    current_excelfile, previous_excelfile, upload_obj, current_progress, progress_end
):
    progress_initial_part = 40
    progress_initial_steps = 4
    progress_elements = []
    if current_progress > progress_end or current_progress > progress_initial_part:
        raise Exception("Invalid progress inputs!")
    increment_initial = (progress_initial_part - current_progress) // (
        progress_initial_steps
    )
    for step in range(progress_initial_steps):
        progress_elements.append(current_progress + (increment_initial * (step + 1)))

    start_time = time.time()

    print("Processing Started")
    set_upload_progress(
        upload_obj, progress_elements.pop(0), "Reading previous file...", 0, 0, False
    )

    # Read previous file
    df_p = read_csv_file(previous_excelfile, "PREVIOUS")
    print("Read previous file", time.time() - start_time)
    print("Previous file rows", len(df_p))

    set_upload_progress(
        upload_obj, progress_elements.pop(0), "Reading latest file...", 0, 0, False
    )

    # Read latest file
    df_l = read_csv_file(current_excelfile, "LATEST")
    print("Read latest file", time.time() - start_time)
    print("Latest file rows", len(df_l))

    set_upload_progress(
        upload_obj, progress_elements.pop(0), "Comparing files...", 0, 0, False
    )

    df_p = pd.DataFrame(df_p, columns=["MODEL_YEAR", "MAKE", "MODEL", "VIN", "SOURCE"])
    df_l = pd.DataFrame(df_l, columns=["MODEL_YEAR", "MAKE", "MODEL", "VIN", "SOURCE"])

    # Calculate any changes in the data between files
    c_result = compare_dataframes(df_p, df_l)
    print("Compared files", time.time() - start_time)
    print("Changed rows", c_result.shape)

    # If no changes detected, update filename and return
    if c_result.empty:
        print("No file changes detected.")
        return (True, 0, 0)

    chunks = np.array_split(c_result, int(math.ceil(c_result.shape[0] / 25000)))
    total_pages = len(chunks)
    print("Number of Pages to process", total_pages)

    set_upload_progress(
        upload_obj,
        progress_elements.pop(0),
        f"Processing {total_pages} pages...",
        0,
        total_pages,
        False,
    )

    increment_secondary = (progress_end - progress_initial_part) // (total_pages + 1)
    for page in range(total_pages + 1):
        progress_elements.append(
            progress_initial_part + (increment_secondary * (page + 1))
        )

    icbc_vehicles = IcbcVehicle.objects.all()
    print("icbc_vehicles count:", len(icbc_vehicles))

    # Process chunks
    created_records_count = 0
    updated_records_count = 0
    page_count = 0

    for df_ch in chunks:
        chunk_time = time.time()

        print("Processing page: " + str(page_count))
        print("Row Count: " + str(df_ch.shape[0]))
        page_count += 1

        if df_ch.shape[0] <= 0:
            continue

        unique_model_years = df_ch["MODEL_YEAR"].unique()
        model_years = create_or_get_model_years(
            unique_model_years, upload_obj.create_user
        )

        with transaction.atomic():
            (created, updated) = process_chunk_rows(
                df_ch,
                model_years,
                icbc_vehicles,
                upload_obj.id,
                upload_obj.create_user,
            )
            created_records_count += created
            updated_records_count += updated

            set_upload_progress(
                upload_obj,
                progress_elements.pop(0),
                f"Processing page {page_count} of {total_pages}...",
                page_count,
                total_pages,
                False,
            )

        print("Page Time: ", time.time() - chunk_time)

    set_upload_progress(
        upload_obj,
        progress_elements.pop(0),
        "Finalizing...",
        total_pages,
        total_pages,
        False,
    )
    print("Total processing time: ", time.time() - start_time)

    return (True, created_records_count, updated_records_count)


# meant to be used in a thread not managed by the django request-response lifecycle
def process_upload(upload_obj, filename):
    previous_file = None
    current_file = None
    try:
        current_progress = get_upload_progress(upload_obj)
        if current_progress["progress"] != 0:
            raise Exception("Invalid current progress!")
        set_upload_progress(
            upload_obj, 5, "Getting previous upload data...", 0, 0, False
        )
        # get previous upload file so we can compare
        last_icbc_date = (
            IcbcUploadDate.objects.exclude(filename__isnull=True)
            .exclude(id=upload_obj.id)
            .latest("create_timestamp")
        )
        print("Last upload date", last_icbc_date.upload_date)

        # get previous file
        previous_filename = last_icbc_date.filename
        print("Downloading previous file", previous_filename)
        set_upload_progress(upload_obj, 10, "Downloading previous file...", 0, 0, False)
        previous_file = get_minio_object(previous_filename)

        # get latest file
        print("Downloading latest file", filename)
        set_upload_progress(upload_obj, 15, "Downloading latest file...", 0, 0, False)
        current_file = get_minio_object(filename)

        print("Starting Ingest")
        set_upload_progress(upload_obj, 20, "Starting data processing...", 0, 0, False)

        done = ingest_icbc_spreadsheet(current_file, previous_file, upload_obj, 20, 95)

        if done[0]:
            # We remove the previous file from minio but keep the
            # latest one so we can use it for compare on next upload
            with transaction.atomic():
                IcbcUploadProgress.objects.filter(upload=upload_obj).update(
                    results={
                        "dateCurrentTo": upload_obj.upload_date,
                        "createdRecords": done[1],
                        "updatedRecords": done[2],
                    },
                    update_timestamp=timezone.now(),
                )
                set_upload_progress(
                    upload_obj, 100, "Processing complete!", 0, 0, True, error=None
                )
                upload_obj.filename = filename
                upload_obj.save()
                minio_remove_object(previous_filename)
                print("Done processing")

    except Exception as error:
        traceback.print_exc()
        set_upload_progress(
            upload_obj, 0, "Error occurred", 0, 0, True, error=str(error)
        )

    finally:
        if previous_file:
            previous_file.close()
            previous_file.release_conn()
        if current_file:
            current_file.close()
            current_file.release_conn()
        connection.close()
