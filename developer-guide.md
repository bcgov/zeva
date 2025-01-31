# Developer Guidelines

## Setting up the development environment

There is a docker-compose file in the root directory that will spin up the local development environment for you. If you don't have docker installed then head over to the docker homepage to get that started.

There are 6 services that make up the ZEVA application:

zeva_api_1  
zeva_db_1  
zeva_web_1  
zeva_minio_1  
zeva_rabbitmq_1  
zeva_mailslurper_1

## Running on an M1 Macbook

M1 macbooks run on a different chip than intel macbooks and pcs, which can cause problems with Docker. Currently it should be fine for either but if there's an issue in the future we may need to specify the source of some images.

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

## User Authentication

The application requires users to be authenticated using IDIR or BCeID.

When developing locally, you may want to assign different users to different profiles, for example, have a 'government' profile as well as a 'supplier' profile. Your IDIR should be used for your government account and your BCeID account should be used for supplier accounts. You can insert your own user_profile objects into the database.

### Insert your first user

to add your idir account:

in a terminal window:

```
docker-compose exec db psql -U postgres zeva
INSERT into user_profile (username, keycloak_email, is_active, create_user) VALUES ('your username', 'yourIdirEmail@gov.bc.ca', 't', 'your name');
```

the above code will create your new user in the system with just the required fields. For the purpose of this example your new user has an id of 123. If your email matches your idir email, the app should automatically map your profile when you first log into the system.

If your keycloak_user_id does not get filled/mapped, you can fill in the keycloak_user_id field manually by printing out your user token. To do this, open this file backend/api/keycloak_authentication.py and add a print statement after the user token is created, I added it on line 95 as so:

```
print("********")
print(user_token['preferred_username'])
print("********")
```

then, log into keycloak then look for the printed text in your backend container. It will look something like

```
********
df34439shgf5675343df57632e@idir
********
```

Copy the text between asterisks and update your user_profile record to use this as value for the keycloak_user_id field. You should now also add an organization_id to your user. For idir users, the organization should be Government of British Columbia, check the organization table for the id and fill in your user_profile record

```
select id from organization where organization_name = 'Government of British Columbia';
update user_profile set organization_id = 1 where user_id = 123;
```

You will not be able to see much yet as your user does not have roles, so roles need to be added using our join table, user_role.

To find the government roles use this code:

```
select * from role where is_government_role = True;
```

Pick a role that you want to be. Administrator is recommended because then you can update your roles from within the app, for the purpose of this that has an id of 1. Analysts can recommend approvals for vehicles, sales, transfers, model year reports, etc, and Directors can issue credits and approve those things so if you are testing any of those you will need those permissions.

```
insert into user_role (role_id, user_profile_id, create_user) values (1, 123, 'your name');
```

Now you should be able to log in as an idir user.

To log in as bceid, you need a developmental bceid account. We have several set up on the team, so reach out to the team for the login information.

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

### Database Postgres

to view the database via docker use:
docker-compose exec db psql -U postgres zeva

#### Copy down dev data from local

if you want to have a database full of fake data for testing without logging into openshift, there is a file called zeva-dev.tar in teams under Zeva>Database Files

move that file into the openshift/scripts folder then rename the file to 'zeva.tar'. Run import-data-from-local.sh in terminal with your local postgres container as the only argument. Ensure that the tar file is deleted after running. Now you will have data locally and just need to assign userIds to the new users that have been imported in.

#### Copy down Test/Prod data from Openshift

Copy test/prod data into your local database using the
/openshift/scripts/import-data.sh script
This is a bash script that creates a pg_dump .tar file from and openshift postgres container
and imports it into a local postgres container

There are # 2 Arguments

- $1 = 'test' or 'prod'
- #2 = 'local container name or id'

# example command

- . import-data.sh dev 398cd4661173

You will need to be logged into Openshift using oc
You will also need your ZEVA postgres docker container running

if theres permission issues with lchown while running the script, run the script step by step (comment out after line 57, double check that it copied the tar file into it, then comment out the earlier steps and run it again with just the later lines)

if there's still issues, it might be a corrupted .tar file. See if someone else can export it and put it in the openshift folder. Then comment out the import script up until the tar gets copied into a local container. Then try running it.

Another issue that has come up was fixed by removing a lock in the database.
Locks were removed by using this statement:

```
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid();
```

this may be enough to run the script but also the public schema can be deleted and recreated
DROP SCHEMA public cascade;

CREATE SCHEMA public AUTHORIZATION postgres;

then the script can be run.

## Assign keycloak ids to users in local database

if you have grabbed data from dev or test but can't log into any users, you can run the update_users.sql script to assign keycloak logins to users. The file is located in teams under Database Files. Save that to your local and then run the following lines of code to 1. copy it into your postres container on docker 2. go into that container 3. run the script within that container
cp update_users.sql _containerID_:/update_users.sql
docker exec -it _containerID_ bash
psql -U postgres -d zeva -f /update_users.sql
