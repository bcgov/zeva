const API_BASE_PATH = '/credit-transactions';

const CREDITS = {
  CREDIT_BALANCES: `${API_BASE_PATH}/balances`,
  CAL_BALANCES: `${API_BASE_PATH}/:id/calculate_balance`,
  LIST: `${API_BASE_PATH}`,
  UPLOAD_VERIFICATION: `${API_BASE_PATH}/upload-verification-data`,
};

export default CREDITS;
