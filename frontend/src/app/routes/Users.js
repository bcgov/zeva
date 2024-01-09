const API_BASE_PATH = '/users'

const USERS = {
  LIST: API_BASE_PATH,
  ME: `${API_BASE_PATH}/current`,
  DETAILS: `${API_BASE_PATH}/:id`,
  EDIT: `${API_BASE_PATH}/:id/edit`,
  ACTIVE: `${API_BASE_PATH}/active`,
  DOWNLOAD_ACTIVE: `${API_BASE_PATH}/download_active`
}

export default USERS
