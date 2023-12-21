// Search Results
function searchProgram() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const browseOpportunitiesTable = document.getElementById('browseOpportunitiesTable');
    const browseOpportunitiesRows = browseOpportunitiesTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // Hide all rows in browseOpportunitiesTable
    for (let row of browseOpportunitiesRows) {
        row.style.display = 'none';
    }

    // Find and display matching rows in browseOpportunitiesTable
    for (let row of browseOpportunitiesRows) {
        const programName = row.getElementsByTagName('td')[1].textContent.toLowerCase();
        if (programName.includes(searchInput)) {
            row.style.display = '';
        }
    }

    return false;
}


function openUpdateForm(_id, programCode, opportunityName, mentorCoach, duration) {

document.getElementById('programCode').value = programCode;
document.getElementById('opportunityName').value = opportunityName;
document.getElementById('mentorCoach').value = mentorCoach;
document.getElementById('duration').value = duration;

document.getElementById('programId').value = _id;

$('#updateProgramModal').modal('show');
}

document.getElementById('updateProgramButton').addEventListener('click', async () => {
const programId = document.getElementById('programId').value;
const programCode = document.getElementById('programCode').value;
const opportunityName = document.getElementById('opportunityName').value;
const mentorCoach = document.getElementById('mentorCoach').value;
const duration = document.getElementById('duration').value;

const updatedProgramData = {
    programCode,
    opportunityName,
    mentorCoach,
    duration,
};

try {
    const response = await fetch(`/students/updateProgram/${programId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProgramData)
    });

    if (response.ok) {
        alert('Program updated successfully');
        $('#updateProgramModal').modal('hide');
        window.location.reload();
    } else {
        console.error('Error:', await response.text());
    }
} catch (error) {
    console.error('Error:', error);
}
});



async function deleteProgram(_id) {
const confirmation = confirm('Are you sure you want to delete this program?');
if (!confirmation) {
    return;
}

try {
    const response = await fetch(`/students/removeProgram?_id=${_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    if (response.ok) {
        alert('Program deleted successfully');
        window.location.reload();
    } else {
        console.error('Error:', await response.text());
    }
} catch (error) {
    console.error('Error:', error);
}
}