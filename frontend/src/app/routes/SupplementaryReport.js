const API_BASE_PATH = '/compliance/reports';

const ROUTES_SUPPLEMENTARY = {
  CREATE: '/reports/:id/supplementary',
  DETAILS: `${API_BASE_PATH}/:id/supplemental`,
  SAVE: `${API_BASE_PATH}/:id/supplemental_save`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  REASSESSMENT: `${API_BASE_PATH}/:id/reassessment`,
};

export default ROUTES_SUPPLEMENTARY;
