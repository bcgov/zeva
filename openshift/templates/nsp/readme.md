### Files included

* nsp-env.yaml not being used
* nsp-tools.yaml pods-to-external-network, apply it to tools name space only
* quickstart-nsp.yaml apply this to all namespaces

### Apply to name spaces before anything else

* oc process -f ./nsp-tools.yaml | oc create -f - -n tbiwaq-tools
* oc process -f ./quickstart-nsp.yaml | oc create -f - -n tbiwaq-dev
* oc process -f ./quickstart-nsp.yaml | oc create -f - -n tbiwaq-dev
* oc process -f ./quickstart-nsp.yaml | oc create -f - -n tbiwaq-test
* oc process -f ./quickstart-nsp.yaml | oc create -f - -n tbiwaq-prod

### Add role to users, check if the settings already exist before run the grant

* tools project

oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-dev:default --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-dev:builder --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-test:default --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-test:builder --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-prod:default --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-prod:builder --namespace=tbiwaq-tools


* dev enviornment

oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-dev
oc policy add-role-to-user edit system:serviceaccount:tbiwaq-dev:nagios --namespace=tbiwaq-dev
oc policy add-role-to-user system:deployer system:serviceaccount:tbiwaq-dev:deployer --namespace=tbiwaq-dev
oc policy add-role-to-user system:image-builder system:serviceaccount:tbiwaq-dev:builder --namespace=tbiwaq-dev

* test enviornment

oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-test
oc policy add-role-to-user edit system:serviceaccount:tbiwaq-test:nagios --namespace=tbiwaq-test
oc policy add-role-to-user system:deployer system:serviceaccount:tbiwaq-test:deployer --namespace=tbiwaq-test
oc policy add-role-to-user system:image-builder system:serviceaccount:tbiwaq-test:builder --namespace=tbiwaq-test

* prod enviornment

oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-prod
oc policy add-role-to-user edit system:serviceaccount:tbiwaq-prod:nagios --namespace=tbiwaq-prod
oc policy add-role-to-user system:deployer system:serviceaccount:tbiwaq-prod:deployer --namespace=tbiwaq-prod
oc policy add-role-to-user system:image-builder system:serviceaccount:tbiwaq-prod:builder --namespace=tbiwaq-prod
