export const CREDIT_ERROR_CODES = {
  DUPLICATE_VIN: {
    errorCode: 31,
    errorField: 'vin',
  },
  EXPIRED_REGISTRATION_DATE: {
    errorCode: 51,
    errorField: 'sales-date',
  },
  INVALID_DATE: {
    errorCode: 71,
    errorField: 'sales-date'
  },
  INVALID_MODEL: {
    errorCode: 61,
    errorField: 'model-year make model',
  },
  MODEL_MISMATCHED: {
    errorCode: 41,
    errorField: 'icbc-model-year icbc-make icbc-model'
  },
  NO_ICBC_MATCH: {
    errorCode: 11,
    errorField: 'vin',
  },
  ROW_NOT_SELECTED: {
    errorCode: '',
    errorField: '',
  },
  VIN_ALREADY_AWARDED: {
    errorCode: 21,
    errorField: 'vin',
  },
};
