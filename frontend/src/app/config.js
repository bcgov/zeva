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
    CREDIT_AGREEMENTS: {
      ENABLED: getConfig('credit_agreements.enabled', false),
    },    
    COMPLIANCE_CALCULATOR: {
      ENABLED: getConfig('compliance_calculator.enabled', false),
    },
    COMPLIANCE_RATIOS: {
      ENABLED: getConfig('compliance_ratios.enabled', false),
    },
    COMPLIANCE_REPORT: {
      ENABLED: getConfig('compliance_report.enabled', false),
    },
    INITIATIVE_AGREEMENTS: {
      ENABLED: getConfig('initiative_agreements.enabled', false),
    },
    MODEL_YEAR_REPORT: {
      ENABLED: getConfig('model_year_report.enabled', false),
      DEFAULT_YEAR: getConfig('model_year_report.default_year', 2020),
      YEARS: getConfig('model_year_report.years', []),
    },
    NOTIFICATIONS: {
      ENABLED: getConfig('notifications.enabled', false),
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
