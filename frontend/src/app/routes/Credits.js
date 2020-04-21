const API_BASE_PATH = '/credit-transactions';

const CREDITS = {
  CREDIT_REQUESTS: `${API_BASE_PATH}/requests`,
  CREDIT_REQUEST_DETAILS: `${API_BASE_PATH}/requests/:id`,
  LIST: `${API_BASE_PATH}`,
  SALES_SUBMISSION_DETAILS: `${API_BASE_PATH}/requests/:id/validate`,
  VALIDATED_CREDIT_REQUEST_DETAILS: `${API_BASE_PATH}/requests/:id/validated`,
  UPLOADVERIFICATION: `${API_BASE_PATH}/upload-verification-data`,
};

export default CREDITS;
