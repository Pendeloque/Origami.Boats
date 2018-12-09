# Origami Boats
### Web App / Capacitor Android App + Node Server

![Origami Boats running in the browser](img/webapp.png =250x)

The application consists of a web app (`src/client`) and a server application,
that'll consume generated `.obj` files of the boats on the client/app side via
`POST` requests (`src/server`).

### Getting started
1. `npm install` for installing required dependencies

##### The Client. Building the web app
1. `npm run client` will build the web app with [parcel](https://parceljs.org/)
to the `dist` folder (as well as watching for changes for development).
2. You might want to change the `ENDPOINT_URL` in `src/client/js/index.js` to
   match your server's IP address   

##### The Client. Generation of the android app 
1. `npx cap add android` will use [capacitor
  CLI](https://capacitor.ionicframework.com/) to generate the Android Studio
  project file for you.
2. `npx cap open android` opens Android Studio
3. Connect your Android device, build the project and use `Run/Run` from the
menu to start the application. Now start the server

---

##### The Server
- Create a directory `obj` in the root folder (`cd App/; mkdir obj`)
- `npm run server` will start the node server (port `1337`). It will print
  incoming requests to the console and write `.obj` files to the `obj/` directory.

---

### App Icon
To setup the Android application icon, in Android Studio just right-click on
`res/` folder and select `New/Image Asset`. Select the app icon from
`App/sketch/export` and finish the modal dialogue workflow.
