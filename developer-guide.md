# Developer Guidelines

## Setting up the development environment

There is a docker compose file in the root directory. You can use that and podman desktop (https://podman-desktop.io/) to start up your local development environment.

There are 4 services that make up the ZEVA application:

db  
api (backend)
minio
web (frontend)

To populate the database with data, you can import data from our openshift development database using the `import-data.sh` script (see the section below titled `Copy down Test/Prod data from Openshift`). Alternatively, you can, inside the `api` container, run the `load_ops_data` django command (located at `/backend/api/management/commands`) to populate the database with some data specified explicitly in this codebase.

To log in to the app, see the section below titled `Logging into the app for the first time`.

## Code style and Linting

We use [Eslint](https://eslint.org/) to lint the app's code and [Prettier](https://prettier.io/) to format it. The following npm scripts can be used to trigger linting and formatting:

- `npm lint`: Runs Eslint and prints all the errors and warnings
- `npm pretty`: Reformats the code using Prettier

## Testing

Tests on the database uses unittest the python testing framework
You can run the tests from your local container first by launching an interactive shell
`docker exec -it <container_name> sh`
to run tests use a terminal in the api container and type
`python manage.py test`

or to run specific test files, point to the folder or file
`python manage.py test api.services.tests.test_credit_transfers.py`

Tests on the frontend use Jest

- `npm test`: Runs Jest for all unit tests in the project

To run a specific test make sure jest is installed globally and then run:
`jest -t 'fix-order-test'`
This will only run tests that match the test name pattern you provide.

### Logging into the app for the first time

On the app's login page, select "Login with IDIR", and if your login is not successful, do the following:

In your `api` container logs, look for the text "encountered the following unmapped keycloak profile"; if you see this text, you should also see an object following it, and this object should have a `sub` field. Take this field's value and, inside your local db container, go to the `user_profile` table of the `zeva` database, and either create a new record whose value under `keycloak_user_id` is the `sub` value, or update an existing user record so that its `keycloak_user_id` is the aforementioned `sub` value.

After this, you should now be able to log in.

Doing the above maps your keycloak account to a zeva account; you may "move" your `sub` (which stands for subject identifier) amongst the various user records in the `user_profile` table to log in as different users.

## Code Changes

Code changes are merged into tracking branches: `ex. release-1.40.0`
Releases are made from the tracking branches into the test environment, and then production

Pull Requests should have descriptions of changes and a title that references the
ticket number the task is associated with

### Commit Message Conventions

This project follows the commit message conventions outlined by [Convential Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**.

We also extend this prefix convention to the naming of **branches**, eg: `docs/add-readme` or `feat/some-feature`.

To add additional uniqueness to branch names and avoid naming collisions we prefix our branch names with the developer's first name, and suffix the branch name with the ticket number of the task being worked on. template: `<prefix>/<developername>-<worksummary>-<ticketnumber>`

Here are a few examples of branch names:
`feat/alex-updates-to-compliance-reports-1047`
`fix/john-button-logic-fix-2048`
`chore/alice-linting-fixes-3013`

#### Copy down dev data from local

if you want to have a database full of fake data for testing without logging into openshift, there is a file called zeva-dev.tar in teams under Zeva>Database Files

move that file into the openshift/scripts folder then rename the file to 'zeva.tar'. Run import-data-from-local.sh in terminal with your local postgres container as the only argument. Ensure that the tar file is deleted after running. Now you will have data locally and just need to assign userIds to the new users that have been imported in.

#### Copy down Test/Prod data from Openshift

Copy test/prod data into your local database using the `/openshift/scripts/import-data.sh` script. This is a bash script that creates a pg_dump file from the openshift postgres container and imports it into a local postgres container.

There are 2 Arguments:

- $1 = 'test' or 'prod'
- #2 = 'local container id'

# example command

- . import-data.sh dev 398cd4661173

You will need to be logged into Openshift using oc
You will also need your ZEVA postgres docker container running

If the copy over fails or is incomplete, you can drop your local `zeva` database, then create it again (using the same name). After that, run the script again. Warnings and errors are expected as the openshift database has extensions your local database doesn't have.
