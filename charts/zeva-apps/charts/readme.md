# Prerequisites before using Heml to replace BCDK pipeline

## Secret
* zeva-django: use openshift/templates/backend/django-secret.yaml to create the secret

## Imagestreams
* zeva-frontend
* zeve-backend

## Zeva application route
* For dev and test remove zeva-frontend-{envName} route
* For Prod, backup the certificate info for the frontend pod
* For Prod, remove zeva-frontend-{envName} route, as hostname can only be zeroemissionvehicles.gov.bc.ca

# Post Helm installation

## Cleanup after Helm is adopted
* Remove zeva-django-{envName} and template.django-secret

## Helm sample commands
* helm template zeva-backend-dev . --set backendImageTagname=dev-1.46.0 -f ./values-dev.yaml
* helm template zeva-frontend-dev-dev . --set frontendImageTagname=dev-1.46.0,openshiftLicensePlate=e52f12 -f ./values-dev.yaml

# Preparation of applying Helm to prod
1. done - Create zeva-django secret same as zeva-django-prod
2. done - Create zeva-patroni-admin secret
3. done - Create zeva-patroni-app secret
4. Add allow-all-internal network policies
5. Remove DC/zeva-backend DC/zeva-frontend
6. Remove service/zeva-backend-prod, service/zeva-frontend-prod
7. helm deploy
8. update route to use the new services
9. cleanup: remove configmap/zeva-config-prod configmap/zeva-frnotend-config-prod
10. cleanup: network policies

## Explaination of Helm chart

* .Chart.* are the fields from Chart.yaml
* .Release.* are the attrivutes from teh release object, the examples of a releases are zeva-backend, zeva-frontend and etc.