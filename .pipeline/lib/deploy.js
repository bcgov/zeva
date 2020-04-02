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
      'PVC_SIZE': phases[phase].minioPvcSize,
      'CPU_REQUEST': phases[phase].minioCpuRequest,
      'CPU_LIMIT': phases[phase].minioCpuLimit,
      'MEMORY_REQUEST': phases[phase].minioMemoryRequest,
      'MEMORY_LIMIT': phases[phase].minioMemoryRequest,      
    }
  }))

  //deploy Patroni required secrets
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/patroni/deployment-prereq.yaml`, {
    'param': {
      'NAME': 'patroni',
      'SUFFIX': phases[phase].suffix
    }
  }))
  //deploy Patroni
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/patroni/deployment.yaml`, {
    'param': {
      'NAME': 'patroni',
      'SUFFIX': phases[phase].suffix,
      'CPU_REQUEST': phases[phase].patroniCpuRequest,
      'CPU_LIMIT': phases[phase].patroniCpuLimit,
      'MEMORY_REQUEST': phases[phase].patroniMemoryRequest,
      'MEMORY_LIMIT': phases[phase].patroniMemoryRequest,
      'IMAGE_REGISTRY': 'docker-registry.default.svc:5000',
      'IMAGE_STREAM_NAMESPACE': 'tbiwaq-dev',
      'IMAGE_STREAM_TAG': 'patroni:v10-stable',
      'REPLICA': phases[phase].patroniReplica
    }
  }))

  //deploy rabbitmq, use docker image directly
  //TODO: tage docker image to local
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/rabbitmq/rabbitmq-cluster-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'NAMESPACE': phases[phase].namespace,
      'CLUSTER_NAME': 'rabbitmq-cluster',
      'ISTAG': 'rabbitmq:3.8.3-management',
      'SERVICE_ACCOUNT': 'rabbitmq-discovery',
      'VOLUME_SIZE': phases[phase].rabbitmqPvcSize,
      'CPU_REQUEST': phases[phase].rabbitmqCpuRequest,
      'CPU_LIMIT': phases[phase].rabbitmqCpuLimit,
      'MEMORY_REQUEST': phases[phase].rabbitmqMemoryRequest,
      'MEMORY_LIMIT': phases[phase].rabbitmqMemoryLimit,
      'REPLICA': phases[phase].rabbitmqReplica,
      'POST_START_SLEEP': phases[phase].rabbitmqPostStartSleep 
    }
  }))

  // deploy frontend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'DASH_ENV_NAME': phases[phase].ssoSuffix,
      'CPU_REQUEST': phases[phase].frontendCpuRequest,
      'CPU_LIMIT': phases[phase].frontendCpuLimit,
      'MEMORY_REQUEST': phases[phase].frontendMemoryRequest,
      'MEMORY_LIMIT': phases[phase].frontendMemoryLimit
    }
  }))

  //deploy backend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/backend/backend-dc.yaml`, {
    'param': {
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'CPU_REQUEST': phases[phase].backendCpuRequest,
      'CPU_LIMIT': phases[phase].backendCpuLimit,
      'MEMORY_REQUEST': phases[phase].backendMemoryRequest,
      'MEMORY_LIMIT': phases[phase].backendMemoryLimit,
      'HEALTH_CHECK_DELAY': phases[phase].backendHealthCheckDelay,
    }
  }))

  //deploy schemaspy
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/schemaspy/schemaspy-dc.yaml`, {
    'param': {
      'SUFFIX': phases[phase].suffix,
      'CPU_REQUEST': phases[phase].schemaspyCpuRequest,
      'CPU_LIMIT': phases[phase].schemaspyCpuLimit,
      'MEMORY_REQUEST': phases[phase].schemaspyMemoryRequest,
      'MEMORY_LIMIT': phases[phase].schemaspyMemoryLimit,
      'HEALTH_CHECK_DELAY': phases[phase].schemaspyHealthCheckDelay
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
