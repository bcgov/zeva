const API_BASE_PATH = '/credit-agreements'

const CREDIT_AGREEMENTS = {
  NEW: `${API_BASE_PATH}/new`,
  LIST: API_BASE_PATH,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  TRANSACTION_TYPES: `${API_BASE_PATH}/transaction_types`,
  MODEL_YEAR_REPORTS: `${API_BASE_PATH}/model_year_reports`,
  COMMENT_SAVE: `${API_BASE_PATH}/:id/comment_save`,
  UPDATE_COMMENT: `${API_BASE_PATH}/:id/update_comment`,
  DELETE_COMMENT: `${API_BASE_PATH}/:id/delete_comment`,
}

export default CREDIT_AGREEMENTS
