import pandas as pd
import numpy as np
import math
import time
from django.db import transaction
from datetime import datetime
from dateutil.relativedelta import relativedelta
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.icbc_vehicle import IcbcVehicle
from api.models.model_year import ModelYear
from api.models.icbc_upload_date import IcbcUploadDate


def trim_all_columns(df):
    """
    Trim whitespace from ends of each value across all series in dataframe
    """
    trim_strings = lambda x: x.strip() if isinstance(x, str) else x
    return df.applymap(trim_strings)


def format_dataframe(df):
    df = df[
        (df['HYBRID_VEHICLE_FLAG'] != 'N') |
        (df['ELECTRIC_VEHICLE_FLAG'] != 'N') |
        (df['FUEL_TYPE'].str.upper() == 'ELECTRIC') |
        (df['FUEL_TYPE'].str.upper() == 'HYDROGEN') |
        (df['FUEL_TYPE'].str.upper() == 'GASOLINEELECTRIC')
    ]

    df['MODEL_YEAR'].fillna(0, inplace=True)
    df['MODEL_YEAR'] = pd.to_numeric(df['MODEL_YEAR'])
    df.drop(df[df['MODEL_YEAR'] <= 2018].index, inplace = True)

    df['VIN'].fillna(0, inplace=True)
    df.drop(df[df['VIN'] == 0].index, inplace = True)

    df = df[['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN']]

    return df


def read_csv_file(filepath, source_label):
    """
    Read CSV file in chunks and return as list of values.
    """
    df_list = []
    for df in pd.read_csv(
        filepath, sep=",", error_bad_lines=False, iterator=True, low_memory=True,
        chunksize=50000, header=0
    ):
        df['SOURCE'] = source_label
        df_list.extend(df.values.tolist())
    return df_list


def compare_dataframes(df_previous, df_latest):
    """
    Compare two dataframes and return rows that are new or changed in the latest.
    """
    c_result = pd.concat([df_previous, df_latest]).drop_duplicates(
        subset=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN']
    ).reset_index(drop=True)
    return c_result[c_result['SOURCE'] == 'LATEST']


