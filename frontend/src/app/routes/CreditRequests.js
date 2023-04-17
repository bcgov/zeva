const API_BASE_PATH = '/credit-requests'

const CREDIT_REQUESTS = {
  CONTENT: `${API_BASE_PATH}/:id/content`,
  DETAILS: `${API_BASE_PATH}/:id`,
  DOWNLOAD_ERRORS: `${API_BASE_PATH}/:id/download_errors`,
  DOWNLOAD_DETAILS: `${API_BASE_PATH}/:id/download_details`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LIST: API_BASE_PATH,
  LIST_PAGINATED: `${API_BASE_PATH}/paginated`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  NEW: `${API_BASE_PATH}/new`,
  REASONS: `${API_BASE_PATH}/reasons`,
  SALES_EVIDENCE_TEMPLATE: `${API_BASE_PATH}/SalesEvidenceTemplate.docx`,
  TEMPLATE: `${API_BASE_PATH}/template`,
  UNSELECTED: `${API_BASE_PATH}/:id/unselected`,
  UPLOAD: `${API_BASE_PATH}/upload`,
  VALIDATE: `${API_BASE_PATH}/:id/validate`,
  VALIDATED: `${API_BASE_PATH}/:id/validated`,
  VALIDATED_DETAILS: `${API_BASE_PATH}/:id/validated-details`,
  UPDATE_COMMENT: `${API_BASE_PATH}/:id/update_comment`,
  DELETE_COMMENT: `${API_BASE_PATH}/:id/delete_comment`
}

export default CREDIT_REQUESTS
