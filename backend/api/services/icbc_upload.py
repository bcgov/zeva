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


@transaction.atomic
def ingest_icbc_spreadsheet(current_excelfile, current_excelfile_name, requesting_user, dateCurrentTo, previous_excelfile):
    try:
        start_time = time.time()

        current_to_date = IcbcUploadDate.objects.create(
            upload_date=dateCurrentTo,
            create_user=requesting_user.username,
            update_user=requesting_user.username,
        )

        page_count = 0

        print("Processing Started")

        # Previous file processing
        df_p = []
        for df in pd.read_csv(
            previous_excelfile, sep=",", error_bad_lines=False, iterator=True, low_memory=True,
            chunksize=50000, header=0
        ):
            # df = format_dataframe(df) # pre-processing manually for now
            df['SOURCE'] = 'PREVIOUS'
            df_p.extend(df.values.tolist())

        print("Read previous file", time.time() - start_time)
        print("Previous file rows", len(df_p))

        # Latest file processing
        df_l = []
        for df in pd.read_csv(
            current_excelfile, sep=",", error_bad_lines=False, iterator=True, low_memory=True,
            chunksize=50000, header=0
        ):
            # df = format_dataframe(df) # pre-processing manually for now
            df['SOURCE'] = 'LATEST'
            df_l.extend(df.values.tolist())

        print("Read latest file", time.time() - start_time)
        print("Latest file rows", len(df_l))

        df_p = pd.DataFrame(df_p, columns=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN', 'SOURCE'])
        df_l = pd.DataFrame(df_l, columns=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN', 'SOURCE'])

        # calculate any changes in the data between the latest file and the previously uploaded file
        c_result = pd.concat([df_p, df_l]).drop_duplicates(subset=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN']).reset_index(drop=True)
        c_result = c_result[c_result['SOURCE'] == 'LATEST']
        print("Compared files", time.time() - start_time)
        print("Changed rows", c_result.shape)

        # If no changes detected then we end here
        # and update the IcbcUploadDate Filename to the
        # latest filename
        if c_result.empty:
            print("No file changes detected.")
            current_to_date.filename = current_excelfile_name
            current_to_date.save()
            return (True, 0, 0)

        chunks = np.array_split(c_result, int(math.ceil(c_result.shape[0] / 25000)))
        print("Number of Pages to process", len(chunks))

        icbc_vehicles = IcbcVehicle.objects.all()
        print("icbc_vehicles count:", len(icbc_vehicles))

        # stats variables
        created_records_count = 0
        updated_records_count = 0
        for df_ch in chunks:
            chunk_time = time.time()
            # This tells postgres to keep the db connection alive
            _ = IcbcUploadDate.objects.get(
                id=current_to_date.id
            )

            print('Processing page: ' + str(page_count))
            print('Row Count: ' + str(df_ch.shape[0]))
            page_count += 1

            if df_ch.shape[0] <= 0:
                continue

            unique_model_years = df_ch['MODEL_YEAR'].unique()
            # unique_models = df_ch['MODEL'].unique()
            # unique_makes = df_ch['MAKE'].unique()
            # unique_vins = df_ch['VIN'].unique()
            # print("unique_model_years", unique_model_years.shape[0])
            # print("unique_models", unique_models.shape[0])
            # print("unique_makes", unique_makes.shape[0])
            # print("unique_vins", unique_vins.shape[0])

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
                            })
                model_years.append(model_year)

            try:
                with transaction.atomic():
                    for _, row in df_ch.iterrows():
                        icbc_vehicle_year = str(int(row['MODEL_YEAR'])).strip()
                        icbc_vehicle_model = str(row['MODEL']).upper().strip()
                        icbc_vehicle_make = str(row['MAKE']).upper().strip()
                        icbc_vehicle_vin = str(row['VIN']).upper().strip()

                        # Searching for Model Year
                        for model_year in model_years:
                            if model_year.name == icbc_vehicle_year:
                                icbc_vehicle_year_id = model_year.id

                        # Searching for Vehicle Id
                        vehicle_id = None
                        for vh in icbc_vehicles:
                            if vh.model_name == icbc_vehicle_model \
                              and vh.model_year == icbc_vehicle_year \
                                and vh.make == icbc_vehicle_make:
                                    vehicle_id = vh.id
                                    break
                        
                        # Create new vehicle
                        if vehicle_id == None:
                            (vehicle, _) = IcbcVehicle.objects.get_or_create(
                                    model_name=icbc_vehicle_model,
                                    model_year_id=icbc_vehicle_year_id,
                                    make=icbc_vehicle_make,
                                    defaults={
                                        'create_user': requesting_user.username,
                                        'update_user': requesting_user.username
                                    })
                            vehicle_id = vehicle.id
                        
                        # Create new vin record
                        (row, created) = IcbcRegistrationData.objects.get_or_create(
                            vin=icbc_vehicle_vin,
                            defaults={
                                'create_user': requesting_user.username,
                                'update_user': requesting_user.username,
                                'icbc_vehicle_id': vehicle_id,
                                'icbc_upload_date_id': current_to_date.id
                            })
                        
                        if created:
                            created_records_count += 1

                        # if vehicle id doesn't match then update id, date, username
                        if not created and row.icbc_vehicle_id != vehicle_id:
                            row.icbc_vehicle_id = vehicle_id
                            row.icbc_upload_date_id = current_to_date.id
                            row.update_user = requesting_user.username
                            row.save()
                            updated_records_count += 1

            except Exception as e:
                print(e)

            print("Page Time: ", time.time() - chunk_time)

        """ Update IcbcUploadDate filename now that processing 
        has completed. If the upload failed then the IcbcUploadDate
        object will have an empty filename which we can skip on
        next upload """
        current_to_date.filename = current_excelfile_name
        current_to_date.save()

        print("Total processing time: ", time.time() - start_time)

        return (True, created_records_count, updated_records_count)
    except Exception as e:
        print(e)
