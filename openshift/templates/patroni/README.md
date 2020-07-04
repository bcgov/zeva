### Files included

* build.yaml build patroni image
* deployment.yaml deploy patroni 
* deployment-prereq.yaml create pre-required objects for patroni
* secret-template.yaml create template.patroni-patroni secret, it is used by pipeline

### Defore triggering pipeline

1. Create template.patroni-patroni secret
oc process -f ./secret-template.yaml | oc create -f - -n [environment namespace]

2. Build patroni image
oc process -f ./build.yaml | oc create -f - -n [tools namespace]

