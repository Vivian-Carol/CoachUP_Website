const express = require('express');
const studentController = require('../controllers/studentController');
const studentModel = require('../models/studentModel');
const { isAuthenticated } = require('../index');

const router = express.Router();

router.get('/', studentController.welcome);

router.get('/signup', studentController.signup);
router.post('/students/signup', studentController.signupSubmit);
router.get('/students/signupSuccess', studentController.signupSuccess);
router.get('/login', studentController.login);
router.post('/students/login', studentController.loggedIn);
router.get('/dashboard', async (req, res) => {
    try {
        const programs = await studentModel.findAllMentorshipPrograms();

        if (programs.length > 0) {
            res.render('dashboard', { user: req.session.user, opportunities: programs });
        } else {
            res.status(404).send('No data available.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/students/addCoach', studentController.addCoach);
router.get('/students/getCoaches', studentController.getAllCoaches);
router.get('/students/getCoachNames', studentController.getAllCoachNames);

router.get('/admin_login', studentController.adminlogin)
router.post('/admin/login_page', studentController.adminLoggedIn)

const checkAdminRole = (req, res, next) => {
    const user = req.session.user;
    if (user && user.role === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
};

router.get('/admin/dashboard', checkAdminRole, async (req, res) => {
    try {
        const programs = await studentModel.findAllMentorshipPrograms();
        const students = await studentModel.findAllStudents();
        const coaches = await studentModel.findAllCoaches();
        const bookings = await studentModel.findAllBookings();

        if (programs.length > 0 || students.length > 0 || coaches.length > 0 || bookings.length > 0) {
            res.render('displayDetails', { user: req.session.user, opportunities: programs, students: students, coaches: coaches, bookings: bookings });
        } else {
            res.status(404).send('No data available.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/admin_dashboard', (req, res) => {
    res.render('admin_dashboard.mustache');
});

router.get('/logout', studentController.logout);


router.post('/students/addProgram', studentController.insertMentorshipProgram);
router.post('/students/searchByCode', studentController.searchByCode);

const checkRequestBody = (req, res, next) => {
    console.log('Request Body:', req.body);
    next();
};

router.post('/students/searchByCode', studentController.searchByCode);

router.put('/students/updateProgram/:programId', studentController.updateProgram);

router.delete('/students/removeProgram', checkRequestBody, studentController.removeProgram);

router.post('/testInsertMentorship', studentController.testInsertMentorship);

router.post('/bookings_insert', studentController.createBooking);
router.get('/my-bookings/:userId', studentController.getAllBookings);


router.get('/bookings/:bookingId', studentController.getBookingById);
router.put('/bookings/:bookingId', studentController.updateBooking);
router.delete('/bookings/:bookingId', studentController.removeBooking);

module.exports = router;