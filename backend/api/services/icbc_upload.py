import pandas as pd
from django.core.exceptions import ObjectDoesNotExist
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


def ingest_icbc_spreadsheet(excelfile, requesting_user):
    df = pd.read_csv(excelfile, sep="|", error_bad_lines=False)
    df.drop(df[(df.HYBRID_VEHICLE_FLAG == 'N') &
            (df.ELECTRIC_VEHICLE_FLAG == 'N')].index, inplace=True)
    df['MODEL_YEAR'].fillna(0, inplace=True)
    df['VIN'].fillna(0, inplace=True)
    df.drop(df[(df.MODEL_YEAR < 2019)].index, inplace=True)
    df.drop(df[(df.VIN == 0)].index, inplace=True)
    df.drop(df.columns.difference([
      'VIN',
      'MODEL',
      'MODEL_YEAR',
      'MAKE']), 1, inplace=True)
    df = trim_all_columns(df)
    df["MODEL"] = df["MODEL"].str.upper()
    df["MAKE"]= df["MAKE"].str.upper()
    df["MODEL_YEAR"] = df["MODEL_YEAR"].astype(int)
    # pd.options.display.float_format = '{:.0f}'.format
    try:
        #insert entry into the icbc upload date table
        today_date = IcbcUploadDate.objects.create(
            create_user=requesting_user.username,
            update_user=requesting_user.username,
            )

        #iterate through df and check if vehicle exists, if it doesn't, add it!
        for index, row in df.iterrows():
            icbc_vehicle_model = row['MODEL']
            icbc_vehicle_year = row['MODEL_YEAR']
            icbc_vehicle_make = row['MAKE']
            icbc_vehicle_vin = row['VIN']

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

            (icbc_registration, _) = IcbcRegistrationData.objects.get_or_create(
                vin=icbc_vehicle_vin,
                defaults={
                    'create_user': requesting_user.username,
                    'update_user': requesting_user.username,
                    'icbc_vehicle_id': vehicle_id,
                    'icbc_upload_date_id': today_date.id
                })
    except Exception as e: 
        print(e)