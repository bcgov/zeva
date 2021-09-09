const API_BASE_PATH = '/compliance/reports';

const ROUTES_SUPPLEMENTARY = {
  CREATE: '/reports/:id/supplementary',
  DETAILS: `${API_BASE_PATH}/:id/supplemental`,
  SAVE: `${API_BASE_PATH}/:id/supplemental_save`,
  ASSESSMENT: `${API_BASE_PATH}/:id/supplemental_assessment`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  REASSESSMENT: `${API_BASE_PATH}/:id/reassessment`,
  COMMENT_SAVE: `${API_BASE_PATH}/:id/supplemental_comment_save`,
};

export default ROUTES_SUPPLEMENTARY;
