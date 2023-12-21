const { render } = require('mustache');
const studentModel = require('../models/studentModel');
const bcrypt = require('bcrypt');


exports.welcome = function (req, res) {
    res.render('index');
}

exports.signup = function (req, res) {
    res.render('signup');
};

exports.signupSubmit = function (req, res) {
    const { firstname, lastname, email, password } = req.body;

    // Check if the email already exists in the database
    studentModel.findByEmail(email)
        .then((existingUser) => {
            if (existingUser) {
                res.send('Email already in use. Please choose another.');
            } else {
                // Hash the password using bcrypt
                bcrypt.hash(password, 10, (hashError, hashedPassword) => {
                    if (hashError) {
                        res.send('Error: Unable to hash password.');
                    } else {
                        // Create a user object with the hashed password
                        const user = {
                            firstname: firstname,
                            lastname: lastname,
                            email: email,
                            password: hashedPassword,
                        };

                        // Save the user's information to the database
                        studentModel.insert(user)
                            .then((newUser) => {
                                console.log('New User Inserted in the student database');
                                console.log('User Data:', newUser);

                                res.redirect('/students/signupSuccess');
                            })
                            .catch((error) => {
                                res.send('Error: Unable to save user information.');
                            });
                    }
                });
            }
        })
        .catch((error) => {
            res.send('Error: Unable to check email availability.');
        });
};

exports.signupSuccess = function (req, res) {
    res.render('signupSuccess');
};

exports.login = function (req, res) {
    res.render('login');
};

exports.loggedIn = function (req, res) {
    const { email, password } = req.body;

    // Check if the email and password are valid
    studentModel.findByEmail(email)
        .then((user) => {
            if (!user) {
                res.send('User doesn\'t exist in the database.');
            } else {
                // Compare the submitted password with the stored hashed password
                bcrypt.compare(password, user.password, (compareError, passwordMatch) => {
                    if (compareError || !passwordMatch) {
                        res.send('Incorrect password.');
                    } else {

                        req.session.user = user;


                        console.log(`${user.firstname} has logged into their dashboard`);

                        res.redirect('/students/dashboard');
                    }
                });
            }
        })
        .catch((error) => {
            res.send('Error: Unable to authenticate.');
        });
};

exports.dashboard = async function (req, res) {
    try {
        const programs = await studentModel.findAllMentorshipPrograms();

        res.render('dashboard', { user: req.session.user, programs: programs });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.logout = function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Logout failed.");
        }
        res.render('logout')
    });
};

//admin controllers
exports.adminlogin = function (req, res) {
    res.render('admin_login');
};

