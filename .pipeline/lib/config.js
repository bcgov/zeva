'use strict';
const options= require('@bcgov/pipeline-cli').Util.parseArguments()
const changeId = options.pr //aka pull-request
const version = '1.0.0'
const name = 'zeva'

const phases = {

  build: {namespace:'tbiwaq-tools'   , transient:true, name: `${name}`, phase: 'build', 
          changeId:changeId, suffix: `-build-${changeId}`  , instance: `${name}-build-${changeId}`, 
          version:`${version}-${changeId}`, tag:`build-${version}-${changeId}`},

  dev: {namespace:'tbiwaq-dev', transient:true, name: `${name}`, ssoSuffix:'-dev', 
        ssoName:'sso-dev', phase: 'dev'  , changeId:changeId, suffix: `-dev-${changeId}`, 
        instance: `${name}-dev-${changeId}`  , version:`${version}-${changeId}`, tag:`dev-${version}-${changeId}`, 
        host: `zeva-dev-${changeId}.pathfinder.gov.bc.ca`, djangoDebug: 'True',
        frontendCpuRequest: '50m', frontendCpuLimit: '300m', frontendMemoryRequest: '300M', frontendMemoryLimit: '500M',
        backendCpuRequest: '300m', backendCpuLimit: '600m', backendMemoryRequest: '1G', backendMemoryLimit: '2G', backendHealthCheckDelay: 140,
        minioCpuRequest: '100m', minioCpuLimit: '200m', minioMemoryRequest: '200M', minioMemoryLimit: '500M', minioPvcSize: '1G',
        schemaspyCpuRequest: '50m', schemaspyCpuLimit: '200m', schemaspyMemoryRequest: '150M', schemaspyMemoryLimit: '300M', schemaspyHealthCheckDelay: 160,
        rabbitmqCpuRequest: '250m', rabbitmqCpuLimit: '700m', rabbitmqMemoryRequest: '500M', rabbitmqMemoryLimit: '1G', rabbitmqPvcSize: '1G', rabbitmqReplica: 1, rabbitmqPostStartSleep: 120,
        patroniCpuRequest: '200m', patroniCpuLimit: '400m', patroniMemoryRequest: '250M', patroniMemoryLimit: '500M', patroniPvcSize: '2G', patroniReplica: 1, storageClass: 'gluster-block'},

  test: {namespace:'tbiwaq-test', name: `${name}`, ssoSuffix:'-test', 
        ssoName:'sso-test', phase: 'test'  ,  changeId:changeId, suffix: `-test`, 
        instance: `${name}-test`, version:`${version}`, tag:`test-${version}`, 
        host: 'zeva-test.pathfinder.gov.bc.ca', djangoDebug: 'False',
        frontendCpuRequest: '50m', frontendCpuLimit: '300m', frontendMemoryRequest: '300M', frontendMemoryLimit: '500M', frontendMinReplicas: 2, frontendMaxReplicas: 5,
        backendCpuRequest: '100m', backendCpuLimit: '400m', backendMemoryRequest: '500M', backendMemoryLimit: '700M', backendHealthCheckDelay: 140, backendMinReplicas: 2, backendMaxReplicas: 5,
        minioCpuRequest: '100m', minioCpuLimit: '300m', minioMemoryRequest: '500M', minioMemoryLimit: '700M', minioPvcSize: '5G',
        schemaspyCpuRequest: '20m', schemaspyCpuLimit: '200m', schemaspyMemoryRequest: '150M', schemaspyMemoryLimit: '300M', schemaspyHealthCheckDelay: 160,
        rabbitmqCpuRequest: '250m', rabbitmqCpuLimit: '700m', rabbitmqMemoryRequest: '500M', rabbitmqMemoryLimit: '700M', rabbitmqPvcSize: '1G', rabbitmqReplica: 2, rabbitmqPostStartSleep: 120,
        patroniCpuRequest: '500m', patroniCpuLimit: '1000m', patroniMemoryRequest: '500M', patroniMemoryLimit: '1G', patroniPvcSize: '5G', patroniReplica: 2, storageClass: 'netapp-block-standard'},

  prod: {namespace:'tbiwaq-prod', name: `${name}`, ssoSuffix:'', 
        ssoName:'sso', phase: 'prod'  , changeId:changeId, suffix: `-prod`, 
        instance: `${name}-prod`, version:`${version}`, tag:`prod-${version}`, 
        host: 'zeroemissionvehicles.pathfinder.gov.bc.ca', djangoDebug: 'False',
        frontendCpuRequest: '100m', frontendCpuLimit: '300m', frontendMemoryRequest: '500M', frontendMemoryLimit: '1G', frontendMinReplicas: 2, frontendMaxReplicas: 5,
        backendCpuRequest: '200m', backendCpuLimit: '500m', backendMemoryRequest: '1G', backendMemoryLimit: '2G', backendHealthCheckDelay: 140, backendMinReplicas: 2, backendMaxReplicas: 5,
        minioCpuRequest: '100m', minioCpuLimit: '300m', minioMemoryRequest: '500M', minioMemoryLimit: '700M', minioPvcSize: '10G',
        schemaspyCpuRequest: '50m', schemaspyCpuLimit: '400m', schemaspyMemoryRequest: '150M', schemaspyMemoryLimit: '300M', schemaspyHealthCheckDelay: 160,
        rabbitmqCpuRequest: '250m', rabbitmqCpuLimit: '700m', rabbitmqMemoryRequest: '500M', rabbitmqMemoryLimit: '1G', rabbitmqPvcSize: '5G', rabbitmqReplica: 3, rabbitmqPostStartSleep: 120,
        patroniCpuRequest: '500m', patroniCpuLimit: '1000m', patroniMemoryRequest: '1G', patroniMemoryLimit: '2G', patroniPvcSize: '10G', patroniReplica: 3, storageClass: 'netapp-block-standard'},

};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = {phases, options};
