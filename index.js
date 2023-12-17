const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const studentRoutes = require('./routes/studentRoutes');
const path = require('path');
// Enable CORS
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());

// View engine setup
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));


app.use('/public', express.static('public'));

app.use(
    session({
        secret: '1234',
        resave: false,
        saveUninitialized: false,
    })
);

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Logout failed.");
        }
        res.status(200).send("Logout successful.");
    });
});


app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.use('/', studentRoutes);

// Include the studentRoutes
app.use('/', studentRoutes);
app.use('/students', studentRoutes);
app.use('/admin', studentRoutes);

app.post('/students/removeProgram', (req, res) => {
    // Assuming you have a function in your studentModel to remove the program by code
    studentModel.removeProgram(req.body.programCode).then((result) => {
        if (result) {
            res.json({ success: true, message: 'Program removed successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Program not found.' });
        }
    }).catch((error) => {
        res.status(500).json({ success: false, message: 'An error occurred.', error: error });
    });
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('');
    console.log('Starting CoachUp Applications...');
});