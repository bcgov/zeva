const API_BASE_PATH = '/credit-transactions';

const CREDITS = {
  CREDIT_BALANCES: `${API_BASE_PATH}/balances`,
  CREDIT_REQUESTS: `${API_BASE_PATH}/requests`,
  CREDIT_REQUEST_DETAILS: `${API_BASE_PATH}/requests/:id`,
  CREDIT_TRANSFERS: `${API_BASE_PATH}/transfers`,
  CREDIT_TRANSFERS_API: '/credit-transfers',
  CREDIT_TRANSFERS_ADD: `${API_BASE_PATH}/transfers/add`,
  EDIT: `${API_BASE_PATH}/requests/:id/edit`,
  LIST: `${API_BASE_PATH}`,
  SALES_SUBMISSION_DETAILS: `${API_BASE_PATH}/requests/:id/validate`,
  VALIDATED_CREDIT_REQUEST_DETAILS: `${API_BASE_PATH}/requests/:id/validated`,
  UPLOADVERIFICATION: `${API_BASE_PATH}/upload-verification-data`,
};

export default CREDITS;
