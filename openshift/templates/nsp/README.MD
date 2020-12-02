### Files included

* nsp-env.yaml - used by pipeline
* nsp-env-test-prod.yaml - setup nsps used by test and prod, pipeline doesn't use them
* nsp-tools.yaml pods-to-external-network, apply it to tools name space only
* quickstart-nsp.yaml apply this to all namespaces
* aporeto-setup.md documentation for aporeto setup, including more specific security policies

### Apply to name spaces before anything else

for pathfinder: 
    API_VERSION=secops.pathfinder.gov.bc.ca/v1alpha1
    NAMESPACE_PREFIX=tbiwaq

for Openshift v4: 
    API_VERSION=security.devops.gov.bc.ca/v1alpha1
    NAMESPACE_PREFIX=e52f12


* oc process -f ./nsp-tools.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAMESPACE_PREFIX=e52f12 ENV_NAME=tools | oc create -f - -n e52f12-tools
* oc process -f ./quickstart-nsp.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAMESPACE_PREFIX=e52f12 ENV_NAME=tools | oc create -f - -n e52f12-tools
* oc process -f ./quickstart-nsp.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAMESPACE_PREFIX=e52f12 ENV_NAME=dev | oc create -f - -n e52f12-dev
* oc process -f ./quickstart-nsp.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAMESPACE_PREFIX=e52f12 ENV_NAME=test | oc create -f - -n e52f12-test
* oc process -f ./quickstart-nsp.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAMESPACE_PREFIX=e52f12 ENV_NAME=prod | oc create -f - -n e52f12-prod

//non removeable by pipeline, manually create it
* oc process -f ./nsp-env-test-prod.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAME=zeva ENV_NAME=test | oc create -f - -n e52f12-test
* oc process -f ./nsp-env-test-prod.yaml API_VERSION=security.devops.gov.bc.ca/v1alpha1 NAME=zeva ENV_NAME=prod | oc create -f - -n e52f12-prod


### Add role to users, check if the settings already exist before run the grant

* tools project

oc policy add-role-to-user admin system:serviceaccount:e52f12-tools:jenkins-prod --namespace=e52f12-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:e52f12-dev:default --namespace=e52f12-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:e52f12-dev:builder --namespace=e52f12-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:e52f12-test:default --namespace=e52f12-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:e52f12-test:builder --namespace=e52f12-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:e52f12-prod:default --namespace=e52f12-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:e52f12-prod:builder --namespace=e52f12-tools


* dev enviornment

oc policy add-role-to-user admin system:serviceaccount:e52f12-tools:jenkins-prod --namespace=e52f12-dev
oc policy add-role-to-user edit system:serviceaccount:e52f12-dev:nagios --namespace=e52f12-dev
oc policy add-role-to-user system:deployer system:serviceaccount:e52f12-dev:deployer --namespace=e52f12-dev
oc policy add-role-to-user system:image-builder system:serviceaccount:e52f12-dev:builder --namespace=e52f12-dev

* test enviornment

oc policy add-role-to-user admin system:serviceaccount:e52f12-tools:jenkins-prod --namespace=e52f12-test
oc policy add-role-to-user edit system:serviceaccount:e52f12-test:nagios --namespace=e52f12-test
oc policy add-role-to-user system:deployer system:serviceaccount:e52f12-test:deployer --namespace=e52f12-test
oc policy add-role-to-user system:image-builder system:serviceaccount:e52f12-test:builder --namespace=e52f12-test

* prod enviornment

oc policy add-role-to-user admin system:serviceaccount:e52f12-tools:jenkins-prod --namespace=e52f12-prod
oc policy add-role-to-user edit system:serviceaccount:e52f12-prod:nagios --namespace=e52f12-prod
oc policy add-role-to-user system:deployer system:serviceaccount:e52f12-prod:deployer --namespace=e52f12-prod
oc policy add-role-to-user system:image-builder system:serviceaccount:e52f12-prod:builder --namespace=e52f12-prod


