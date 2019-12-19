/* global __APIBASE__, __VERSION__ */
const CONFIG = {
  APIBASE: __APIBASE__, // injected by webpack
  KEYCLOAK: {
    CLIENT_ID: 'zeva-app',
    REALM: 'rzh2zkjq',
    URL: __KEYCLOAK_URL__,
  },
  VERSION: __VERSION__,
};

export default CONFIG;
