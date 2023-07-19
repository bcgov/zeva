import string
import pandas as pd
import argparse
import random

# This script will create a fake excel sales spreadsheet with fake VIN's and a corresponding ICBC csv data file for testing purposes.
# HOW TO USE ARGS:
# -y (year(s) of model(s) in order)
# -ma (make of the car(s))
# -mo (model name(s) in the same order as the years they correspond with)
# -v (fake vin prefix(es) in the same order of each make/year before the random serial. I generated this by asking ChatGPT for a hypothetical vin for the specific model and company I was generating sales for)
# -a (amount of sales for each model)
# -p (path to save the file to)
#
# EXAMPLE:
# python3 vinCreator.py -y 2019,2020,2021 -ma BMW -mo "i3 RSX",R3x,Cooper -v WBA8E3C57NU,WBA5B1C50NU,WBA4J7C51NU -a 150 -p /Users/julianforeman/Desktop

def parse_list_or_single_int(s):
    try:
        return [int(item) for item in s.split(',')]
    except ValueError:
        return int(s)

def parse_list_or_single_string(s):
    try:
        return [str(item) for item in s.split(',')]
    except ValueError:
        return int(s)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("-y", "--years", type=parse_list_or_single_int)
    parser.add_argument("-ma", "--make", type=str)
    parser.add_argument("-mo", "--models", type=parse_list_or_single_string)
    parser.add_argument("-v", "--vinprefix", type=parse_list_or_single_string)
    parser.add_argument("-a", "--amount", type=int)
    parser.add_argument("-p", "--path", type=str)

    return parser.parse_args()

args = parse_args()

years = args.years
make = args.make
models = args.models
vinStarts = args.vinprefix
sales_data = []
icbc_data = []

for i, year in enumerate(years):
    existingSerials = []
    index = i
    for i in range(args.amount):
        serial = None
        while serial in existingSerials or serial is None:
            serial = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if (serial not in existingSerials):
                existingSerials.append(serial)
                sales_data_entry = [year, make, models[index], vinStarts[index] + serial, str(years[index]) + '-06-15']
                sales_data.append(sales_data_entry)
                icbc_data_entry = [year, make, models[index], vinStarts[index] + serial]
                icbc_data.append(icbc_data_entry)
                break

df = pd.DataFrame(sales_data, columns=['Model Year', 'Make', 'Vehicle Model', 'VIN', 'Retail Sales Date (yyyy-mm-dd)'])

df_icbc = pd.DataFrame(icbc_data, columns=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN'])

df.to_excel(args.path + make + '_sales.xlsx', index=False, sheet_name=make + '_sales')
df_icbc.to_csv(args.path + make + '_icbc.csv', index=False)
