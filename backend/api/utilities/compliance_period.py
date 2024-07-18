def get_compliance_year(timestamp):
    year = timestamp.year
    month = timestamp.month
    if month <= 9:
        return year - 1
    return year
