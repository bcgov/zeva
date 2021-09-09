 
# Zero-Emission Vehicles
Facilitates online Zero-Emission Vehicle (ZEV) sales reporting by regulated parties (automakers), plus issuance and transfer of ZEV credits. This is to support compliance with the ZEV Act regulations that require increasing sales of ZEVs to reduce GHG emissions from vehicles in the province.

update test

# Project Architecture
The project is a typical we application, it has frontend, backend and database.  
* Frontend: Nodejs and React
* Backend: Python and Django
* Database: Postgresql 10 and Patroni  
* Object Storage: Minio
* Application Monitoring: Nagios
* Database Backup: [BackupContainer](https://github.com/BCDevOps/backup-container)
* Cloud Platform: [Openshift](https://docs.openshift.com/container-platform/4.6/welcome/index.html)
* Database Documentation: [SchemaSpy](http://schemaspy.org/)

# Project Pipeline 
The project uses pull request based pipeline is supported by [BCDK](https://github.com/BCDevOps/bcdk) and follow the instructions at [here](https://github.com/bcgov/zeva/tree/release-1.26.0/openshift/README.md) to setup the pipeline.

# Build and deploy
## Application Setup on Openshift platforms
* All templates are located under openshift/templates folder.
* Follow the instructions [here](https://github.com/bcgov/zeva/tree/release-1.26.0/openshift/templates/README.md) to setup The application on Openshift.

## CI/CD
### Build and deploy in Jenkins
Once Jenkins is up and running, it automatically builds pull requests and promote to dev, test and prod with confirmation. The Jenkins url can be found in Openshift under project's Networking->Routers.

### Build and deploy in command line
* Cd to .pipeline folder and run the following command line to build pull requests and deploy to environment.  
    * $ npm run build -- --pr=pull-request-number --env=build
    * $ npm run deploy -- --pr=pull-request-number --env=dev/test/prod  
* When a pull request is closed or merged, all resources created for the pull request is removed by Jenkins automatically. They also can be remove the the following command.  
    * $ npm run clean -- --pr=pull-request-number --env=build/dev/test/prod

# License
Code released under the [Apache License, Version 2.0](./LICENSE).
