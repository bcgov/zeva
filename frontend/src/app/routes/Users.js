const API_BASE_PATH = '/users';

const USERS = {
  ME: `${API_BASE_PATH}/current`,
  DETAILS: `${API_BASE_PATH}/:id`,
};

export default USERS;
