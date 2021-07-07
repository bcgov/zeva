const API_BASE_PATH = '/credit-agreements';

const CREDIT_AGREEMENTS = {
  NEW: `${API_BASE_PATH}/new`,
  LIST: API_BASE_PATH,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
};

export default CREDIT_AGREEMENTS;