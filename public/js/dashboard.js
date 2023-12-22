document.querySelector('.view-more').addEventListener('click', function () {
    document.querySelectorAll('.enrolled-courses .row .col-md-6:nth-child(n+3)').forEach(function (course) {
        course.classList.toggle('d-none');
    });
});

const bookSessionButtons = document.querySelectorAll('.book-session-button');

const goalInput = document.getElementById('goal');
const coachInput = document.getElementById('coach');
const emailInput = document.getElementById('email');
const dateInput = document.getElementById('date');
const documentInput = document.getElementById('document');

bookSessionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sessionData = JSON.parse(button.getAttribute('data-program'));

        goalInput.value = sessionData.goal;
        coachInput.value = sessionData.coach;
        emailInput.value = sessionData.email;
        dateInput.value = sessionData.date;
        documentInput.value = sessionData.document;

        $('#bookingModal').modal('show');
    });
});

function populateCoaches() {
    fetch('/students/getCoaches')
        .then(response => response.json())
        .then(data => {
            const coachSelect = document.getElementById('coach');

            while (coachSelect.options.length > 1) {
                coachSelect.remove(1);
            }

            data.coaches.forEach(coach => {
                const option = document.createElement('option');
                option.value = coach.coachName; 
                option.textContent = coach.coachName;
                coachSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching coach names:', error);
        });
}

// Add an event listener to the modal to populate coaches when it's shown
$('#bookingModal').on('show.bs.modal', populateCoaches);


// Add an event listener for form submission
document.getElementById("submitBooking")?.addEventListener("click", function () {
    handleBookingSubmit();
});

// Function to handle booking form submission
async function handleBookingSubmit() {
    const goal = document.getElementById("goal").value;
    const coach = document.getElementById("coach").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
    const documentFile = document.getElementById("document").files[0];

    const formData = new FormData();
    formData.append("goal", goal);
    formData.append("coach", coach);
    formData.append("email", email);
    formData.append("date", date);
    formData.append("document", documentFile);

    try {
        const response = await fetch("/bookings_insert", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Session booked successfully!");
        }
        else {
            const responseData = await response.json();
            console.error("Error:", responseData.error || "Failed to book session.");
            alert("An error occurred. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    function renderBookings(bookings) {
        const templateSource = document.getElementById("booking-template");

        bookings.forEach((booking, i) => {
            const templ = `
                        <tr>
                            <td>${booking.goal}</td>
                            <td>${booking.coach}</td>
                            <td>${booking.email}</td>
                            <td>${booking.date}</td>
                            <td>${booking.document}</td>
                            <td id="${booking._id}">
                                <button class="btn btn-primary mx-2 update-session-button" onclick="openUpdateModal('${booking._id}')">Update</button>
                                <button class="btn btn-light mx-2 delete-session-button" onclick="deleteBooking('${booking._id}')">Delete</button>
                            </td>
                        </tr>
                    `
            console.log(templ);
            templateSource.insertAdjacentHTML("afterbegin", templ)

        })
    }

    const userId = document.getElementById("userId");

    const formData = new FormData();
    formData.append("userId", userId?.value);
    const urlId = userId?.value?.split("/")[0]
    fetch(`/my-bookings/${userId?.value}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("DATA", data)
            renderBookings(data);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
});


function openUpdateModal(bookingId) {
    fetch(`/bookings/${bookingId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('bookingId').value = bookingId;
            document.getElementById('goal').value = data.goal;
            document.getElementById('coach').value = data.coach;
            document.getElementById('email').value = data.email;
            document.getElementById('date').value = data.date;
            document.getElementById('documentName').textContent = data.document ? data.document : 'File Already saved';
            $('#updateModal').modal('show');
        });
}

document.querySelectorAll('.update-session-button').forEach(button => {
    button.addEventListener('click', () => {
        const bookingId = button.parentNode.id;
        openUpdateModal(bookingId);
    });
});

const updateBooking = async (bookingId) => {
    console.log(bookingId);
    const updatedData = {
        goal: document.getElementById('goal').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
    };

    try {
        const response = await fetch(`/bookings/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('Booking Details Updated successfully');
            $('#updateModal').modal('hide');
            window.location.reload();
        } else {
            console.error('Error:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('updateBookingButton').addEventListener('click', (event) => {
    event.preventDefault();
    const bookingId = document.getElementById('bookingId').value;
    updateBooking(bookingId);
});


async function deleteBooking(bookingId) {
    console.log("Delete booking", bookingId)
    const confirmation = confirm('Are you sure you want to delete this Booked Session?');
    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            alert('Booking deleted successfully');
            window.location.reload();
        } else {
            console.error('Error:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
