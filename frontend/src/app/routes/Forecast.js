const API_BASE_PATH = "/forecasts";

const ROUTES_FORECAST = {
  SAVE: `${API_BASE_PATH}/:id/save`,
  GET: `${API_BASE_PATH}/forecast_totals/{myr_id}`,
  LIST: `${API_BASE_PATH}/:id?page=:pg_num&size=:pg_size`,
  MINIO_URL: `${API_BASE_PATH}/:id/minio_url`,
};

export default ROUTES_FORECAST;
