const API_BASE_PATH = '/credit-transactions'

const CREDITS = {
  RECENT_CREDIT_BALANCES: `${API_BASE_PATH}/recent_balances`,
  CAL_BALANCES: `${API_BASE_PATH}/:id/calculate_balance`,
  LIST: `${API_BASE_PATH}`,
  UPLOAD_VERIFICATION: `${API_BASE_PATH}/upload-verification-data`,
  COMPLIANCE_YEARS: `${API_BASE_PATH}/compliance_years`,
  LIST_BY_YEAR: `${API_BASE_PATH}/list_by_year?year=:year`
}

export default CREDITS
