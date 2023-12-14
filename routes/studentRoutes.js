const express = require('express');
const studentController = require('../controllers/studentController');
const studentModel = require('../models/studentModel');

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
router.get('/students/getCoachEmail', studentController.getCoachEmail);



//admin routes
router.get('/admin_login', studentController.adminlogin)
router.post('/admin/landing_loggedIn_Page', studentController.adminLoggedIn)

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

// Render the page with the form
router.get('/admin_dashboard', (req, res) => {
    res.render('admin_dashboard.mustache');
});

router.post('/logout', studentController.logout);
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
router.put('/students/updateProgram/:_id', async (req, res) => {
    const { _id } = req.params; // Get the _id from the URL
    const updatedProgramData = req.body; // Get the updated data from the request body

    try {
        // Call a function to update the program using _id and updatedProgramData
        const result = await studentModel.updateProgram(_id, updatedProgramData);

        if (result) {
            res.send('Program updated successfully');
        } else {
            res.status(404).send('Program not found or could not be updated.');
        }
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).send('Error updating program.');
    }
});




// Add a POST route for /students/removeProgram
router.delete('/students/removeProgram', async (req, res) => {
    const { _id } = req.query; // Use req.query to get the _id from the URL

    try {
        const result = await studentModel.removeProgram(_id);

        if (result) {
            res.send('Program deleted successfully');
        } else {
            res.status(404).send('Program not found or could not be deleted.');
        }
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).send('Error deleting program.');
    }
});

router.post('/testInsertMentorship', studentController.testInsertMentorship);

// Booking routes
router.post('/bookings', studentController.createBooking);
router.get('/booked-sessions', async (req, res) => {
    try {
        // Fetch booking data from the controller
        const bookings = await studentController.getAllBookings();

        // Render the Mustache template with the booking data
        res.render('booked-sessions', { booking: bookings });
    } catch (error) {
        // Handle errors appropriately
        res.status(500).send('Internal Server Error');
    }
});
router.get('/bookings/:bookingId', studentController.getBookingById);
router.put('/bookings/:bookingId', studentController.updateBooking);
router.delete('/bookings/:bookingId', studentController.removeBooking);

module.exports = router;
