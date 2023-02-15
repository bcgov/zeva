"use strict";
const { OpenShiftClientX } = require("@bcgov/pipeline-cli");
const path = require("path");
const KeyCloakClient = require('./keycloak');

module.exports = settings => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const changeId = phases[phase].changeId;
  const oc = new OpenShiftClientX(Object.assign({namespace: phases[phase].namespace}, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, "../../openshift"));
  var objects = [];

  // The deployment of your cool app goes here ▼▼▼

  // create configs
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/config/configmap.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'ENV_NAME': phases[phase].phase,
      'HOST_NAME': phases[phase].host,
      'BACKEND_HOST_NAME': phases[phase].backendHost,
      'SSO_NAME': phases[phase].ssoName,
      'KEYCLOAK_REALM': 'standard',
      'KEYCLOAK_CALLBACK_URL': phases[phase].keycloakCallbackUrl,
      'KEYCLOAK_SITEMINDER_LOGOUT_REDIRECT_URL': phases[phase].keycloakSiteminderLogoutRedirectUrl,
      'DJANGO_DEBUG': phases[phase].djangoDebug,
      'OCP_NAME': phases[phase].ocpName,
      'LOGOUT_HOST_NAME': phases[phase].logoutHostName,
      'DATABASE_SERVICE_NAME': phases[phase].databaseServiceName,
      'WELL_KNOWN_ENDPOINT': phases[phase].wellKnownEndpoint
    }
  }))

 
  // deploy frontend configmap
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-configmap.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'COMPLIANCE_REPORT_ENABLED': phases[phase].complianceReportEnabled,
      'COMPLIANCE_CALCULATOR_ENABLED': phases[phase].complianceCalculatorEnabled,
      'COMPLIANCE_RATIOS_ENABLED': phases[phase].complianceRatiosEnabled,
      'CREDIT_TRANSFERS_ENABLED': phases[phase].creditTransfersEnabled,
      'CREDIT_TRANSACTIONS_ENABLED': phases[phase].creditTransactionsEnabled,
      'INITIATIVE_AGREEMENTS_ENABLED': phases[phase].initiativeAgreementsEnabled,
      'MODEL_YEAR_REPORT_ENABLED': phases[phase].modelYearReportEnabled,
      'PURCHASE_REQUESTS_ENABLED': phases[phase].purchaseRequestsEnabled,
      'NOTIFICATIONS_ENABLED': phases[phase].notificationsEnabled,
      'ROLES_ENABLED': phases[phase].rolesEnabled,
      'CREDIT_AGREEMENTS_ENABLED': phases[phase].creditAgreementsEnabled,
      'SUPPLEMENTAL_ENABLED': phases[phase].supplementalEnabled
    }
  }))

  // deploy frontend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-dc-docker.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'HOST_NAME': phases[phase].host,
      'CPU_REQUEST': phases[phase].frontendCpuRequest,
      'CPU_LIMIT': phases[phase].frontendCpuLimit,
      'MEMORY_REQUEST': phases[phase].frontendMemoryRequest,
      'MEMORY_LIMIT': phases[phase].frontendMemoryLimit,
      'REPLICAS':  phases[phase].frontendReplicas
    }
  }))

  //deploy backend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/backend/backend-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'BACKEND_HOST_NAME': phases[phase].backendHost,
      'CPU_REQUEST': phases[phase].backendCpuRequest,
      'CPU_LIMIT': phases[phase].backendCpuLimit,
      'MEMORY_REQUEST': phases[phase].backendMemoryRequest,
      'MEMORY_LIMIT': phases[phase].backendMemoryLimit,
      'HEALTH_CHECK_DELAY': phases[phase].backendHealthCheckDelay,
      'REPLICAS':  phases[phase].backendReplicas
    }
  })) 
  
  oc.applyRecommendedLabels(
      objects,
      phases[phase].name,
      phase,
      `${changeId}`,
      phases[phase].instance,
  );
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
  oc.applyAndDeploy(objects, phases[phase].instance);

};
