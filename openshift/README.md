# Zeva Pull Request based Pipeline

This readme file shows the process of adopting [BCDK](https://github.com/bcdevops/bcdk) as pull request based pipeline for [Zeva](https://github.com/bcgov/zeva) project.

The sample component built and deployed by the pipeline is frontend.

Create a branch called zeva-bcdk from master and all the following works are based on this branch.

## Section 1 Create pull request based pipeline

A folder .pipeline will be created under project root.  
If all steps are gone through smoothly, it will have the following structure.  
Commands will be available to build images and deploy to various environment at the end.

```
-.pipeline
    -lib
        build.js
        clean.js
        config.js
        deploy.js
    -node_modules
        -@bcgov
            -pipeline-cli //https://github.com/BCDevOps/pipeline-cli
        ... //various nodejs modules
    .nvmrc
    build.js
    clean.js
    deploy.js
    npmw
    package.json
    package-log.json
```      

### 1.1 Create .pipeline folder

Run Yeoman generator to create .pipeline folder structure.  
Zeva has only one module, it has various components(frontend, backend and etc.) under it. The pipeline created will build and deploy module Zeva. If your project has multiple modules and each module has one pipeline, please ask help from BCDK developers.

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

### 1.2 Create frontend build and deploy template for Openshift

* [openshift/templates/frontend/frontend-bc.yaml](https://github.com/bcgov/zeva/blob/master/openshift/templates/frontend/frontend-bc.yaml)
* [openshift/templates/frontend/frontend-dc.yaml](https://github.com/bcgov/zeva/blob/master/openshift/templates/frontend/frontend-dc.yaml)


### 1.3 Customize frontend build process in pipeline

Update ./pipeline/line/build.js line 14. The value of the param are included in ./pipeline/lib/config.js. The current phase is build and new values can be add to config.js.
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
Save the file, commit all changes, push to GitHub and create a pull request from zeva-bcdk to master. Assume the pull request number is #18.

### 1.4 Build the pul request on commandline

Build Config zeva-frontend-build-18 will be created under tools namespace.
```
~/Projects/zeva/.pipeline$ npm run build -- --pr=18
```

### 1.5 Customize deploy process in pipeline

Update ./pipeline/line/deploy.js line 15. The values of param are also from ./pipeline/lib/config.js.

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

### 1.6 Deploy the pull request to dev on command line

Deployment config zeva-frontend-dev-18 will be created under dev namespace.
```
~/Projects/zeva/.pipeline$ npm run deploy -- --pr=18 --env=dev
```

### 1.7 Cleanup deployment configurations created for the pull request

The deployment configs, services, routes and image tags related to the pull request will be removed.  
Recommend to run the cleanup command if a redeployment of a pull request encountering an issue.
```
~/Projects/zeva/.pipeline$ nnpm run clean -- --pr=18 --env=dev
```

## Section 2 Setup Jenkins on Openshift

Create Jenkins master and slave instances on Openshift. Also create Zeva pipeline job on Jenkins. The pipeline job is able to scan pull requests when they are created/modified and trigger the pipeline as describe in the Jenkinsfile under project root.  
If all steps can go through smoothly, the following folder structure will be created under project root folder.  
The contents under .jenkins/.pipeline are similar as section 1. The idea is to use same pipeline to maintain Jenkins itself for the project.  
Project team can customize Jenkins by adding/changing the contents under .jenkins/docker and .jenkins/openshift folder. Especially for Jenkins slave image, it can be customize to add extended modules.    
A Jenkinsfile will also be created under project root.
```
-.jenkins
    -.pipeline
        -lib
            build.js
            clean.js
            config.js
            deploy.js
        -node_modules
            -@bcgov
                -pipeline-cli //https://github.com/BCDevOps/pipeline-cli
            ... //various nodejs modules
        .nvmrc
        build.js
        clean.js
        deploy.js
        npmw
        package.json
        package-log.json
    -docker
        -contrib
            -jenkins
                -configuration
                    -jobs
                        _jenkins
                            config.xml
                        _zeva
                            config.xml
        Dockerfile
    -openshift
        build-master.yaml
        build-slave.yaml
        deploy-master.yaml
        deploy-prereq.yaml
        deploy-slave.yaml
        secrets.json
    Jenkinsfile
    README.md
```

### 2.1 Create .jenkins folder

Run Yeoman generator to create .jenkins folder structure.  
Jenkins only has build, dev and prod and they are all under tools project. Jenkins dev deployment should live under very short time, once it is verified ok, it should be removed. Jenkins prod is the one used to scan, build and deploy pull requests.  

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

Commit .jenkins folder, yes only commit is required for now. 

### 2.2 Build Jenkins master and slave images on Openshift

Just provide value 0 to pr. Two image streams and two build configs will be created for Jenkins master and slave.

```
~/Projects/zeva/.jenkins/.pipeline$ npm run build -- --pr=0 --dev-mode=true
> pipeline@1.0.0 build /Users/kfan/Projects/zeva/.jenkins/.pipeline
> node build.js "--pr=0" "--dev-mode=true"

Starting new build for  buildconfig.build.openshift.io/jenkins-build-0
Starting new build for  buildconfig.build.openshift.io/jenkins-slave-main-build-0
```

### 2.3 Deploy Jenkins master and slave on Openshift

Make sure the proper network security policies have been applied. Otherwise slave node will not be able to connect to master.
pr#0 doesn't have to exist.

```
~/Projects/zeva/.jenkins/.pipeline$ npm run deploy -- --pr=0 --env=dev
```

### 2.4 Create Zeva pipeline job in Jenkins

The pipeline job will scan pull requests. Then it will run Jenkinsfile under project root to build and deploy the identified pull requests.

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

### 2.4 Rebuild Jenkins to include the new pipline job created 

If builds could not start, manually delete two jenkins image stream and rerun the command.
```
~/Projects/zeva/.jenkins/.pipeline$ npm run build -- --pr=0 --dev-mode=true

> pipeline@1.0.0 build /Users/kfan/Projects/zeva/.jenkins/.pipeline
> node build.js "--pr=0" "--dev-mode=true"

Re-using image  tbiwaq-tools/ImageStreamImage/jenkins@sha256:19562b7307e461430fc4fc950c5c72d3300dc0826c5c7ac2dcd0ca289b5d2866 for build  buildconfig.build.openshift.io/jenkins-build-0
Re-using image  tbiwaq-tools/ImageStreamImage/jenkins-slave-main@sha256:56afeca0b6ea96d330a5a60447d8d8558535dc901ca9f7ad6590434335026db9 for build  buildconfig.build.openshift.io/jenkins-slave-main-build-0
```
Commit all changes and push to GitHub

### 2.5 Redeploy Jenkins with the new zeva pipeline job included
```
~/Projects/zeva/.jenkins/.pipeline$ npm run deploy -- --pr=0 --env=dev
```

## Tips
* Project team should be responsible to build jenkins slave, such as add npm modules into it, then no need to use npmw anymore
* After the Jenkins create successfully, two webhooks should have been created in zeva repo (if the webhooks show failed, it is ok as Jenkins may not be fully up yet)
* Under dev namespace, grant admin permission to service account "tbiwaq-tools/jenkins-prod", we only allow "tbiwaq-tools/jenkins-prod" to deploy on dev, test and prod, NOT to allow "tbiwaq-tools/jenkins-dev" to do anything on these three environment
