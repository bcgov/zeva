const API_BASE_PATH = '/vehicles';

const VEHICLES = {
  ADD: `${API_BASE_PATH}/add`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  DETAILS: `${API_BASE_PATH}/:id`,
  ZEV_TYPES: `${API_BASE_PATH}/zev_types`,
  LIST: `${API_BASE_PATH}`,
  MODELS: `${API_BASE_PATH}/models`,
  YEARS: `${API_BASE_PATH}/years`,
};

export default VEHICLES;
