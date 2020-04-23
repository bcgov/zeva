const API_BASE_PATH = '/organizations';

const ORGANIZATIONS = {
  LIST: `${API_BASE_PATH}`,
  MINE: `${API_BASE_PATH}/mine`,
  VEHICLES: `${API_BASE_PATH}/:id/vehicles`,
  TRANSACTIONS:  `${API_BASE_PATH}/:id/credit-transactions`,
  USERS: `${API_BASE_PATH}/:id/users`,
  DETAILS: `${API_BASE_PATH}/:id`,

};

export default ORGANIZATIONS;
