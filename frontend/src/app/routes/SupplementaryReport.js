const API_BASE_PATH = '/compliance/reports';

const ROUTES_SUPPLEMENTARY = {
  CREATE: '/reports/:id/supplementary',
  DETAILS: `${API_BASE_PATH}/:id/supplemental`,
  SAVE: `${API_BASE_PATH}/:id/supplemental_save`,
};

export default ROUTES_SUPPLEMENTARY;
