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
                                console.log('User Data:', newUser); // Display the entered data

                                // Redirect to the signup success page
                                res.redirect('/students/signupSuccess');
                            })
                            .catch((error) => {
                                // Handle the error, e.g., show an error message or redirect to an error page
                                res.send('Error: Unable to save user information.');
                            });
                    }
                });
            }
        })
        .catch((error) => {
            // Handle the error, e.g., show an error message or redirect to an error page
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
                // User doesn't exist in the database
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
            // Handle any database error
            res.send('Error: Unable to authenticate.');
        });
};

exports.dashboard = function (req, res) {
    res.render('dashboard', { user: req.session.user });

}

exports.logout = function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Logout failed.");
        }

        res.status(200).send("Logout successful.");
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

    // Check if the email and password are valid
    if (email && email.startsWith('admin') && email.endsWith('@gmail.com') && password === 'Admin') {
        // Create a session for the user
        req.session.user = { email: email, role: 'admin' };

        // Log the login activity
        console.log(`${email} has logged into the admin dashboard`);

        try {
            // Retrieve mentorship programs data
            const programs = await studentModel.findAllMentorshipPrograms();
            const students = await studentModel.findAllStudents();
            const coaches = await studentModel.findAllCoaches();

            // Render the displayDetails view with the data
            res.render('displayDetails', { user: req.session.user, opportunities: programs, students: students, coaches: coaches });
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
        // Insert the program into the mentorship database
        const addedProgram = await studentModel.insertMentorshipProgram(newProgram);

        // Send a success response
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

        // Retrieve mentorship programs data based on the search query
        const programs = await studentModel.findProgramByCode(query);

        // Retrieve all students and coaches data (assuming these functions exist in your model)
        const students = await studentModel.findAllStudents();
        const coaches = await studentModel.findAllCoaches();

        // Log retrieved data
        console.log('Search Results:', programs);

        // Render the displayDetails template with the search results in the opportunities section
        res.render('displayDetails', { user: req.session.user, opportunities: programs, students: students, coaches: coaches });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


// Controller function to add a new coach
exports.addCoach = async function (req, res) {
    const { coachName, coachEmail, coachProgram, coachQualification } = req.body;

    // Create an object with the coach data
    const coachData = {
        coachName: coachName,
        coachEmail: coachEmail,
        coachProgram: coachProgram,
        coachQualification: coachQualification
    };

    try {
        // Insert the coach data into the coaches database
        const addedCoach = await studentModel.insertCoach(coachData);

        // Send a success response
        res.status(200).json({ success: true, message: 'Coach added successfully.' });
    } catch (error) {
        console.error('Error adding coach:', error);
        res.status(500).json({ success: false, message: 'Failed to add coach. Please try again.' });
    }
};

// Controller function to get all coaches
exports.getAllCoaches = async (req, res) => {
    try {
        // Retrieve all coaches from the database
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
        // Retrieve only coach names from the database
        const coachName = await studentModel.findAllCoachNames();
        res.json({ success: true, coachName });
    } catch (error) {
        console.error('Error getting coach names:', error);
        res.status(500).json({ success: false, message: 'Failed to get coach names. Please try again.' });
    }
};

// Controller function to get the coach's email based on the selected name
exports.getCoachEmail = async (req, res) => {
    try {
        const { coachName } = req.query;

        console.log('Received coachName:', coachName);

        if (!coachName) {
            return res.status(400).json({ success: false, message: 'Coach name is required.' });
        }

        // Query your NeDB or database to get the email for the provided coachName
        const coach = await studentModel.findCoachByName({ coachName });

        if (coach && coach.coachEmail) {
            res.json({ success: true, email: coach.coachEmail });
        } else {
            res.json({ success: false, message: 'Coach not found' });
        }
    } catch (error) {
        console.error('Error getting coach email:', error);
        res.status(500).json({ success: false, message: 'Failed to get coach email. Please try again.' });
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



// Controller function to render the update form
exports.renderUpdateForm = function (req, res) {
    const programId = req.query.programId;
    studentModel.findProgramById(programId)
        .then((program) => {
            if (program) {
                res.render('updateProgram', { program });
            } else {
                res.send('Program not found.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            res.send('Error finding the program.');
        });
};

// Controller function to update a program
exports.updateProgram = async (_id, updatedData) => {
    return new Promise((resolve, reject) => {
        // Use NeDB's `update` method to update the program
        studentModel.mentorshipDb.update({ _id }, { $set: updatedData }, {}, (updateErr, numUpdated) => {
            if (updateErr) {
                reject(updateErr);
                return;
            }

            if (numUpdated === 0) {
                console.log('Program not found');
                resolve(false);
            } else {
                console.log('Program updated:', _id);
                resolve(true);
            }
        });
    });
};


// Define the controller function for removing a program
exports.removeProgram = async (req, res) => {
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
        const { goal, coach, email, date, document } = req.body;
        const booking = { goal, coach, email, date, document };
        const newBooking = await studentModel.insertBooking(booking);
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller to get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await studentModel.findAllBookings();
        res.json(bookings);
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

// Controller to update a booking
exports.updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const updatedData = req.body;
        const numReplaced = await studentModel.updateBooking(bookingId, updatedData);
        if (numReplaced > 0) {
            res.json({ message: 'Booking updated successfully' });
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller to remove a booking
exports.removeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const removed = await studentModel.removeBooking(bookingId);
        if (removed) {
            res.json({ message: 'Booking removed successfully' });
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};