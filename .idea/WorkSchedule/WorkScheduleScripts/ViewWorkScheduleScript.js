const API_URL = "kinofullstack-epcfgehdhse5eufz.northeurope-01.azurewebsites.net"


// Hjælpefunktioner til datoer
function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const adjustedDay = day === 0 ? 7 : day; // Hvis søndag, behandl som 7
    date.setDate(date.getDate() - adjustedDay + 1);
    return date;
}

function getSunday(monday) {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
}

function formatDateISO(d) {
    return d.toISOString().split('T')[0];
}

// Formatterer dato til "DD/MM"
function formatDateDM(d) {
    const day = ("0" + d.getDate()).slice(-2);
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    return `${day}/${month}`;
}

// ------ Global variabler for den viste uge ------
let currentMonday = getMonday(new Date());
let currentSunday = getSunday(currentMonday);

// Funktion: Opdater headeren med dag + dato (DD/MM)
function updateTableHeader() {
    const headerCells = document.querySelectorAll("table thead th");
    // Header cell 0 forbliver "Employee"
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let currentDate = new Date(currentMonday); // Start med mandagen

    // Gå igennem header-cellerne for dagene (index 1 til 7)
    for (let i = 1; i <= 7; i++) {
        const dateStr = formatDateDM(currentDate);
        headerCells[i].textContent = `${dayNames[i - 1]} (${dateStr})`;
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

// ------ Funktion: Hent og vis vagtplan for den nuværende uge ------
function loadWeeklySchedule() {
    const startDate = formatDateISO(currentMonday);
    const endDate = formatDateISO(currentSunday);

    // Opdater headeren med datoer for ugen
    updateTableHeader();

    fetch(`${API_URL}/api/workschedule/week?start=${startDate}&end=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok when fetching weekly schedule");
            }
            return response.json();
        })
        .then(data => {
            const scheduleBody = document.getElementById("scheduleBody");
            if (!scheduleBody) return;
            scheduleBody.innerHTML = ""; // Clear previous rows

            // Gruppér data pr. medarbejder
            const scheduleMap = {};

            data.forEach(entry => {
                const empId = entry.employee.employeeId;
                const empName = entry.employee.name;
                if (!scheduleMap[empId]) {
                    scheduleMap[empId] = {
                        name: empName,
                        shifts: { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" }
                    };
                }
                // Konverter workDate til et Date-objekt og bestem ugedagen
                const dateObj = new Date(entry.workDate);
                const day = dateObj.getDay(); // 0 = søndag, 1 = mandag, ... 6 = lørdag
                let dayKey = "";
                switch (day) {
                    case 1: dayKey = "mon"; break;
                    case 2: dayKey = "tue"; break;
                    case 3: dayKey = "wed"; break;
                    case 4: dayKey = "thu"; break;
                    case 5: dayKey = "fri"; break;
                    case 6: dayKey = "sat"; break;
                    case 0: dayKey = "sun"; break;
                }
                if (entry.startTime && entry.endTime && entry.description) {
                    const start = entry.startTime.slice(0, 5);
                    const end = entry.endTime.slice(0, 5);
                    scheduleMap[empId].shifts[dayKey] = `${start} - ${end} (${entry.description})`;
                } else {
                    scheduleMap[empId].shifts[dayKey] = "";
                }
            });

            // Byg tabellen: Opret en række for hver medarbejder
            for (const empId in scheduleMap) {
                const row = document.createElement("tr");
                const emp = scheduleMap[empId];

                // Medarbejderens navn i første kolonne
                const nameCell = document.createElement("td");
                nameCell.textContent = emp.name;
                nameCell.classList.add("employee-col");
                row.appendChild(nameCell);

                // Kolonner for mandag til søndag
                ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach(day => {
                    const cell = document.createElement("td");
                    cell.textContent = emp.shifts[day] || "";
                    row.appendChild(cell);
                });

                scheduleBody.appendChild(row);
            }
        })
        .catch(error => console.error("Error fetching weekly schedule:", error));
}

// ------ Funktioner til navigation mellem uger ------
function showPreviousWeek() {
    currentMonday.setDate(currentMonday.getDate() - 7);
    currentSunday = getSunday(currentMonday);
    loadWeeklySchedule();
}

function showNextWeek() {
    currentMonday.setDate(currentMonday.getDate() + 7);
    currentSunday = getSunday(currentMonday);
    loadWeeklySchedule();
}

// ------ Event Listeners ------
window.addEventListener("load", () => {
    loadWeeklySchedule();

    const prevBtn = document.getElementById("prevWeekBtn");
    const nextBtn = document.getElementById("nextWeekBtn");

    if (prevBtn) prevBtn.addEventListener("click", showPreviousWeek);
    if (nextBtn) nextBtn.addEventListener("click", showNextWeek);
});
