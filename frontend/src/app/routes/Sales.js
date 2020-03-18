const API_BASE_PATH = '/sales';

const SALES = {
  ADD: `${API_BASE_PATH}/add`,
  APPROVAL: `${API_BASE_PATH}/:id/approval`,
  DETAILS: `${API_BASE_PATH}/:id`,
  TEMPLATE: `${API_BASE_PATH}/template?year=:yearName`,
  UPLOAD: `${API_BASE_PATH}/upload`,
  LIST: `${API_BASE_PATH}`,
};

export default SALES;
