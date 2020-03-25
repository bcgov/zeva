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
        host: `zeva-dev-${changeId}.pathfinder.gov.bc.ca`, minioPvcSize: '1Gi', rabbitmqPvcSize: '1Gi',
        patroniCpuRequest: '250m', patroniCpuLimit: '300m', patroniMemoryRequest: '512Mi', patroniMemoryLimit: '1Gi'},

  test: {namespace:'tbiwaq-test'     , name: `${name}`, ssoSuffix:'-test', 
        ssoName:'sso-test', phase: 'test'  ,  changeId:changeId, suffix: `-test`  , 
        instance: `${name}-test`  , version:`${version}`, tag:`test-${version}`, 
        host: 'zeva-test.pathfinder.gov.bc.ca', minioPvcSize: '5Gi', rabbitmqPvcSize: '5Gi',
        patroniCpuRequest: '250m', patroniCpuLimit: '500m', patroniMemoryRequest: '1Gi', patroniMemoryLimit: '2Gi'},

  prod: {namespace:'tbiwaq-prod'     , name: `${name}`, ssoSuffix:'', 
        ssoName:'sso', phase: 'prod'  , changeId:changeId, suffix: `-prod`  , 
        instance: `${name}-prod`  , version:`${version}`, tag:`prod-${version}`, 
        host: 'zeva-prod.pathfinder.gov.bc.ca', minioPvcSize: '10Gi', rabbitmqPvcSize: '5Gi',
        patroniCpuRequest: '250m', patroniCpuLimit: '1000m', patroniMemoryRequest: '1Gi', patroniMemoryLimit: '2Gi'},

};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = {phases, options};
