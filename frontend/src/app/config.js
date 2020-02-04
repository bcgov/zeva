/* global __APIBASE__, __KEYCLOAK_URL__, __VERSION__,
 __KEYCLOAK_REALM_NAME__, __KEYCLOAK_CLIENT_ID__ */
const CONFIG = {
  APIBASE: __APIBASE__, // injected by webpack
  KEYCLOAK: {
    CLIENT_ID: __KEYCLOAK_CLIENT_ID__,
    REALM: __KEYCLOAK_REALM_NAME__,
    URL: __KEYCLOAK_URL__,
  },
  VERSION: __VERSION__,
};

export default CONFIG;
