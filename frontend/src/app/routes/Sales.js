const API_BASE_PATH = '/sales';

const SALES = {
  ADD: `${API_BASE_PATH}/add`,
  APPROVAL: `${API_BASE_PATH}/:id/approval`,
  APPROVAL_DETAILS: `${API_BASE_PATH}/:id/approval/:vehicle_id`,
  CONFIRM: `${API_BASE_PATH}/:id/confirm`,
  DETAILS: `${API_BASE_PATH}/:id`,
  DOWNLOAD_ERRORS: `${API_BASE_PATH}/:id/download_errors`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LIST: `${API_BASE_PATH}`,
  TEMPLATE: `${API_BASE_PATH}/template`,
  UPLOAD: `${API_BASE_PATH}/upload`,
  NEW_UPLOAD: `${API_BASE_PATH}/new_upload`,
};

export default SALES;
