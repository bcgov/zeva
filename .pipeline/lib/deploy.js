"use strict";
const { OpenShiftClientX } = require("@bcgov/pipeline-cli");
const path = require("path");

module.exports = settings => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const changeId = phases[phase].changeId;
  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, "../../openshift"));
  var objects = [];

  // The deployment of your cool app goes here ▼▼▼

  // create configs
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/config/configs.yaml`, {
    'param':{
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'SSO_NAME': 'sso-dev',
      'KEYCLOAK_REALM': 'rzh2zkjq'
    }
  }))

  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/postgresql/postgresql-dc.yaml`, {
    'param':{
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

  //TODO sleep 60 seconds or somehow wait till postgresql is ready

  // deploy frontend
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-dc.yaml`, {
    'param':{
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

  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/backend/backend-dc.yaml`, {
    'param':{
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
