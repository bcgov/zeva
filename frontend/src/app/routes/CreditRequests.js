const API_BASE_PATH = '/credit-requests';

const CREDIT_REQUESTS = {
  CONFIRM: `${API_BASE_PATH}/:id/confirm`,
  CONTENT: `${API_BASE_PATH}/:id/content`,
  DETAILS: `${API_BASE_PATH}/:id`,
  DOWNLOAD_ERRORS: `${API_BASE_PATH}/:id/download_errors`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LIST: API_BASE_PATH,
  NEW: `${API_BASE_PATH}/new`,
  TEMPLATE: `${API_BASE_PATH}/template`,
  UNSELECTED: `${API_BASE_PATH}/:id/unselected`,
  UPLOAD: `${API_BASE_PATH}/upload`,
  VALIDATE: `${API_BASE_PATH}/:id/validate`,
  VALIDATED: `${API_BASE_PATH}/:id/validated`,
};

export default CREDIT_REQUESTS;
