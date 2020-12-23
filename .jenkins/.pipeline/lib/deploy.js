'use strict';
const {OpenShiftClientX} = require('@bcgov/pipeline-cli')
const path = require('path');

module.exports = (settings)=>{
  const phases = settings.phases
  const options = settings.options
  const phase=options.env
  const changeId = phases[phase].changeId
  const oc=new OpenShiftClientX(Object.assign({'namespace':phases[phase].namespace}, options));
  var objects = []

  const templatesLocalBaseUrl =oc.toFileUrl(path.resolve(__dirname, '../../openshift'))

  objects.push(...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/deploy-master.yaml`, {
    'param':{
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].phase,
      'ROUTE_HOST': `${phases[phase].name}${phases[phase].suffix}-${phases[phase].namespace}.${phases[phase].ocpName}.gov.bc.ca`
    }
  }))
  
  objects.push(...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/deploy-slave.yaml`, {
    'param':{
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'SLAVE_NAME': 'slave',
      'SLAVE_LABELS': 'build deploy test ui-test',
      'SLAVE_EXECUTORS': '5',
      'CPU_REQUEST': '500m',
      'CPU_LIMIT': '2',
      'MEMORY_REQUEST': '2Gi',
      'MEMORY_LIMIT': '6Gi'
    }
  })) 

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance)
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag)
  oc.applyAndDeploy(objects, phases[phase].instance)

}
