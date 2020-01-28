const API_BASE_PATH = '/vehicles';

const VEHICLES = {
  ADD: `${API_BASE_PATH}/add`,
  DETAILS: `${API_BASE_PATH}/:id`,
  FUEL_TYPES: `${API_BASE_PATH}/fuel_types`,
  LIST: `${API_BASE_PATH}`,
  MAKES: `${API_BASE_PATH}/makes`,
  MODELS: `${API_BASE_PATH}/models`,
  YEARS: `${API_BASE_PATH}/years`,
  CLASSES: `${API_BASE_PATH}/classes`,
};

export default VEHICLES;