def create_or_get_model_years(unique_model_years, requesting_user):
    """
    Create or get ModelYear objects for the given years.
    """
    model_years = []
    for unique_model_year in unique_model_years:
        eff_date = datetime.strptime(str(unique_model_year), '%Y')
        exp_date = eff_date + relativedelta(years=1) - relativedelta(days=1)
        (model_year, _) = ModelYear.objects.get_or_create(
            name=unique_model_year,
            defaults={
                'create_user': requesting_user.username,
                'update_user': requesting_user.username,
                'effective_date': eff_date,
                'expiration_date': exp_date
            }
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


def find_vehicle_id(icbc_vehicles, icbc_vehicle_model, icbc_vehicle_year, icbc_vehicle_make):
    """
    Find the vehicle ID from the list of ICBC vehicles.
    """
    for vh in icbc_vehicles:
        if (vh.model_name == icbc_vehicle_model and 
            vh.model_year == icbc_vehicle_year and 
            vh.make == icbc_vehicle_make):
            return vh.id
    return None


def create_or_get_vehicle(icbc_vehicle_model, icbc_vehicle_year_id, icbc_vehicle_make, requesting_user):
    """
    Create or get an IcbcVehicle.
    """
    (vehicle, _) = IcbcVehicle.objects.get_or_create(
        model_name=icbc_vehicle_model,
        model_year_id=icbc_vehicle_year_id,
        make=icbc_vehicle_make,
        defaults={
            'create_user': requesting_user.username,
            'update_user': requesting_user.username
        }
    )
    return vehicle.id


def process_registration_record(icbc_vehicle_vin, vehicle_id, current_to_date, requesting_user):
    """
    Create or update an ICBC registration data record.
    Returns (created_count, updated_count)
    """
    (row, created) = IcbcRegistrationData.objects.get_or_create(
        vin=icbc_vehicle_vin,
        defaults={
            'create_user': requesting_user.username,
            'update_user': requesting_user.username,
            'icbc_vehicle_id': vehicle_id,
            'icbc_upload_date_id': current_to_date.id
        }
    )
    
    if created:
        return (1, 0)
    
    # if vehicle id doesn't match then update id, date, username
    if row.icbc_vehicle_id != vehicle_id:
        row.icbc_vehicle_id = vehicle_id
        row.icbc_upload_date_id = current_to_date.id
        row.update_user = requesting_user.username
        row.save()
        return (0, 1)
    
    return (0, 0)


def process_chunk_rows(df_ch, model_years, icbc_vehicles, current_to_date, requesting_user):
    """
    Process all rows in a dataframe chunk.
    Returns (created_count, updated_count)
    """
    created_count = 0
    updated_count = 0
    
    for _, row in df_ch.iterrows():
        icbc_vehicle_year = str(int(row['MODEL_YEAR'])).strip()
        icbc_vehicle_model = str(row['MODEL']).upper().strip()
        icbc_vehicle_make = str(row['MAKE']).upper().strip()
        icbc_vehicle_vin = str(row['VIN']).upper().strip()

        # Find Model Year ID
        icbc_vehicle_year_id = find_model_year_id(model_years, icbc_vehicle_year)

        # Find or create Vehicle
        vehicle_id = find_vehicle_id(icbc_vehicles, icbc_vehicle_model, icbc_vehicle_year, icbc_vehicle_make)
        if vehicle_id is None:
            vehicle_id = create_or_get_vehicle(
                icbc_vehicle_model, icbc_vehicle_year_id, icbc_vehicle_make, requesting_user
            )
        
        # Process registration record
        (created, updated) = process_registration_record(
            icbc_vehicle_vin, vehicle_id, current_to_date, requesting_user
        )
        created_count += created
        updated_count += updated
    
    return (created_count, updated_count)


@transaction.atomic
def ingest_icbc_spreadsheet(current_excelfile, current_excelfile_name, requesting_user, dateCurrentTo, previous_excelfile, upload_id=None):
    try:
        start_time = time.time()
        
        # Import progress tracking function if upload_id provided
        if upload_id:
            from api.viewsets.icbc_verification import set_upload_progress

        current_to_date = IcbcUploadDate.objects.create(
            upload_date=dateCurrentTo,
            create_user=requesting_user.username,
            update_user=requesting_user.username,
        )

        print("Processing Started")
        if upload_id:
            set_upload_progress(upload_id, 25, 'Reading previous file...', 0, 0, False)

        # Read previous file
        df_p = read_csv_file(previous_excelfile, 'PREVIOUS')
        print("Read previous file", time.time() - start_time)
        print("Previous file rows", len(df_p))
        
        if upload_id:
            set_upload_progress(upload_id, 30, 'Reading latest file...', 0, 0, False)

        # Read latest file
        df_l = read_csv_file(current_excelfile, 'LATEST')
        print("Read latest file", time.time() - start_time)
        print("Latest file rows", len(df_l))
        
        if upload_id:
            set_upload_progress(upload_id, 35, 'Comparing files...', 0, 0, False)

        df_p = pd.DataFrame(df_p, columns=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN', 'SOURCE'])
        df_l = pd.DataFrame(df_l, columns=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN', 'SOURCE'])

        # Calculate any changes in the data between files
        c_result = compare_dataframes(df_p, df_l)
        print("Compared files", time.time() - start_time)
        print("Changed rows", c_result.shape)

        # If no changes detected, update filename and return
        if c_result.empty:
            print("No file changes detected.")
            current_to_date.filename = current_excelfile_name
            current_to_date.save()
            return (True, 0, 0)

        chunks = np.array_split(c_result, int(math.ceil(c_result.shape[0] / 25000)))
        total_pages = len(chunks)
        print("Number of Pages to process", total_pages)
        
        if upload_id:
            set_upload_progress(upload_id, 40, f'Processing {total_pages} pages...', 0, total_pages, False)

        icbc_vehicles = IcbcVehicle.objects.all()
        print("icbc_vehicles count:", len(icbc_vehicles))

        # Process chunks
        created_records_count = 0
        updated_records_count = 0
        page_count = 0
        
        for df_ch in chunks:
            chunk_time = time.time()
            # Keep the db connection alive
            _ = IcbcUploadDate.objects.get(id=current_to_date.id)

            print('Processing page: ' + str(page_count))
            print('Row Count: ' + str(df_ch.shape[0]))
            page_count += 1
            
            # Update progress for each page
            if upload_id:
                progress = 40 + int((page_count / total_pages) * 55)
                set_upload_progress(
                    upload_id, 
                    progress, 
                    f'Processing page {page_count} of {total_pages}...', 
                    page_count, 
                    total_pages, 
                    False
                )

            if df_ch.shape[0] <= 0:
                continue

            unique_model_years = df_ch['MODEL_YEAR'].unique()
            model_years = create_or_get_model_years(unique_model_years, requesting_user)

            try:
                with transaction.atomic():
                    (created, updated) = process_chunk_rows(
                        df_ch, model_years, icbc_vehicles, current_to_date, requesting_user
                    )
                    created_records_count += created
                    updated_records_count += updated
            except Exception as e:
                print(e)

            print("Page Time: ", time.time() - chunk_time)

        # Update filename after successful processing
        current_to_date.filename = current_excelfile_name
        current_to_date.save()
        
        if upload_id:
            set_upload_progress(upload_id, 95, 'Finalizing...', total_pages, total_pages, False)

        print("Total processing time: ", time.time() - start_time)

        return (True, created_records_count, updated_records_count)
    except Exception as e:
        print(e)
