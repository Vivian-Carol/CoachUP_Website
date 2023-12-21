


File and Folder Descriptions:

File/Folder
Purpose and Description
index.js
Main entry point of the Node.js application. Sets up Express, handles routing, and starts the server.
controllers/
Contains the studentController.js handles student and admin operations.
db/
Folder containing NeDB databases. coaches.db, mentorship.db, students.db and booking.db store data for coaches, mentorship programs, students, and booked sessions respectively.
models/
Folder containing the model file, studentModel.js, for defining data models and interacting with the databases.
node_modules/
Automatically generated folder containing project dependencies installed using npm or yarn.
public/
Folder for serving static assets like images and HTML files. index.html is the static landing page for visitors, and styles.css contains CSS styles for the application.
routes/
Folder containing route files. studentRoutes.js defines the application's routes and maps them to controller functions.
views/
Folder for Mustache view templates. Includes templates like header.mustache, admin_login.mustache, displayDetails.mustache, etc., for rendering various parts of the web application.

