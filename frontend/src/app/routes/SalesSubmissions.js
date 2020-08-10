const API_BASE_PATH = '/submissions';

const SALES_SUBMISSIONS = {
  CONTENT: `${API_BASE_PATH}/:id/content`,
  DETAILS: `${API_BASE_PATH}/:id`,
  LIST: `${API_BASE_PATH}`,
  RAW: `${API_BASE_PATH}/:id/raw`,
};

export default SALES_SUBMISSIONS;
