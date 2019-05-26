# Bowman

## Installing prerequisites and running the server

### Install Node

[You can get Node.js here](https://nodejs.org/en/).

### Install yarn

Yarn is a replacement for Node Package Manager (npm). This project probably works
with `npm` as well, but hasn't been tested.
[Insructions on how to install Yarn for different platforms](https://yarnpkg.com/en/docs/install)

### Install and PostgreSQL

[You can download it from here](https://www.postgresql.org/). I won't cover the
installation procedure here, but if you happen to run [Docker](https://www.docker.com/)
on your computer, I'll guide you through a simpler way to get the DB running:

- Create a `.env` file in the project root, and add the following contents to it:

```
PGHOST=localhost
PGPORT=5435
PGDATABASE=bowman
PGUSER=bowman
PGPASSWORD=bowman
```

We use [dotenv](https://github.com/motdotla/dotenv) for configuration, and the above
creates the DB configuration for us. Now we'll have to fetch and start the PostgreSQL
Docker image:

`docker run --name bowman -p 5435:5432 -e POSTGRES_DB=bowman -e POSTGRES_USER=bowman -e POSTGRES_PASSWORD=bowman -d postgres:10.2`

(on Linux you have to prefix the command with sudo)

If the command is successful, you should have a Docker container running the database. You can check that
it's running with:

`docker ps`

You will also need the PostgreSQL command-line client `psql` which comes with the PostgreSQL
download, or e.g. Homebrew package on Mac. The client [can also be run from the Docker container](https://hub.docker.com/_/postgres/) but looks a bit more complicated than.

### Create Google Login client ID and secret key

To use Google login for your application, you will have to create a project in
[Google Cloud Console](https://console.cloud.google.com) (log in with your gmail address).

Just give the project any name you want, then choose Credentials -> Create credentials -> Oauth Client ID
Choose this type of the application: "Web application", and give it a name again.

Now the important part, enter this to Authorized JavaScript origins:

`http://localhost:8080`

And this to Authorized redirect URIs:

`http://localhost:8080/auth/google/callback`

You can later add the real URI of your application to the above configuration options here
when it's running on a "real" server accessible from anywhere.

After these steps, you get a _client ID_ and _client secret_. Configure these two in the
`.env` file:

```
GOOGLE_CLIENT_ID=<The client ID you got>
GOOGLE_CLIENT_SECRET=<The client secret you got>
```

You'll also have to enable Google+ API for the project. Navigate to Google+ API in the menu or
Go to this address:
`https://console.developers.google.com/apis/api/plus.googleapis.com/overview?project=<YOUR PROJECT NAME>`

And click the enable Google+ API -button.

### Add a user to the database

In order to log in to your system, it has to know about you. Add a desired user by logging into PostgreSQL:

```
psql -d bowman -h localhost -U bowman -p 5435
```

And inserting the desired user:

```
INSERT INTO user_account (login, name) VALUES ('some.real.google.account@gmail.com', 'John Doe')
```

### Run the server

Run commands:

```
yarn install
yarn watch
```

and wait until you see database initialization messages, webpack build
output and: `server listening on port 8080`. After those you can go to the following address in your
browser:

`http://localhost:8080/`

And the login screen should appear. You should log in with the user you inserted into the database.

## Migrations

Migrations are located under `server/migration/migrations`. They use [db-migrate](https://www.npmjs.com/package/db-migrate)
library and are run on Node server startup. There are two existing migrations which create
a table for user accounts and sessions. These both use plain SQL (the relevant part is in `sqls/XX-up.sql`). The `db-migrate` library
allows the migrations to also be written in JavaScript, and although the existing migrations are implemented with SQL, the
JavaScript boilerplate is still there.

To create a new empty migration file, run:

```
yarn run create-migration
```

Note: the server watch should be shut down when a new migration is created, otherwise it runs the empty migration when it restarts
and considers it executed. If this happens accidentally, just remove the row from `migrations` table.

## Google authentication

Google login functionality is implemented with [Passport](http://www.passportjs.org/docs/). The glue code required to
implement authentication and limit access to resources is in the modules under `server/auth`.

## Client-side routing

The routing uses [route-parser](https://github.com/rcs/route-parser) for defining the route paths and parameters.
The routes do not use hash (#). Instead, going to _view1_ with a parameter _x_ looks like this:

`http://localhost:8080/view1/x`

Avoiding hashes allows the server to see the route paths as well when they are first loaded. This means that if
you have not yet logged in, the server can redirect you back to `view1/x` after google authentication. The downside
is that the server also has to know in a finer grained way which routes are for the client. That is why `server/server.js`
has these rows:

```
const clientAppHtml = (req, res) => res.sendFile(path.resolve(`${__dirname}/../dist/index.html`))
app.use('/view1*', clientAppHtml)
app.use('/view2*', clientAppHtml)
```

You will have to define all "main client routes" like that on the server side _or_ you can skip the hassle
by prefixing all client routes with something like this:

```
app.use('/ui*', clientAppHtml)

```

The router avoids full page reloads by using [browser history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
after the client-side web application is first loaded.

The router code is in `webapp/router.js` and a few example routes are in `webapp/routes.js`.

## Styles

The main page `web-resources/index.html` (and login page) includes styles from
[Spectre.css](https://picturepan2.github.io/spectre/getting-started.html)
just because they are nicer than browser defaults. But they are not deeply coupled into this template application in
any way, you can just throw them away and define your own.

## Icons

Euro SVG Vector image (euro-svgrepo-com.svg) is from:
https://www.svgrepo.com/svg/4828/euro
It is licensed under Creative Commons license.
