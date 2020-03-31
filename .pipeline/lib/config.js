'use strict';
const options= require('@bcgov/pipeline-cli').Util.parseArguments()
const changeId = options.pr //aka pull-request
const version = '1.0.0'
const name = 'zeva'

const phases = {

  build: {namespace:'tbiwaq-tools'   , transient:true, name: `${name}`, phase: 'build'  , 
          changeId:changeId, suffix: `-build-${changeId}`  , instance: `${name}-build-${changeId}`  , 
          version:`${version}-${changeId}`, tag:`build-${version}-${changeId}`},

  dev: {namespace:'tbiwaq-dev'       , transient:true, name: `${name}`, ssoSuffix:'-dev', 
        ssoName:'sso-dev', phase: 'dev'  , changeId:changeId, suffix: `-dev-${changeId}`  , 
        instance: `${name}-dev-${changeId}`  , version:`${version}-${changeId}`, tag:`dev-${version}-${changeId}`, 
        host: `zeva-dev-${changeId}.pathfinder.gov.bc.ca`, minioPvcSize: '1Gi', 
        frontendCpuRequest: '20m', frontendCpuLimit: '50m', frontendMemoryRequest: '300M', frontendMemoryLimit: '400M',
        backendCpuRequest: '20m', backendCpuLimit: '50m', backendMemoryRequest: '500M', backendMemoryLimit: '700M',
        schemaspyCpuRequest: '20m', schemaspyCpuLimit: '1000m', schemaspyMemoryRequest: '250M', schemaspyMemoryLimit: '1500M',
        rabbitmqCpuRequest: '250m', rabbitmqCpuLimit: '300m', rabbitmqMemoryRequest: '512Mi', rabbitmqMemoryLimit: '1Gi', rabbitmqPvcSize: '1Gi', rabbitmqReplica: 1, 
        patroniCpuRequest: '250m', patroniCpuLimit: '300m', patroniMemoryRequest: '512Mi', patroniMemoryLimit: '1Gi', patroniPvcSize: '1Gi', patroniReplica: 1},

  test: {namespace:'tbiwaq-test'     , name: `${name}`, ssoSuffix:'-test', 
        ssoName:'sso-test', phase: 'test'  ,  changeId:changeId, suffix: `-test`  , 
        instance: `${name}-test`  , version:`${version}`, tag:`test-${version}`, 
        host: 'zeva-test.pathfinder.gov.bc.ca', minioPvcSize: '5Gi',
        frontendCpuRequest: '50m', frontendCpuLimit: '100m', frontendMemoryRequest: '500M', frontendMemoryLimit: '700M', 
        backendCpuRequest: '50m', backendCpuLimit: '100m', backendMemoryRequest: '700M', backendMemoryLimit: '1G',
        schemaspyCpuRequest: '50m', schemaspyCpuLimit: '1000m', schemaspyMemoryRequest: '250M', schemaspyMemoryLimit: '1500M',
        rabbitmqCpuRequest: '250m', rabbitmqCpuLimit: '300m', rabbitmqMemoryRequest: '512Mi', rabbitmqMemoryLimit: '1Gi', rabbitmqPvcSize: '1Gi', rabbitmqReplica: 1, 
        patroniCpuRequest: '250m', patroniCpuLimit: '500m', patroniMemoryRequest: '1Gi', patroniMemoryLimit: '2Gi', patroniPvcSize: '1Gi', patroniReplica: 3},

  prod: {namespace:'tbiwaq-prod'     , name: `${name}`, ssoSuffix:'', 
        ssoName:'sso', phase: 'prod'  , changeId:changeId, suffix: `-prod`  , 
        instance: `${name}-prod`  , version:`${version}`, tag:`prod-${version}`, 
        host: 'zeva-prod.pathfinder.gov.bc.ca', minioPvcSize: '10Gi', 
        frontendCpuRequest: '50m', frontendCpuLimit: '100m', frontendMemoryRequest: '500M', frontendMemoryLimit: '700M', 
        backendCpuRequest: '100m', backendCpuLimit: '500m', backendMemoryRequest: '1G', backendMemoryLimit: '2G',
        schemaspyCpuRequest: '50m', schemaspyCpuLimit: '1000m', schemaspyMemoryRequest: '250M', schemaspyMemoryLimit: '1500M',
        rabbitmqCpuRequest: '250m', rabbitmqCpuLimit: '300m', rabbitmqMemoryRequest: '512Mi', rabbitmqMemoryLimit: '1Gi', rabbitmqPvcSize: '1Gi', rabbitmqReplica: 1, 
        patroniCpuRequest: '250m', patroniCpuLimit: '1000m', patroniMemoryRequest: '1Gi', patroniMemoryLimit: '2Gi', patroniPvcSize: '1Gi', patroniReplica: 3},

};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = {phases, options};
