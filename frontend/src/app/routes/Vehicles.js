const API_BASE_PATH = '/vehicles';

const VEHICLES = {
  ADD: `${API_BASE_PATH}/add`,
  CLASSES: `${API_BASE_PATH}/classes`,
  VEHICLES_SALES: `${API_BASE_PATH}/:id/vehicles_sales`,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  LIST: `${API_BASE_PATH}`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
  MODELS: `${API_BASE_PATH}/models`,
  YEARS: `${API_BASE_PATH}/years`,
  ZEV_TYPES: `${API_BASE_PATH}/zev_types`
};

export default VEHICLES;
