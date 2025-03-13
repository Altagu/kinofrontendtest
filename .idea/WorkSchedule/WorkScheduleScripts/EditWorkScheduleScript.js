const API_URL = "kinofullstack-epcfgehdhse5eufz.northeurope-01.azurewebsites.net"


// Hent query parameter fra URL (hvis nødvendigt)
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Load medarbejdere og fyld dropdown-menuen
function loadEmployees() {
    fetch('${API_URL}/api/employees')
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch employees");
            return response.json();
        })
        .then(data => {
            const employeeSelect = document.getElementById("employeeSelect");
            if (!employeeSelect) return;
            employeeSelect.innerHTML = '<option value="" disabled selected>Select an employee</option>';
            data.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp.employeeId;
                option.textContent = emp.name;
                employeeSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching employees:", error));
}

// Load vagter for den valgte medarbejder og fyld shift dropdown-menuen
function loadEmployeeShifts(employeeId) {
    fetch('${API_URL}/api/workschedule')
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch work schedules");
            return response.json();
        })
        .then(data => {
            const shiftSelect = document.getElementById("shiftSelect");
            if (!shiftSelect) return;
            shiftSelect.innerHTML = '<option value="" disabled selected>Select a shift</option>';

            const today = new Date();

            // Filtrer vagter for den valgte medarbejder, men kun de med workDate >= today
            const empShifts = data.filter(item => {
                return item.employee.employeeId == employeeId && new Date(item.workDate) >= today;
            });

            empShifts.forEach(shift => {
                const option = document.createElement("option");
                option.value = shift.scheduleId;
                const start = shift.startTime ? shift.startTime.slice(0,5) : "";
                const end = shift.endTime ? shift.endTime.slice(0,5) : "";
                option.textContent = `${shift.workDate}: ${start} - ${end} (${shift.description})`;
                shiftSelect.appendChild(option);
            });

            if (empShifts.length === 0) {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No upcoming shifts";
                shiftSelect.appendChild(option);
            }
        })
        .catch(error => console.error("Error fetching work schedules:", error));
}


// Når en vagt vælges, udfyld formularfelterne med den specifikke vagt
function fillFormFields(scheduleId) {
    fetch(`${API_URL}/api/workschedule/${scheduleId}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch schedule by id");
            return response.json();
        })
        .then(data => {
            document.getElementById("workDate").value = data.workDate;
            document.getElementById("startTime").value = data.startTime ? data.startTime.slice(0,5) : "";
            document.getElementById("endTime").value = data.endTime ? data.endTime.slice(0,5) : "";
            document.getElementById("description").value = data.description;
        })
        .catch(error => console.error("Error fetching schedule by id:", error));
}

// Send PUT-anmodning for at opdatere vagtposten
function updateSchedule(scheduleId) {
    const updatedData = {
        workDate: document.getElementById("workDate").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
        description: document.getElementById("description").value,
        employee: {
            employeeId: document.getElementById("employeeSelect").value
        }
    };

    fetch(`${API_URL}/api/workschedule/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
        .then(response => {
            if (response.ok) {
                alert("The schedule has been updated!");
                window.location.href = "viewWorkSchedule.html";
            } else {
                alert("Something went wrong while updating the schedule.");
            }
        })
        .catch(error => console.error("Error updating schedule:", error));
}

// Event Listeners for edit page
window.addEventListener("load", () => {
    // Load employees dropdown
    const employeeSelect = document.getElementById("employeeSelect");
    if (employeeSelect) {
        loadEmployees();
        employeeSelect.addEventListener("change", (event) => {
            const empId = event.target.value;
            if (empId) {
                loadEmployeeShifts(empId);
            }
        });
    }

    // Når en vagt vælges fra shift dropdown, udfyld formularfelterne
    const shiftSelect = document.getElementById("shiftSelect");
    if (shiftSelect) {
        shiftSelect.addEventListener("change", (event) => {
            const scheduleId = event.target.value;
            if (scheduleId) {
                fillFormFields(scheduleId);
            }
        });
    }

    // Håndter formular submission for opdatering af vagtpost
    const editScheduleForm = document.getElementById("editScheduleForm");
    if (editScheduleForm) {
        editScheduleForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const scheduleId = document.getElementById("shiftSelect").value;
            if (!scheduleId) {
                alert("Please select a shift to update.");
                return;
            }
            updateSchedule(scheduleId);
        });
    }
});
