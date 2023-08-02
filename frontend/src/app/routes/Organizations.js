const API_BASE_PATH = '/organizations'

const ORGANIZATIONS = {
  ADD_USER: `${API_BASE_PATH}/:id/users/add`,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LDV_SALES: `${API_BASE_PATH}/:id/ldv_sales`,
  LIST: `${API_BASE_PATH}`,
  MINE: `${API_BASE_PATH}/mine`,
  MINE_ADD_USER: `${API_BASE_PATH}/mine/add`,
  NEW: `${API_BASE_PATH}/add-supplier`,
  REPORTS: `${API_BASE_PATH}/:id/reports`,
  SALES: `${API_BASE_PATH}/:id/sales`,
  SUPPLIER_TRANSACTIONS: `${API_BASE_PATH}/:id/supplier_transactions`,
  SUPPLIER_BALANCE: `${API_BASE_PATH}/:id/supplier_balance`,
  TRANSACTIONS: `${API_BASE_PATH}/:id/credit-transactions`,
  USERS: `${API_BASE_PATH}/:id/users`,
  VEHICLES: `${API_BASE_PATH}/:id/vehicles`,
  ASSESSED_SUPPLEMENTALS_MAP: `${API_BASE_PATH}/:id/assessed_supplementals_map`
}

export default ORGANIZATIONS
