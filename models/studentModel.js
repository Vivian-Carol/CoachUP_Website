const Datastore = require('nedb');

class StudentModel {
    constructor(dbFilePath) {
        this.db = new Datastore({ filename: dbFilePath, autoload: true });
        this.mentorshipDb = new Datastore({ filename: './db/mentorship.db', autoload: true });
        this.coachesDb = new Datastore({ filename: './db/coaches.db', autoload: true });
        this.bookingDb = new Datastore({ filename: './db/booking.db', autoload: true });
    }

    // Insert a new student into the database
    insert(student) {
        return new Promise((resolve, reject) => {
            this.db.insert(student, (err, newDoc) => {
                if (err) reject(err);
                resolve(newDoc);
            });
        });
    }

    // Find a student by their email
    findByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ email: email }, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });
    }

    // Insert a new mentorship program into the mentorship database
    insertMentorshipProgram(program) {
        return new Promise((resolve, reject) => {
            this.mentorshipDb.insert(program, (err, newDoc) => {
                if (err) {
                    console.error('Error inserting mentorship program:', err);
                    reject(err);
                } else {
                    console.log('Mentorship program inserted:', newDoc);
                    resolve(newDoc);
                }
            });
        });
    }

    //Find all students
    findAllStudents() {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, students) => {
                if (err) reject(err);
                resolve(students);
            });
        });
    }


    // Find all mentorship programs
    findAllMentorshipPrograms() {
        return new Promise((resolve, reject) => {
            this.mentorshipDb.find({}, (err, programs) => {
                if (err) reject(err);
                resolve(programs);
            });
        });
    }

    findProgramByCode(programCode) {
        return new Promise((resolve, reject) => {
            this.mentorshipDb.findOne({ programCode }, (err, program) => {
                if (err) {
                    console.error('Error:', err);
                    reject(err);
                } else {
                    console.log('Program found:', program);
                    resolve(program);
                }
            });
        });
    };

    // Insert a new coach into the coaches database
    insertCoach(coach) {
        return new Promise((resolve, reject) => {
            this.coachesDb.insert(coach, (err, newDoc) => {
                if (err) {
                    console.error('Error inserting coach:', err);
                    reject(err);
                } else {
                    console.log('Coach inserted:', newDoc);
                    resolve(newDoc);
                }
            });
        });
    }

    // Find all coaches
    findAllCoaches() {
        return new Promise((resolve, reject) => {
            this.coachesDb.find({}, (err, coaches) => {
                if (err) reject(err);
                resolve(coaches);
            });
        });
    }

    // Function to get all coach names
    findAllCoachNames() {
        return new Promise((resolve, reject) => {
            this.coachesDb.find({}, { coachName: 1, _id: 0 }, (err, coachNames) => {
                if (err) {
                    reject(err);
                }
                resolve(coachNames);
            });
        });
    }

    // Model function to update a mentorship program
    updateMentorshipProgram(programCode, updatedProgramCode, updatedOpportunityName, updatedMentorCoach, updatedDuration) {
        return new Promise((resolve, reject) => {

            // Find the program by _id
            this.mentorshipDb.findOne({ programCode }, (findErr, program) => {
                if (findErr) {
                    reject(findErr);
                } else if (!program) {
                    reject('Program not found.');
                } else {

                    // Update program fields
                    program.programCode = updatedProgramCode;
                    program.opportunityName = updatedOpportunityName;
                    program.mentorCoach = updatedMentorCoach;
                    program.duration = updatedDuration;

                    // Update the program in the database
                    this.mentorshipDb.update({ programCode }, program, {}, (updateErr, numReplaced) => {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve(numReplaced);
                        }
                    });
                }
            });
        });
    };

    removeProgram(programCode) {
        return new Promise((resolve, reject) => {
            // Check if the program exists
            this.mentorshipDb.remove({ programCode: programCode }, {}, (findErr, program) => {
                if (findErr) {
                    reject(findErr);
                    return;
                }

                if (!program) {
                    console.log('Program not found');
                    resolve(false);
                    return;
                }

                console.log('Removing program:', programCode);
                // Remove the program
                this.mentorshipDb.remove({ programCode }, {}, (removeErr, numRemoved) => {
                    if (removeErr) {
                        reject(removeErr);
                        return;
                    }

                    console.log('Program deleted:', numRemoved);
                    resolve(numRemoved > 0);
                });
            });
        });
    };

    // Insert a new booking into the booking database
    insertBooking(booking) {
        return new Promise((resolve, reject) => {
            this.bookingDb.insert(booking, (err, newDoc) => {
                if (err) {
                    console.error('Error inserting booking:', err);
                    reject(err);
                } else {
                    console.log('Booking inserted:', newDoc);
                    resolve(newDoc);
                }
            });
        });
    }

    // Find all bookings
    findAllBookings() {
        return new Promise((resolve, reject) => {
            this.bookingDb.find({}, (err, bookings) => {
                if (err) reject(err);
                resolve(bookings);
            });
        });
    }

    // Find bookings for a specific user
    findBookingsByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.bookingDb.find({ userId: userId }, (err, bookings) => {
                if (err) reject(err);
                resolve(bookings);
            });
        });
    }

    // Find a booking by its ID
    findBookingById(bookingId) {
        return new Promise((resolve, reject) => {
            this.bookingDb.findOne({ _id: bookingId }, (err, booking) => {
                if (err) {
                    console.error('Error:', err);
                    reject(err);
                } else {
                    console.log('Booking found:', booking);
                    resolve(booking);
                }
            });
        });
    }

    // Update a booking by its ID
    updateBooking(bookingId, updatedData) {
        return new Promise((resolve, reject) => {
            this.bookingDb.update({ _id: bookingId }, { $set: updatedData }, {}, (err, numReplaced) => {
                if (err) {
                    console.error('Error updating booking:', err);
                    reject(err);
                } else {
                    console.log('Booking updated:', numReplaced);
                    resolve(numReplaced);
                }
            });
        });
    }

    // Remove a booking by its ID
    removeBooking(bookingId) {
        return new Promise((resolve, reject) => {
            this.bookingDb.remove({ _id: bookingId }, {}, (err, numRemoved) => {
                if (err) {
                    console.error('Error removing booking:', err);
                    reject(err);
                } else {
                    console.log('Booking deleted:', numRemoved);
                    resolve(numRemoved > 0);
                }
            });
        });
    }

}



const studentModel = new StudentModel('./db/students.db');

module.exports = studentModel;