const CREDIT_ERROR_CODES = {
  DUPLICATE_VIN: {
    errorCode: 31,
    errorField: 'vin'
  },
  EXPIRED_REGISTRATION_DATE: {
    errorCode: 51,
    errorField: 'sales-date'
  },
  INVALID_DATE: {
    errorCode: 61,
    errorField: 'sales-date'
  },
  INVALID_MODEL: {
    errorCode: 41,
    errorField: 'model-year make model'
  },
  MODEL_YEAR_MISMATCHED: {
    errorCode: 41,
    errorField: 'icbc-model-year'
  },
  MAKE_MISMATCHED: {
    errorCode: 41,
    errorField: 'icbc-make'
  },
  NO_ICBC_MATCH: {
    errorCode: 11,
    errorField: 'vin'
  },
  ROW_NOT_SELECTED: {
    errorCode: '',
    errorField: ''
  },
  VIN_ALREADY_AWARDED: {
    errorCode: 21,
    errorField: 'vin'
  },
  WRONG_MODEL_YEAR: {
    errorCode: 71,
    errorField: 'model-year'
  }
}

export default CREDIT_ERROR_CODES
