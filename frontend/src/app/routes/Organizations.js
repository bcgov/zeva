const API_BASE_PATH = '/organizations';

const ORGANIZATIONS = {
  ADD_USER: `${API_BASE_PATH}/:id/users/add`,
  DETAILS: `${API_BASE_PATH}/:id`,
  LIST: `${API_BASE_PATH}`,
  MINE: `${API_BASE_PATH}/mine`,
};

export default ORGANIZATIONS;