exports.adminLoggedIn = async function (req, res) {
    const { email, password } = req.body;

    console.log('Entered Email:', email);
    console.log('Entered Password:', password);

    if (email && email.startsWith('admin') && email.endsWith('@gmail.com') && password === 'Admin') {
        // Create a session for the user
        req.session.user = { email: email, role: 'admin' };

        console.log(`${email} has logged into the admin dashboard`);

        try {
            const programs = await studentModel.findAllMentorshipPrograms();
            const students = await studentModel.findAllStudents();
            const coaches = await studentModel.findAllCoaches();
            const bookings = await studentModel.findAllBookings();

            res.render('displayDetails', { user: req.session.user, opportunities: programs, students: students, coaches: coaches, bookings: bookings });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // Invalid email or password
        console.log('Invalid email or password.');
        res.send('Invalid email or password.');
    }
};


// Handle form submission to add a mentorship program
exports.insertMentorshipProgram = async (req, res) => {
    const { programCode, opportunityName, mentorCoach, duration } = req.body;

    const newProgram = {
        programCode: programCode,
        opportunityName,
        mentorCoach,
        duration,
    };

    try {
        const addedProgram = await studentModel.insertMentorshipProgram(newProgram);

        res.status(200).json({ success: true, message: 'Program added successfully.' });
    } catch (error) {
        console.error('Error adding program:', error);
        res.status(500).json({ success: false, message: 'Failed to add program. Please try again.' });
    }
};



exports.displayData = function (req, res) {

    studentModel.findAllMentorshipPrograms()
        .then((programs) => {
            res.render(
                'displayDetails', {
                'opportunities': programs
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        });

};

exports.displayStudentData = function (req, res) {
    studentModel.findAllStudents()
        .then((students) => {
            res.render(
                'displayDetails', {
                'students': students
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        });
};


// Update the route to handle the search and render the results in the displayDetails template
exports.searchByCode = async function (req, res) {
    try {
        const query = req.body.programCode;

        const programs = await studentModel.findProgramByCode(query);

        const students = await studentModel.findAllStudents();
        const coaches = await studentModel.findAllCoaches();

        console.log('Search Results:', programs);

        res.render('displayDetails', { user: req.session.user, opportunities: programs, students: students, coaches: coaches });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


// Controller function to add a new coach
exports.addCoach = async function (req, res) {
    const { coachName, coachEmail, coachProgram, coachQualification } = req.body;

    const coachData = {
        coachName: coachName,
        coachEmail: coachEmail,
        coachProgram: coachProgram,
        coachQualification: coachQualification
    };

    try {
        const addedCoach = await studentModel.insertCoach(coachData);

        res.status(200).json({ success: true, message: 'Coach added successfully.' });
    } catch (error) {
        console.error('Error adding coach:', error);
        res.status(500).json({ success: false, message: 'Failed to add coach. Please try again.' });
    }
};

// Controller function to display coaches data
exports.displayCoachesData = function (req, res) {
    studentModel.findAllCoaches()
        .then((coaches) => {
            res.render('displayDetails', { coaches });
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        });
};

// Controller function to get all coaches
exports.getAllCoaches = async (req, res) => {
    try {
        const coaches = await studentModel.findAllCoaches();
        res.json({ success: true, coaches });
    } catch (error) {
        console.error('Error getting coaches:', error);
        res.status(500).json({ success: false, message: 'Failed to get coaches. Please try again.' });
    }
};


// Controller function to get all coach names
exports.getAllCoachNames = async (req, res) => {
    try {
        const coachName = await studentModel.findAllCoachNames();
        res.json({ success: true, coachName });
    } catch (error) {
        console.error('Error getting coach names:', error);
        res.status(500).json({ success: false, message: 'Failed to get coach names. Please try again.' });
    }
};

// Controller function to update a program
exports.updateProgram = async (req, res) => {
    const programId = req.params.programId;
    console.log("_id: " + programId);
    console.log(req.body);
    const updatedData = req.body;

    try {
        const success = await studentModel.updateMentorshipProgram(programId, updatedData);
        if (success) {
            res.json({ message: 'Program updated successfully' });
        } else {
            res.status(404).json({ error: 'Program not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Define the controller function for removing a program
exports.removeProgram = async (req, res) => {
    const { _id } = req.query;
    console.log(_id);

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
};


exports.testInsertMentorship = async (req, res) => {
    const program = { name: 'Test Program', description: 'This is a test program' };
    try {
        const result = await studentModel.insertMentorshipProgram(program);
        console.log('Test mentorship program inserted:', result);
        res.send('Test mentorship program inserted.');
    } catch (error) {
        console.error('Error inserting test mentorship program:', error);
        res.status(500).send('Error inserting test mentorship program.');
    }
};

// Controller to create a new booking
exports.createBooking = async (req, res) => {

    try {
        const { goal, coach, email, date, document, userId } = req.body;

        const booking = { goal, coach, email, date, document, userId: userId?.split("/")[0] };

        const newBooking = await studentModel.insertBooking(booking);
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller to get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("BODY: " + userId)
        const bookings = await studentModel.findBookingsByUserId(userId);
        console.log("BOOKINGS", bookings);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller to get a booking by its ID
exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await studentModel.findBookingById(bookingId);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        console.log(JSON.stringify(req.body));
        const updatedData = req.body;

        const numReplaced = await studentModel.updateBooking(bookingId, updatedData);
        if (numReplaced > 0) {
            res.json({ message: 'Booking updated successfully' });
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.removeBooking = async (req, res) => {

    const { bookingId } = req.params;

    try {
        const removed = await studentModel.removeUserBooking(bookingId);
        if (removed) {
            res.json({ message: 'Booking removed successfully' });
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
