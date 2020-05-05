/* global
  __APIBASE__
  __KEYCLOAK_CLIENT_ID__
  __KEYCLOAK_LOGOUT_REDIRECT_URL__
  __KEYCLOAK_REALM_NAME__
  __KEYCLOAK_URL__
  __VERSION__
*/

require('./config/features');

const getConfig = (value, def) => {
  if (global.zeva_config) {
    return global.zeva_config[value] || def;
  }

  return def;
};

const CONFIG = {
  APIBASE: __APIBASE__, // injected by webpack
  FEATURES: {
    CREDIT_TRANSFERS: {
      ENABLED: getConfig('credit_transfers.enabled', false),
    },
    CREDIT_TRANSACTIONS: {
      ENABLED: getConfig('credit_transactions.enabled', false),
    },
    INITIATIVE_AGREEMENTS: {
      ENABLED: getConfig('initiative_agreements.enabled', false),
    },
    MODEL_YEAR_REPORT: {
      ENABLED: getConfig('model_year_report.enabled', false),
    },
    PURCHASE_REQUESTS: {
      ENABLED: getConfig('purchase_requests.enabled', false),
    },
    ROLES: {
      ENABLED: getConfig('roles.enabled', false),
    },
  },
  KEYCLOAK: {
    CLIENT_ID: __KEYCLOAK_CLIENT_ID__,
    LOGOUT_URL: __KEYCLOAK_LOGOUT_REDIRECT_URL__,
    REALM: __KEYCLOAK_REALM_NAME__,
    URL: __KEYCLOAK_URL__,
  },
  VERSION: __VERSION__,
};

export default CONFIG;
