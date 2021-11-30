import pandas as pd
import math
from django.db import transaction

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


@transaction.atomic
def ingest_icbc_spreadsheet(excelfile, requesting_user, dateCurrentTo):
    current_to_date = IcbcUploadDate.objects.create(
        upload_date=dateCurrentTo,
        create_user=requesting_user.username,
        update_user=requesting_user.username,
    )

    page_count = 0

    df = pd.read_csv(excelfile, sep="|", memory_map=True, nrows=1)
    df.columns = map(str.upper, df.columns)
    header_names = list(df.columns.values)

    number_of_rows = sum(1 for _ in open(excelfile))
    number_of_pages = 1
    if number_of_rows > 50000:
        number_of_pages = int(math.ceil(number_of_rows / 50000))

    x = range(number_of_pages)
    for n in x:
        for df in pd.read_csv(
                excelfile, sep="|", error_bad_lines=False, iterator=True,
                chunksize=50000, memory_map=True, nrows=50000,
                header=None,
                names=header_names,
                skiprows=(n * 50000) + 1
        ):
            print('Processing page: ' + str(page_count))
            page_count += 1

            df['MODEL_YEAR'].fillna(0, inplace=True)
            df['VIN'].fillna(0, inplace=True)

            df.query('MODEL_YEAR > 2018', inplace=True)
            # df = df[(df.MODEL_YEAR > 2018)]
            df.query('MODEL_YEAR > 2018', inplace=True)
            df.query('HYBRID_VEHICLE_FLAG != "N"', inplace=True)
            df.query('ELECTRIC_VEHICLE_FLAG != "N"', inplace=True)
            df['FUEL_TYPE'] = df['FUEL_TYPE'].str.upper()
            df.query('FUEL_TYPE in ["ELECTRIC", "HYDROGEN", "GASOLINEELECTRIC"]')
            # df = df[
            #     (df.HYBRID_VEHICLE_FLAG != 'N') |
            #     (df.ELECTRIC_VEHICLE_FLAG != 'N') |
            #     (df.FUEL_TYPE.str.upper() == 'ELECTRIC') |
            #     (df.FUEL_TYPE.str.upper() == 'HYDROGEN') |
            #     (df.FUEL_TYPE.str.upper() == 'GASOLINEELECTRIC')
            # ]
            df.query('VIN != 0')
            # df = df[(df.VIN != 0)]

            # pd.options.display.float_format = '{:.0f}'.format
            try:
                # iterate through df and check if vehicle exists, if it doesn't,
                # add it!
                with transaction.atomic():
                    for _, row in df.iterrows():
                        icbc_vehicle_model = str(row['MODEL']).upper().strip()
                        icbc_vehicle_year = str(int(row['MODEL_YEAR'])).strip()
                        icbc_vehicle_make = str(row['MAKE']).upper().strip()
                        icbc_vehicle_vin = str(row['VIN']).upper().strip()

                        (model_year, _) = ModelYear.objects.get_or_create(
                            name=icbc_vehicle_year,
                            defaults={
                                'create_user': requesting_user.username,
                                'update_user': requesting_user.username
                            })
                        icbc_vehicle_year_id = model_year.id

                        (vehicle, _) = IcbcVehicle.objects.get_or_create(
                                model_name=icbc_vehicle_model,
                                model_year_id=icbc_vehicle_year_id,
                                make=icbc_vehicle_make,
                                defaults={
                                    'create_user': requesting_user.username,
                                    'update_user': requesting_user.username
                                })
                        vehicle_id = vehicle.id

                        (row, created) = IcbcRegistrationData.objects.get_or_create(
                            vin=icbc_vehicle_vin,
                            defaults={
                                'create_user': requesting_user.username,
                                'update_user': requesting_user.username,
                                'icbc_vehicle_id': vehicle_id,
                                'icbc_upload_date_id': current_to_date.id
                            })

                        if not created and row.icbc_vehicle_id != vehicle_id:
                            row.icbc_vehicle_id = vehicle_id
                            row.icbc_upload_date_id = current_to_date.id
                            row.update_user = requesting_user.username
                            row.save()

            except Exception as e:
                print(e)

    return True
