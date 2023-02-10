# Christenson and Recendes project


To run the project locally, you will need the SQL database set up. For that:

. Go to https://postgresapp.com/
. Download dmg file
. Install the file in Applications and run it

After that, you can create a database. To create it from scratch:
## LINUX:
sudo su postgres
postgres$ psql
IF DATABASE EXISTS AND YOU WANT TO RESET IT:
drop database christenson_and_recendes_db ;
TO CREATE IT:
create database christenson_and_recendes_db;

## MAC:
After launching the App, click on the postgres file that will open a postgresql terminal, and just type:
postgres=# create database christenson_and_recendes_db;

After database is created, run:
python3 src/manage.py makemigrations
python3 src/manage.py migrate
python3 src/manage.py createsuperuser

Configure the environment variables from the terminal:
export SECRET_KEY="AnyKeyForDjango"
export DATABASE_URL=postgresql://localhost/christenson_and_recendes_db

## Explanation of the code

* manage.py is the Django file that we will run to start our service. Should never be modified.

* settings.py defines all the settings, like the lifetime of the tokens for logged in users and the path for some folders.

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
* all_views: Here we have a file for each different type of object in our database, like Spreadsheet or SpreadsheetRow (The terms Spreadsheet and Dataset are used interchangably in the code). We define here the GET, POST, PUT, DELETE functions that are invoked when a 'api/...' link is called.


## How to add a new column in the Alumni Dashboard

Let's say we want to add a new column to this data, for example 'email'.
One way to figure it out is to look in the files for e.g. the word 'major' (careful with case-sensitiveness) and see how and where it is used.

The steps to do so are as follows:

1. Add the field in the Model (file models.py), in the StudentInformation class, imitating the behaviour of the 'major' field (or any Text Field for that matter).
If some StudentInformation objects already exists (which will probably be the case), don't forget to add a default value so that there are no conflicts. May be an empty value, it's so that Python knows what to do in those existing objects and doesn't crash.
It would be done like: <b>email = models.CharField(max_length=500, blank=True, default='')</b>
2. Add a line in the views_sports.py file, in the POST part where rows are stored, reflecting that the row.email will come from the uploaded spreadsheet, specifying the header.
3. In the dashboard_sports.js file, where the table is created and displayed, add a column in the table to display the new one. You will have add 3 things:
  
  a) Function similar to getMajorFromRow, using both the spreadsheet header and the field added in the .py files.
  
  b) Header (object < th >) in the desired order (careful for the use of sortTable, check indexes)
  
  c) Display value in column (object < td >) in the same order, calling the function created in 3.a)

After these steps, the code is ready. So we need to let the database (which is independent from the code) know about this new field.
To do that, as stated above, in a Linux/Mac terminal with the project from github cloned:
1) export DATABASE_URL=postgresql_link_from_render
1.b) Maybe something like 'export SECRET_KEY=anything' is needed, just do that, it won't have any impact.
2) python3 src/manage.py makemigrations
3) python3 src/manage.py migrate

Now, our Postgresql has in the StudentInformation model, the new field added.
So you should be able to deploy the changes (git add, commit, push), upload a new Alumni dataset as an admin, and see the new field in the table.


If you want to create a filter similar to the ones that exist for example to filter a list of graduation_years, then you should mostly edit the dashboard_sports.js file, imitating the code for the other filters.