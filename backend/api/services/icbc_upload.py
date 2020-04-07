import xlrd
import xlwt
from xlrd import XLRDError, XLDateError

def ingest_icbc_spreadsheet(data):
    print('Opening spreadsheet')
    wb = xlrd.open_workbook(file_contents=data)
    print('wb open!')
    validation_problems = []
    entries = []
    try:
        print('wb open')
        # get the first worksheet
        first_sheet = wb.sheet_by_index(0)
        # read a row
        print(first_sheet.row_values(0))
    except:
        print("AAAHHHHHH~~~!!!!!!")