const API_BASE_PATH = '/sales';

const SALES = {
  ADD: `${API_BASE_PATH}/add`,
  APPROVAL: `${API_BASE_PATH}/:id/approval`,
  APPROVAL_DETAILS: `${API_BASE_PATH}/:id/approval/:vehicle_id`,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LIST: `${API_BASE_PATH}`,
  TEMPLATE: `${API_BASE_PATH}/template`,
  UPLOAD: `${API_BASE_PATH}/upload`,
};

export default SALES;
