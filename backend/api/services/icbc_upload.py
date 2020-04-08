import xlrd
import xlwt
from xlrd import XLRDError, XLDateError
import pandas as pd


def ingest_icbc_spreadsheet(excelfile):
    print('Opening spreadsheet')
    raw_data = pd.read_excel(excelfile)
    validation_problems = []
    entries = []
    try:
        print('wb open')
        # raw_df = pd.DataFrame(raw_data)
        df = raw_data.iloc[:, 0].str.split('|', expand=True)
        df.columns = [n.replace('"', '') for n in raw_data.columns.str.split('|')[0]]
        df.drop(df.columns.difference(['VIN','MODEL', 'MODEL_YEAR', 'MAKE']), 1, inplace=True)
        print(df)
        
    except:
        print("AAAHHHHHH~~~!!!!!!")