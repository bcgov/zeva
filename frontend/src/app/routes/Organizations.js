const API_BASE_PATH = '/organizations';

const ORGANIZATIONS = {
  DETAILS: `${API_BASE_PATH}/:id`,
  LIST: `${API_BASE_PATH}`,
  MINE: `${API_BASE_PATH}/mine`,
};

export default ORGANIZATIONS;
