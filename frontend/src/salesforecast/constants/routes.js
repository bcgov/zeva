const API_BASE_PATH = "/forecasts";

const FORECAST_ROUTES = {
  SAVE: `${API_BASE_PATH}/:id/save`,
  RECORDS: `${API_BASE_PATH}/:id/records?page=:pg_num&size=:pg_size`,
  TOTALS: `${API_BASE_PATH}/:id/totals`,
  TEMPLATE: `${API_BASE_PATH}/template_url`,
};

export default FORECAST_ROUTES;
