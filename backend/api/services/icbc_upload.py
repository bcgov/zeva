import pandas as pd
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


def ingest_icbc_spreadsheet(excelfile, requesting_user, dateCurrentTo):
    # insert entry into the icbc upload date table
    current_to_date = IcbcUploadDate.objects.create(
        upload_date=dateCurrentTo,
        create_user=requesting_user.username,
        update_user=requesting_user.username,
        )

    for df in pd.read_csv(excelfile, sep="|", error_bad_lines=False, iterator=True, chunksize=1000):
        df = df[(df.MODEL_YEAR > 2018)]
        df = df[(df.HYBRID_VEHICLE_FLAG != 'N') | (df.ELECTRIC_VEHICLE_FLAG != 'N')]
        df['MODEL_YEAR'].fillna(0, inplace=True)
        df['VIN'].fillna(0, inplace=True)
        df = df[(df.VIN != 0)]
        # df.drop(df.columns.difference([
        #     'VIN',
        #     'MODEL',
        #     'MODEL_YEAR',
        #     'MAKE',
        #     'HYBRID_VEHICLE_FLAG',
        #     'ELECTRIC_VEHICLE_FLAG'
        # ]), 1, inplace=True)
        # df = trim_all_columns(df)

        # pd.options.display.float_format = '{:.0f}'.format
        try:
            # iterate through df and check if vehicle exists, if it doesn't, add it!
            for index, row in df.iterrows():
                icbc_vehicle_model = str(row['MODEL']).upper().strip()
                icbc_vehicle_year = str(int(row['MODEL_YEAR'])).strip()
                icbc_vehicle_make = str(row['MAKE']).upper().strip()
                icbc_vehicle_vin = str(row['VIN']).upper().strip()

                with transaction.atomic():
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

                    IcbcRegistrationData.objects.get_or_create(
                        vin=icbc_vehicle_vin,
                        defaults={
                            'create_user': requesting_user.username,
                            'update_user': requesting_user.username,
                            'icbc_vehicle_id': vehicle_id,
                            'icbc_upload_date_id': current_to_date.id
                        })
        except Exception as e:
            print(e)

    return True
