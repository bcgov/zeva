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


## todo
* before merging to release branch, remember to remove the pr number at the end of image name
