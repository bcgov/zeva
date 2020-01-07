# Zeva Pull Request based Pipeline

This is the readme file to help Zeva to create Pull Request based pipeline using [BCDK](https://github.com/bcdevops/bcdk)

The first component to be built and deployed is frontend.

Create a branch called zeva-bcdk from master and all the following work are based on this branch.

## Section 1: Create a PR based pipeline

The Pipeline created is PR based and it can run under command line. It means that a pull request can be deployed using command line.

### Create .pipeline folder

Use Yeoman generator to create .pipeline folder

```
~/Projects/zeva$ yo bcdk:pipeline
? What is this module id/key? zeva
? What is this module name? zeva
? What is this module version? 1.0.0
? What environments are supported by your app? separated by space build dev test prod
? What is the source code directory for this module? .
? What namespace/project name is used for 'build'? tbiwaq-tools
? What namespace/project name is used for 'dev'? tbiwaq-dev
? What namespace/project name is used for 'test'? tbiwaq-test
? What namespace/project name is used for 'prod'? tbiwaq-prod
```

### Create frontend build and deploy template for Openshift

* openshift/templates/frontend/frontend-bc.yaml
* openshift/templates/frontend/frontend-dc.yaml


### Customize build process

* update ./pipeline/line/build.js line 14 
```
  // The building of your cool app goes here ▼▼▼
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-bc.yaml`, {
    'param':{
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'GIT_URL': oc.git.http_url,
      'GIT_REF': oc.git.ref
    }
  }))
```

### Create a pull request

* Commit all changes,  push to GitHub and create a pull request #18.

### Build pull request

Build Config zeva-frontend-build-18 will be create under tools namespace.
```
~/Projects/zeva/.pipeline$ npm run build -- --pr=18
```
### Customize deploy process

Update ./pipeline/line/deploy.js line 15

```
  // The deployment of your cool app goes here ▼▼▼
  objects = objects.concat(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/templates/frontend/frontend-dc.yaml`, {
    'param':{
      'NAME': phases[phase].name,
      'SUFFIX': phases[phase].suffix,
      'VERSION': phases[phase].tag,
      'ENV_NAME': phases[phase].instance,
      'DASH_ENV_NAME': phases[phase].ssoSuffix,
      'CPU_REQUEST': '100m',
      'CPU_LIMIT': '500m',
      'MEMORY_REQUEST': '1100M',
      'MEMORY_LIMIT': '2G'
    }
  }))
```
### Deploy pull request

Deployment config zeva-frontend-dev-18 will be created under dev namespace.
```
~/Projects/zeva/.pipeline$ npm run deploy -- --pr=18 --env=dev
```
### Cleanup deployment configurations

The deployment configuration such as deployment config, service and route related to the pull request will be removed.
```
~/Projects/zeva/.pipeline$ nnpm run clean -- --pr=18 --env=dev
```

## Section 2: Setup Jenkins on Openshift

Create Jenkins master and slave instances on Openshift. Also create Zeva pipeline job on Jenkins.

### Create .jenkins folder

```
~/Projects/zeva$ yo bcdk:jenkins
? What is your openshift 'tools' namespace name? tbiwaq-tools
? What is this module name? jenkins
? What is this module name? jenkins
? What is this module version? 1.0.0
Environments: build dev prod
? What is the source code directory for this module? .jenkins
? What namespace/project name is used for 'build'? tbiwaq-tools
? What namespace/project name is used for 'dev'? tbiwaq-tools
? What namespace/project name is used for 'prod'? tbiwaq-tools
? What is the GitHub organization where the repository is located? bcgov
? What is the repository's name? zeva
? What is the Jenkinsfile path? .jenkins/Jenkinsfile
Writing 'jenkins' files.
Writing 'pipeline' files.
Writing 'jenkins-job' files.
Writing 'jenkins-overwrites' files.
   create .jenkins/docker/contrib/jenkins/configuration/jobs/_jenkins/config.xml
   create .jenkins/docker/Dockerfile
   create .jenkins/openshift/build-master.yaml
```

Commit .jenkins folder, yes only commit is required, no need to push to remote.

### Build Jenkins master and slave image on Openshift

```
~/Projects/zeva/.jenkins/.pipeline$ npm run build -- --pr=0 --dev-mode=true
> pipeline@1.0.0 build /Users/kfan/Projects/zeva/.jenkins/.pipeline
> node build.js "--pr=0" "--dev-mode=true"

Starting new build for  buildconfig.build.openshift.io/jenkins-build-0
Starting new build for  buildconfig.build.openshift.io/jenkins-slave-main-build-0
```

### Deploy Jenkins master and slave on Openshift

Make sure the proper network security policies have been applied. Otherwise slave node will not be able to connect to master.
pr#0 doesn't have to exist.

```
~/Projects/zeva/.jenkins/.pipeline$ npm run deploy -- --pr=0 --env=dev
```

### Create zeva pipeline job in Jenkins

```
~/Projects/zeva$ yo bcdk:jenkins-job
? Module name? zeva
? Jenkins Job name? zeva
? What is the GitHub organization where the repository is located? bcgov
? What is the repository's name? zeva
? What is the Jenkinsfile path? Jenkinsfile
Writing 'jenkins-job' files.
   create .jenkins/docker/contrib/jenkins/configuration/jobs/zeva/config.xml
```

### Rebuild Jenkins to include the new pipline job created 

If builds could not start, manually delete two jenkins image stream and rerun the command.
```
~/Projects/zeva/.jenkins/.pipeline$ npm run build -- --pr=0 --dev-mode=true

> pipeline@1.0.0 build /Users/kfan/Projects/zeva/.jenkins/.pipeline
> node build.js "--pr=0" "--dev-mode=true"

Re-using image  tbiwaq-tools/ImageStreamImage/jenkins@sha256:19562b7307e461430fc4fc950c5c72d3300dc0826c5c7ac2dcd0ca289b5d2866 for build  buildconfig.build.openshift.io/jenkins-build-0
Re-using image  tbiwaq-tools/ImageStreamImage/jenkins-slave-main@sha256:56afeca0b6ea96d330a5a60447d8d8558535dc901ca9f7ad6590434335026db9 for build  buildconfig.build.openshift.io/jenkins-slave-main-build-0
```

### Commit all changes and push to GitHub

### Redeploy Jenkins with the new zeva pipeline job included
```
~/Projects/zeva/.jenkins/.pipeline$ npm run deploy -- --pr=0 --env=dev
```

## Tips

* Project team should be responsible to build jenkins slave, such as add npm modules into it, then no need to use npmw anymore
* Jenkins dev should not leave long, it is for testing only, once testing passed, should deploy Jenkins prod.
* After the Jenkins create successfully, two webhooks should have been created in zeva repo (if the webhooks show failed, it is ok as Jenkins may not be fully up yet)
* Under dev namespace, grant admin permission to service account "tbiwaq-tools/jenkins-prod", we only allow "tbiwaq-tools/jenkins-prod" to deploy on dev, test and prod, NOT to allow "tbiwaq-tools/jenkins-dev" to do anything on these three environment
