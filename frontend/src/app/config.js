/* global
  __VERSION__
*/

const getConfig = (value, def) => {
  if (global.zeva_config) {
    return global.zeva_config[value] || def
  }

  return def
}

const CONFIG = {
  API_BASE: getConfig('api_base', `${window.location.protocol}//${window.location.host}:8000/api`),
  KEYCLOAK: {
    REALM: getConfig('keycloak.realm', false),
    CLIENT_ID: getConfig('keycloak.client_id', 'unconfigured'),
    AUTH_URL: getConfig('keycloak.auth_url', 'unconfigured'),
    CALLBACK_URL: getConfig('keycloak.callback_url', 'unconfigured'),
    POST_LOGOUT_URL: getConfig('keycloak.post_logout_url', 'unconfigured'),
    SM_LOGOUT_URL: getConfig('keycloak.siteminder_logout_url', 'unconfigured')
  },
  FEATURES: {
    CREDIT_TRANSFERS: {
      ENABLED: getConfig('credit_transfers.enabled', false)
    },
    CREDIT_TRANSACTIONS: {
      ENABLED: getConfig('credit_transactions.enabled', false)
    },
    CREDIT_AGREEMENTS: {
      ENABLED: getConfig('credit_agreements.enabled', false)
    },
    COMPLIANCE_CALCULATOR: {
      ENABLED: getConfig('compliance_calculator.enabled', false)
    },
    COMPLIANCE_RATIOS: {
      ENABLED: getConfig('compliance_ratios.enabled', false)
    },
    COMPLIANCE_REPORT: {
      ENABLED: getConfig('compliance_report.enabled', false)
    },
    INITIATIVE_AGREEMENTS: {
      ENABLED: getConfig('initiative_agreements.enabled', false)
    },
    MODEL_YEAR_REPORT: {
      ENABLED: getConfig('model_year_report.enabled', false),
      DEFAULT_YEAR: getConfig('model_year_report.default_year', 2020),
      YEARS: getConfig('model_year_report.years', [])
    },
    NOTIFICATIONS: {
      ENABLED: getConfig('notifications.enabled', false)
    },
    PURCHASE_REQUESTS: {
      ENABLED: getConfig('purchase_requests.enabled', false)
    },
    ROLES: {
      ENABLED: getConfig('roles.enabled', false)
    },
    SUPPLEMENTAL_REPORT: {
      ENABLED: getConfig('supplemental.enabled', false)
    }
  },
  VERSION: __VERSION__
}

export default CONFIG
