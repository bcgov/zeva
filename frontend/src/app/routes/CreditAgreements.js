const API_BASE_PATH = '/credit-agreements';

const CREDIT_AGREEMENTS = {
  NEW: `${API_BASE_PATH}/new`,
  LIST: API_BASE_PATH,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  TRANSACTION_TYPES: `${API_BASE_PATH}/transaction_types`,
};

export default CREDIT_AGREEMENTS;
