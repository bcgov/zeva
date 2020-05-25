import pandas as pd
from django.core.exceptions import ObjectDoesNotExist
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.icbc_vehicle import IcbcVehicle
from api.models.model_year import ModelYear


def insert_to_db(data_frame, list_name, table, col_name, requesting_user):
    for each in list_name:
        try:
            #get the id of that value from the table
            the_id = table.objects.get(name=each).id
        except ObjectDoesNotExist:
            new_addition = table.objects.create(
                create_user=requesting_user.username,
                update_user=requesting_user.username,
                name=each
            )
            new_addition.save()
            the_id = table.objects.get(name=each).id
        finally:
            #replace the value in the df with the id
            data_frame[col_name] = data_frame[col_name].replace(each, the_id)


def ingest_icbc_spreadsheet(excelfile, requesting_user):
    raw_data = pd.read_excel(excelfile)
    df = raw_data.iloc[:, 0].str.split('|', expand=True)
    df.columns = [n.replace('"', '') for n in raw_data.columns.str.split('|')[0]]
    df.drop(df[(df.HYBRID_VEHICLE_FLAG == 'N') &
            (df.ELECTRIC_VEHICLE_FLAG == 'N')].index, inplace=True)
    df.drop(df[(df.MODEL_YEAR < '2019')].index, inplace=True)
    df.drop(df.columns.difference([
      'VIN',
      'MODEL',
      'MODEL_YEAR',
      'MAKE']), 1, inplace=True)
    try:
        #make list of all years, makes, models in df
        icbc_years = list(df.MODEL_YEAR.unique())
        icbc_makes = list(df.MAKE.unique())
        insert_to_db(
            df,
            icbc_years,
            ModelYear,
            'MODEL_YEAR',
            requesting_user)
        #iterate through df and check if vehicle exists, if it doesn't, add it!
        for index, row in df.iterrows():
            icbc_vehicle_model = row['MODEL']
            icbc_vehicle_year = row['MODEL_YEAR']
            icbc_vehicle_make = row['MAKE']
            icbc_vehicle_vin = row['VIN']
            try:
              #check to see if there's already a vehicle id, add it if not
                vehicle_id = IcbcVehicle.objects.get(
                    model_name=icbc_vehicle_model,
                    model_year_id=icbc_vehicle_year,
                    make=icbc_vehicle_make).id
            except ObjectDoesNotExist:
                new_vehicle = IcbcVehicle.objects.create(
                    create_user=requesting_user.username,
                    update_user=requesting_user.username,
                    model_name=icbc_vehicle_model,
                    model_year_id=icbc_vehicle_year,
                    make=icbc_vehicle_make
                    )
                new_vehicle.save()
                vehicle_id = IcbcVehicle.objects.get(
                  model_name=icbc_vehicle_model,
                  model_year_id=icbc_vehicle_year,
                  make=icbc_vehicle_make).id

            if vehicle_id:
                try:
                    #it shouldn't be in the icbc table unless it's a duplicate. 
                    icbc_reg_id = IcbcRegistrationData.objects.get(
                        vin=icbc_vehicle_vin).id
                    print('VIN {vin} already exists in registration table.\
                      Please see record #{id}'.format(
                        vin=icbc_vehicle_vin, id=icbc_reg_id))
                    pass
                except ObjectDoesNotExist:
                    new_registration = IcbcRegistrationData.objects.create(
                      create_user=requesting_user.username,
                      update_user=requesting_user.username,
                      icbc_vehicle_id=vehicle_id,
                      vin=icbc_vehicle_vin
                    )
                    new_registration.save()
    except Exception as e: 
        print(e)