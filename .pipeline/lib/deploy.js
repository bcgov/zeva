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

  //add Valid Redirect URIs for the pull request to keycloak
  //for example: 	https://zeva-dev-79.pathfinder.gov.bc.ca/*
  if(phase === 'dev') {
    const kc = new KeyCloakClient(settings, oc);
    kc.addUris();
  }

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, "../../openshift"));
  var objects = [];

  // The deployment of your cool app goes here ▼▼▼
/*
  // create configs
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/config/configmap.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'ENV_NAME': phases[phase].phase,
      'BACKEND_HOST': phases[phase].host,
      'SSO_NAME': phases[phase].ssoName,
      'KEYCLOAK_REALM': 'rzh2zkjq'
    }
  }))

  // deploy minio
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/minio/minio-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'ENV_NAME': phases[phase].phase,
      'PVC_SIZE': phases[phase].minioPvcSize
    }
  }))

  //deploy database
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/postgresql/postgresql-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'CPU_REQUEST': '100m',
      'CPU_LIMIT': '500m',
      'MEMORY_REQUEST': '200M',
      'MEMORY_LIMIT': '500M'
    }
  }))
*/
  //deploy rabbitmq
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/rabbitmq/rabbitmq-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'ENV_NAME': phases[phase].phase,
      'CPU_REQUEST': '100m',
      'CPU_LIMIT': '500m',
      'MEMORY_REQUEST': '256Mi',
      'MEMORY_LIMIT': '1Gi',
      'RABBITMQ_PVC_SIZE': '1Gi'
    }
  }))
/*
  // deploy frontend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'DASH_ENV_NAME': phases[phase].ssoSuffix,
      'CPU_REQUEST': '100m',
      'CPU_LIMIT': '500m',
      'MEMORY_REQUEST': '1100M',
      'MEMORY_LIMIT': '2G'
    }
  }))

  //deploy backend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/backend/backend-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'CPU_REQUEST': '100m',
      'CPU_LIMIT': '500m',
      'MEMORY_REQUEST': '1100M',
      'MEMORY_LIMIT': '2G'
    }
  }))
*/
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
