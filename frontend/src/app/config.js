/* global __APIBASE__, __KEYCLOAK_URL__, __VERSION__ */
const CONFIG = {
  APIBASE: __APIBASE__, // injected by webpack
  KEYCLOAK: {
    CLIENT_ID: 'zeva-django-sa',
    REALM: 'rzh2zkjq',
    URL: __KEYCLOAK_URL__,
  },
  VERSION: __VERSION__,
};

export default CONFIG;
