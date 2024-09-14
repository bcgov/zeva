const API_BASE_PATH = '/credit-transfers'

const CREDIT_REQUESTS = {
  NEW: `${API_BASE_PATH}/new`,
  LIST: API_BASE_PATH,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  UPDATE_COMMENT: `${API_BASE_PATH}/:id/update_comment`,
  DELETE_COMMENT: `${API_BASE_PATH}/:id/delete_comment`,
  ORG_BALANCES: `${API_BASE_PATH}/:id/org_balances`,
}

export default CREDIT_REQUESTS
