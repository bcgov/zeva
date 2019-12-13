/* global __APIBASE__, __VERSION__ */
const CONFIG = {
  APIBASE: __APIBASE__, // injected by webpack
  KEYCLOAK: {
    CLIENT_ID: 'zeva-app',
    REALM: 'zeva',
    URL: 'http://localhost:8888/auth',
  },
  VERSION: __VERSION__,
};

export default CONFIG;
