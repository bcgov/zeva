# Developer Guidelines

## Setting up the development environment

There is a docker-compose file in the root directory that will spin up the local development environment for you. If you don't have docker installed then head over to the docker homepage to get that started.

There are 7 services that make up the ZEVA application:

zeva_api_1          
zeva_db_1           
zeva_web_1          
zeva_keycloak_1     
zeva_minio_1        
zeva_rabbitmq_1     
zeva_mailslurper_1  

## Code style and Linting

We use [Eslint](https://eslint.org/) to lint the app's code and [Prettier](https://prettier.io/) to format it. The following npm scripts can be used to trigger linting and formatting:

- `npm lint`: Runs Eslint and prints all the errors and warnings
- `npm pretty`: Reformats the code using Prettier

### VSCode plugin

The ESLint and Pretter VSCode plugins are recommended.
Adding the following setting to your VSCode workspace settings is required for the ESLint plugin to work:

```
"eslint.workingDirectories": ["app"]
```

## Testing

Tests on the database uses unittest the python testing framework
You can run the tests from your local container first by launching an interactive shell
``` docker exec -it <container_name> sh ```
to run tests use a terminal in the api container and type
`python manage.py test`

or to run specific test files, point to the folder or file
`python manage.py test api.services.tests.test_credit_transfers.py`

Tests on the frontend use Jest

- `npm test`: Runs Jest for all unit tests in the project

To run a specific test make sure jest is installed globally and then run:
`jest -t 'fix-order-test'`
This will only run tests that match the test name pattern you provide.

## User Authentication

The application requires users to be authenticated using keycloak.

to access keycloak console on local, go to localhost:8888
when developing locally, you may want to assign different users to different profiles, for example, have a 'government' profile as well as a 'supplier' profile. To update keycloak profiles, go to the keycloak console (8888), then click users, then view all users. select one, then click attributes. Look at the database user_profiles table, find one that has an organization that matches what you want, or update one, then use that username as the 'Value' on keycloak. Different users have different permissions to view pages and complete actions.

## Code Changes

Code changes are merged into tracking branches: `ex. release-1.40.0`
Releases are made from the tracking branches into the test environment, and then production

Pull Requests should have descriptions of changes and a title that references the 
ticket number the task is associated with

### Commit Message Conventions

This project follows the commit message conventions outlined by [Convential Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**.

We also extend this prefix convention to the naming of **branches**, eg: `docs/add-readme` or `feat/some-feature`.

### Database Postgres

to view the database via docker use:
docker-compose exec db psql -U postgres postgres

#### Copy down Test/Prod data from Openshift

To copy test/prod data into your local database use the following steps.

1. Open a local terminal and Login to openshift console using your login command
2. SSH into the database container in openshift
``` oc rsh patroni-test-0 ```
3. Create a database dump in the container
``` pg_dump -U postgres -F t zeva > zeva.tar ```
4. Move .tar file to tmp directory, create directory if it doesnt exist
``` mkdir /tmp ```
``` mv zeva.tar /tmp ```
5. From a new terminal window, Download the .tar to your local
``` oc rsync patroni-test-0:/tmp/zeva.tar ./ ```
6. Copy the .tar file to your running local database container (if using docker-compose)
``` docker cp zeva.tar <container_name>:/tmp/zeva.tar ```
7. login to an interactive docker shell
``` docker exec -it <container_name> sh ```
8. Use pg_restore to drop and restore your local database
``` pg_restore -U postgres -Ft -c -d postgres < zeva.tar ```