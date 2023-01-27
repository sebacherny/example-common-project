# Solar system network


To run the project locally, you will need the SQL database set up. For that:

. Go to https://postgresapp.com/
. Download dmg file
. Install the file in Applications and run it

After that, you can create a database. To create it from scratch:
## LINUX:
sudo su postgres
postgres$ psql
IF DATABASE EXISTS AND YOU WANT TO RESET IT:
drop database solar_systems ;
TO CREATE IT:
create database solar_systems;

## MAC:
After launching the App, click on the postgres file that will open a postgresql terminal, and just type:
postgres=# create database solar_systems;

After database is created, run:
python3 src/manage.py makemigrations
python3 src/manage.py migrate
python3 src/manage.py createsuperuser

Configure the environment variables from the terminal:
export SECRET_KEY="AnyKeyForDjango"
export DATABASE_URL=postgresql://localhost/solar_systems

export MAIL_SENDER_USER=mail@mail.com
export MAIL_SENDER_PASSWORD=pass

# Solar Edge API
export SOLAR_EDGE_API_KEY=SEkey

# PVWatts API
export PVWATTS_API_KEY=PVkey

# Enphase API
export ENPHASE_API_KEY=ENkey
export ENPHASE_USERNAME=ENuser
export ENPHASE_PASSWORD=ENpass
export ENPHASE_KEY=ENkey2

# For testing
export URL_PREFIX_FOR_LINK="127.0.0.1:8000"

Remove local pyc files from console: for f in $(find . -name "*pyc"); do rm $f; done

For heroku:

1) Create new app, log in ("heroku login") and follow the steps to link project folder to new app created
2) Install add-on for postgres
3) Change postgres url in src/.env and commit it
4) Run migrations and migrate simulatin heroku console
$ heroku run python src/manage.py makemigrations
$ heroku run python src/manage.py migrate

## Daily routines

For this we have the "worker" line in the Procfile.

After deploying, maybe this is needed:

heroku config:add PYTHONPATH=src/

heroku ps:scale web=1
heroku ps:scale worker=1

To see the logs (prints):
heroku logs --tail

## Testing

To test and run some functions for, for example, APIs, in order to see if we are getting correctly the info, we can do:

export PYTHONPATH=src/
python3 src/app/apis/enphase_api.py

## Explanation of the code

* manage.py is the Django file that we will run to start our service. Should never be modified.

* settings.py defines all the settings, like the lifetime of the tokens for logged in users and the path for some folders.
We also have defined here the environment variables needed for the API communication (with Enphase/SolarEdge) and some other things.

* File urls.py defines which urls are known and reachable by the app. Here, links starting with 'api/' are urls to which we can do some of GET, POST, PUT, and will return valuable information with the result after the process. These links can be accessed by anyone with the corresponding permissions.
The other links are the frontend, the views.

* api.js is where all the calls to the 'api/...' links are done. It defines functions that will do the GET, POST, PUT to our backend API, and these functions are called from the other javascript files.

* Other javascript files are the ones used for the frontend. They are imported in the corresponding .html files, which are themselves invoked when in the frontend we go to the links (the 'not api/ links').

### Database

* migrations folder contains the structure of the database. Whenever we modify the database (add/edit/remove a field from a table, for example), after running the makemigrations command as explained above, a new .py file is created in this folder automatically, reflecting the database modification.

* models.py has the database structure, defining each table as a class (models.Model) with its corresponding fields and field types.

### Folder organization

* static: Here we have all the css and javascript files
* templates: All the .html files invoked for each 'not api/...' view.
* apis: Here we have the files that will be communicating with external APIs:
  - enphase_api.py and solar_edge_api.py define the functions used to get the users in the system, each user inventory, the production of the system, etc.
  - pvwatts_api.py defines the functions to get information from PVWatts API with parameters.
* all_views: Here we have a file for each different type of object in our database, like SolarSystem or Inverter. We define here the GET, POST, PUT, DELETE functions that are invoked when a 'api/...' link is called.

## Important files and functions per feature:

* Solar Edge System creation:
  - views_solar_edge.py:
    + create_inverters_from_data: Creates Inverters in database from inventory
    + store_past_hourly_production_solar_edge: Stores AEP as a treated json in db.
    + update_solar_edge_output_solar_edge: If some information is already in the database but not up to date, we obtain information from the last requested date (so as to avoid unnecessary calls) and add it to the treated json.
  - solar_edge_api.py:
    + obtain_past_hourly_production: Fetches hourly historic AEP and treats it.
    + get_aep_day, get_aep_month, get_aep_year: Returns array of values from treated AEP json, for specific period.
    + get_site_energy, get_all_sites_info, get_site_details: Fetches information from SolarEdge API

* Enphase System creation:
  - views_enphase.py: Similar to views_solar_edge.py
  - enphase_api.py: Similar to solar_edge_api.py

* Array creation:
  - views_solar_array.py:
    + save_solar_array: Stores solar array in db. Inside, it calls get_treated_pvwatts_response and store_pvwatts_object.
    + store_pvwatts_object: Stores pvwatts information in db as treated json.
  - pvwatts_api.py:
    + get_pvwatts_info: Gets information from PVWatts according to array parameters.
    + get_treated_pvwatts_response: Treats json returned in get_pvwatts_info, and returns a json with each month, day and hour as a key. See example. Hours with 0 expected production are not informed.
    + _get_monthly_json: Defines the treated json for a specific month. Here we can see the json structure.
    + get_day_hourly_average, get_month_daily_average, get_year_monthly_average: Return array array of values for the dashboard.

* Dashboard:
  - views_system.py
    + dashboard_view: GET for dashboard frontend page is defined. It calls _get_solar_system_expected_production and _get_solar_system_actual_production
    + _get_solar_system_expected_production: For a specific period, for each solar array in the system it obtains the expected production and returns those values sum, as an array.
    + _get_solar_system_actual_production: If AEP is stored in database, it updates the information calling update_solar_edge_output, if not (for some weird reason but should never happen), it stores all the historic data. After having the treated information in the database, it returns the corresponding array of values for the specific period.

* Admin:
  - views_admin.py: Basically defines the three views to which we can do a GET request, obtaining the information to show the admin: all_users (displays users with systems and summary of aep/mep), clients_info (shows users from both enphase and solaredge), database_info (returns parsed information from database to display as a table).

* Login/Registration:
  - mail_sender.py: Defines function that sends mail from a fixed gmail address, that will contain the activation link for newly registered users and users that forgot their password.
  - custom_serializer.py: Handles token.
  - views_user.py: Defines methods for user interactions.
