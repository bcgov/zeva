
### remove all Aporeto network security policies  
oc delete nsp,en --all -n <namespace>

### Apply generic Aporeto network security policies
oc process -f nsp-generic.yaml \
    NAMESPACE_PREFIX=<LICENS_PLATE_HERE> \
    ENVIRONMENT=<ENVIRONMENT_NAME_HERE> | \
    oc apply -f - -n <namespace>
Note: once it is applied, the application will NOT be blocked by Aporeto. Aporeto should become transparent.


### Apply quick start KNPs for tools project
oc process -f knp-quick-start.yaml \
    NAMESPACE_PREFIX=<LICENS_PLATE_HERE> \
    ENVIRONMENT=<ENVIRONMENT_NAME_HERE> | \
    oc apply -f - -n <namespace>
Note 1 : the quick start include three knps: deny-by-default, allow-from-openshift-ingress and allow-all-internal. Once the quick start is applied, the application will NOT be blocked by Openshift network policies.

### For environment project
#### Apply knp-env-base.yaml
oc process -f knp-env-base.yaml ENVIRONMENT=<ENVIRONMENT_NAME_HERE> | oc create -f - -n <Namespace>
#### Apply knp-env-non-pr.yaml
oc process -f knp-env-non-pr.yaml ENVIRONMENT=<ENVIRONMENT_NAME_HERE> | oc create -f - -n <Namespace>
#### Apply knp-env-pr.yaml
Apply this through pipeline

### Remove KNP allow-all-internal and build customized ones
oc process -f knp-env.yaml \
    SUFFIX=<suffix> \
    NAMESPACE_PREFIX=<LICENS_PLATE_HERE> \
    ENVIRONMENT=<ENVIRONMENT_NAME_HERE> | \
    oc apply -f - -n <namespace>
    