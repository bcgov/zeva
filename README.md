# Zero-Emission Vehicles

Facilitates online Zero-Emission Vehicle (ZEV) sales reporting by regulated parties (automakers), plus issuance and transfer of ZEV credits. This is to support compliance with the ZEV Act regulations that require increasing sales of ZEVs to reduce GHG emissions from vehicles in the province.

[![Lifecycle:Stable](https://img.shields.io/badge/Lifecycle-Stable-97ca00)](https://www2.gov.bc.ca/gov/content/industry/electricity-alternative-energy/transportation-energies/clean-transportation-policies-programs/zero-emission-vehicles-act)

# Project Architecture

The project is a typical we application, it has frontend, backend and database.

- Frontend: Nodejs and React
- Backend: Python and Django
- Database: Postgresql 10 and Patroni
- Object Storage: Minio
- Application Monitoring: Nagios
- Database Backup: [BackupContainer](https://github.com/BCDevOps/backup-container)
- Cloud Platform: [Openshift](https://docs.openshift.com/container-platform/4.6/welcome/index.html)
- Database Documentation: [SchemaSpy](http://schemaspy.org/)

## Development

Additional developer information - [Developer guide](./developer-guide.md)

Unfortunately we do not have a licence to use Docker Desktop at BC Gov. If you are on a mac [here is a blogpost](https://naomiaro.hashnode.dev/replacing-docker-desktop-with-lima-on-mac-os) about how to setup Lima as an alternative solution for development purposes.

### Backend

The backend and all services are setup to run via docker. To start everything up you can run in the project folder:

```sh
docker-compose up --build
```

This will start up a [postgres](https://www.postgresql.org/) database, a [Django](https://www.djangoproject.com/) web app, and a [MinIO](https://docs.min.io/docs/minio-quickstart-guide.html) service with a private bucket `zeva`

Add this entry to your `/etc/hosts` file:

```sh
127.0.0.1 minio
```

to view the database use:
docker-compose exec db psql -U postgres postgres


#### Django

Django offers many helpful [mangement commands](https://docs.djangoproject.com/en/4.0/ref/django-admin/) out of the box. To be able to use these with docker you can access the python environment with bash:

```sh
docker-compose exec api bash
```

You can view Django Restframework's browseable api here: `http://localhost:8000/api/`

#### MinIO

You can view the contents of the bucket in MinIO by visiting `http://localhost:9001/login`. Use env variables `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` to login to the console. Default values are found in `minio.env`

We take advantage that MinIO is S3 compatible and use [django-storages](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html) S3 backend for media files.

### Auth

We are using a shared realm [Keycloak](https://www.keycloak.org/) client. Shared realm clients can be accessed and configured via [Common Hosted Single Sign-on (CSS)](https://bcgov.github.io/sso-requests)


### Email

We are using [CHES](https://digital.gov.bc.ca/common-components/common-hosted-email-service) to send email. Documentation is [available here](https://getok.nrs.gov.bc.ca/app/documentation)

<!-- To get access to the created client, go [request account](https://getok.nrs.gov.bc.ca/app/requestAccount) with application acronym `ITVR`. This will allow you to reset client secrets for environments (dev, test, prod) as needed. -->

## Deployment

We use [Openshift](https://www.redhat.com/en/technologies/cloud-computing/openshift) to deploy our applications. [Access the console here](https://console.apps.silver.devops.gov.bc.ca/k8s/cluster/projects)

There's training on Openshift offered by BCDevExchange. Check the [schedule here](https://bcdevexchange.org/learning)

### Git Process/ Rebasing

We use git for version control.
Each developer has their own fork of the repo and works off of branches from there
Read more in the [Developer guide](./developer-guide.md)

### Testing

backend tests will be recognized and run with other tests if they have follow this naming convention:
test\_[name].py
eg. test_credit_transfers.py

to run tests use a terminal in the api container and type
python manage.py test

or to run specific test files, point to the folder or file
python manage.py test api.services.tests.test_credit_transfers.py

### Squashing migrations

To squash migrations: python manage.py squashmigrations {app_name} {#_of_migration_you_wish_to_squash_up_to_and_include}
For example: "python manage.py squashmigrations api 0100" will squash all migrations between the first migration and the 100th migration, inclusive.

If, in the migrations you're squashing, there exists RunPython operations executing certain functions, those functions will have to be copied into the squashed migration file, and the RunPython operations in the squashed migration file will have to reference those copied over functions.

Once the squashed migration file has been run in all environments (check the django_migrations table in each environment's database to make sure there's a record of the squashed migration file being run), delete the squashed migrations and delete the "replaces" attribute in the Migration class of the squashed migration. If there are any migrations that depend on a deleted migration, you will have to change them to depend on the squashed migration instead. The squashed migration file is now a normal migration.

# Project Pipeline

The project uses pull request based pipeline is supported by [BCDK](https://github.com/BCDevOps/bcdk) and follow the instructions at [here](https://github.com/bcgov/zeva/tree/release-1.26.0/openshift/README.md) to setup the pipeline.

# Build and deploy

## Application Setup on Openshift platforms

- All templates are located under openshift/templates folder.
- Follow the instructions [here](https://github.com/bcgov/zeva/tree/release-1.26.0/openshift/templates/README.md) to setup The application on Openshift.

## CI/CD

### Build and deploy in Jenkins

Once Jenkins is up and running, it automatically builds pull requests and promote to dev, test and prod with confirmation. The Jenkins url can be found in Openshift under project's Networking->Routers.

### Build and deploy in command line

- Cd to .pipeline folder and run the following command line to build pull requests and deploy to environment.
  - $ npm run build -- --pr=pull-request-number --env=build
  - $ npm run deploy -- --pr=pull-request-number --env=dev/test/prod
- When a pull request is closed or merged, all resources created for the pull request is removed by Jenkins automatically. They also can be remove the the following command.
  - $ npm run clean -- --pr=pull-request-number --env=build/dev/test/prod

# License

Code released under the [Apache License, Version 2.0](./LICENSE).

# List of Dev Work | What to do before bringing in a new ticket into a Sprint

This is a list that was created on 2023-02-01 with all Zelda Devs to provide alternative work instead of bringing in a new ticket.  

**Team Rule* Do not bring in ticket After Friday* 

1. Help another Dev - see if other Devs need help to finish their ticket 

2. PR Reviews – linked to the task above 

3. Writing additional tests – for both tront and back end 

4. Take a look at Tech Debt tickets - If we bring in tickets let's bring in Tech Debt first 

5. Learning time: 

- Take the opportunity to familiarize yourself with business logic, tech (anything around work we do) 

- New learning and applying it to our work 

- Innovation work 

