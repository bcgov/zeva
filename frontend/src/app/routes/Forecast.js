const API_BASE_PATH = "/forecasts";

const FORECAST = {
  SAVE: `${API_BASE_PATH}/:id`,
  GET: `${API_BASE_PATH}/forecast_totals/{myr_id}`,
  LIST: `${API_BASE_PATH}/:id?page=:pg_num&size=:pg_size`,
};

export default ROUTES_FORECAST;
