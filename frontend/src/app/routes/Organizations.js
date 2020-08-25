const API_BASE_PATH = '/organizations';

const ORGANIZATIONS = {
  ADD_USER: `${API_BASE_PATH}/:id/users/add`,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LIST: `${API_BASE_PATH}`,
  MINE: `${API_BASE_PATH}/mine`,
  MINE_ADD_USER: `${API_BASE_PATH}/mine/add`,
  NEW: `${API_BASE_PATH}/add-supplier`,
  SALES: `${API_BASE_PATH}/:id/sales`,
  TRANSACTIONS: `${API_BASE_PATH}/:id/credit-transactions`,
  USERS: `${API_BASE_PATH}/:id/users`,
  VEHICLES: `${API_BASE_PATH}/:id/vehicles`,
};

export default ORGANIZATIONS;
