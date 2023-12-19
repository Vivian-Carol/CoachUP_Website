const express = require('express');
const studentController = require('../controllers/studentController');
const studentModel = require('../models/studentModel');
const { isAuthenticated } = require('../index.js');

const router = express.Router();

router.get('/', studentController.welcome);

//students routes
router.get('/signup', studentController.signup);
router.post('/students/signup', studentController.signupSubmit);
router.get('/students/signupSuccess', studentController.signupSuccess);
router.get('/login', studentController.login);
router.post('/students/login', studentController.loggedIn);
router.get('/dashboard', studentController.dashboard);

// Coach routes
router.post('/students/addCoach', studentController.addCoach);
router.get('/students/getCoaches', studentController.getAllCoaches);
router.get('/students/getCoachNames', studentController.getAllCoachNames);

//admin routes
router.get('/admin_login', studentController.adminlogin)
router.post('/admin/login_page', studentController.adminLoggedIn)

// Add middleware to check user role for admin routes
const checkAdminRole = (req, res, next) => {
    const user = req.session.user;
    if (user && user.role === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
};

// Admin dashboard route
router.get('/admin/dashboard', checkAdminRole, async (req, res) => {
    try {
        // Retrieve mentorship programs data
        const programs = await studentModel.findAllMentorshipPrograms();
        const students = await studentModel.findAllStudents();
        const coaches = await studentModel.findAllCoaches();

        // Check if data is available
        if (programs.length > 0 || students.length > 0 || coaches.length > 0) {
            res.render('displayDetails', { user: req.session.user, opportunities: programs, students: students, coaches: coaches });
        } else {
            res.status(404).send('No data available.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

//router.get('/displayDetails', (req, res) => {
//    res.render('displayDetails');
//});

// Render the page with the form
router.get('/admin_dashboard', (req, res) => {
    res.render('admin_dashboard.mustache');
});

router.get('/logout', studentController.logout);
//router.get('/events', studentController.displayData)
//router.get('/coaches', studentController.displayCoachesData)

// Handle mentorship program routes
router.post('/students/addProgram', studentController.insertMentorshipProgram);
router.post('/students/searchByCode', studentController.searchByCode);

// Define a custom middleware to log or check the request body
const checkRequestBody = (req, res, next) => {
    // Log the request body to the console
    console.log('Request Body:', req.body);
    next();
};

// Add the middleware before the route handler
router.post('/students/searchByCode', studentController.searchByCode);
router.post('/students/updateProgram', studentController.updateProgram);

// Add a GET route for /students/removeProgram
router.get('/students/removeProgram', (req, res) => {
    res.status(405).send('Method Not Allowed');
});

// Add a POST route for /students/removeProgram
router.post('/students/removeProgram', checkRequestBody, studentController.removeProgram);
router.post('/testInsertMentorship', studentController.testInsertMentorship);

// Booking routes
router.post('/bookings_insert', studentController.createBooking);
router.get('/my-bookings/:userId', studentController.getAllBookings);


router.get('/bookings/:bookingId', studentController.getBookingById);
router.put('/bookings/:bookingId', studentController.updateBooking);
router.delete('/bookings/:bookingId', studentController.removeBooking);

module.exports = router;