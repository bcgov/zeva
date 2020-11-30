"use strict";
const { OpenShiftClientX } = require("@bcgov/pipeline-cli");
const path = require("path");

module.exports = settings => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const changeId = phases[phase].changeId;
  const oc = new OpenShiftClientX(Object.assign({namespace: phases[phase].namespace}, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, "../../openshift-v3"));
  var objects = [];

  // The deployment of your cool app goes here ▼▼▼

  //deploy separate database and backend pod for unit test
  if( phase === 'dev' ) {

    //create unit test database init scripts
    objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/unittest/zeva-postgresql-init.yaml`, {
      'param': {
        'NAME': phases[phase].name,
        'SUFFIX': phases[phase].suffix
      }
    })) 

    //deploy postgresql unit test
    objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/unittest/postgresql-dc-unittest.yaml`, {
      'param': {
        'NAME': phases[phase].name,
        'SUFFIX': phases[phase].suffix,
        'ENV_NAME': phases[phase].phase
      }
    })) 

    //deploy backend unit test
    objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/unittest/backend-dc-unittest.yaml`, {
      'param': {
        'NAME': phases[phase].name,
        'SUFFIX': phases[phase].suffix,
        'VERSION': phases[phase].tag,
        'ENV_NAME': phases[phase].phase,
        'BACKEND_HOST_NAME': phases[phase].backendHost,
        'RABBITMQ_CLUSTER_NAME': 'rabbitmq-cluster',
        'CPU_REQUEST': phases[phase].backendCpuRequest,
        'CPU_LIMIT': '700m',
        'MEMORY_REQUEST': phases[phase].backendMemoryRequest,
        'MEMORY_LIMIT': phases[phase].backendMemoryLimit,
        'HEALTH_CHECK_DELAY': phases[phase].backendHealthCheckDelay,
        'REPLICAS':  phases[phase].backendReplicas
      }
    })) 

  }

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
