const API_BASE_PATH = '/compliance/reports';

const ROUTES_SUPPLEMENTARY = {
  CREATE: `${API_BASE_PATH}/:id/supplementary`,
  DETAILS: `${API_BASE_PATH}/:id/supplemental`,
  SUPPLEMENTARY_DETAILS: `${API_BASE_PATH}/:id/supplementary/:supplementaryId`,
  SAVE: `${API_BASE_PATH}/:id/supplemental_save`,
  ASSESSMENT: `${API_BASE_PATH}/:id/supplemental_assessment`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  REASSESSMENT: `${API_BASE_PATH}/:id/reassessment`,
  COMMENT_SAVE: `${API_BASE_PATH}/:id/supplemental_comment_save`,
  COMMENT_EDIT: `${API_BASE_PATH}/:id/supplemental_comment_edit`,
  COMMENT_DELETE: `${API_BASE_PATH}/:id/supplemental_comment_delete`,
  ASSESSED_SUPPLEMENTALS: `${API_BASE_PATH}/:id/assessed_supplementals`
};

export default ROUTES_SUPPLEMENTARY;
