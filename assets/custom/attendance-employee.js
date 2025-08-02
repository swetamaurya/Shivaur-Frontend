// Helper to Format Time in hh:mm:ss
function formatTime(milliseconds) {
    if (isNaN(milliseconds) || milliseconds <= 0) return "00:00:00"; // Fallback if invalid
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Calculate total time if start and end times are available
function calculateTotalTime(start, end) {
    return end && start ? new Date(end) - new Date(start) : 0;
}

// Function to reset work and break times in local storage
function resetLocalStorageValues() {
    localStorage.setItem("accumulatedWorkTime", "0");
    localStorage.setItem("totalBreakTime", "0");
    accumulatedWorkTime = 0;
    accumulatedBreakTime = 0;
    displayTotalWorkTime();
    displayTotalBreakTime();
}

// Check if today's date is different from the last recorded date
function checkAndResetDate() {
    const today = new Date().toISOString().split('T')[0];
    const lastRecordedDate = localStorage.getItem("lastRecordedDate");

    if (lastRecordedDate !== today) {
        localStorage.setItem("lastRecordedDate", today);
        resetLocalStorageValues();
    }
}

// Initialize Variables
let workSessionStartTime = null;
let breakSessionStartTime = null;
let workTimerInterval = null;
let breakTimerInterval = null;
let accumulatedWorkTime = parseInt(localStorage.getItem("accumulatedWorkTime") || "0");
let accumulatedBreakTime = parseInt(localStorage.getItem("totalBreakTime") || "0");

// Redirect if no token
(function(){
    const timestamp = localStorage.getItem('timestampActiveSession');
    if (timestamp) {
        const currentTime = Date.now();
        const timeDiff = currentTime - parseInt(timestamp);
        let hrs = 9.5; // hrs session active condition
        if (timeDiff > hrs * 60 * 60 * 1000) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    } else {
        localStorage.clear();
        window.location.href = 'index.html';
    }
})();

import { attendance_API } from './apis.js';

const token = localStorage.getItem("token");
const userId = localStorage.getItem("User_id");

// Initialize on window load
window.onload = function () {
    const punchButton = document.getElementById('punchButton');
    const breakButton = document.getElementById('breakButton');

    punchButton.addEventListener('click', () => {
        const action = punchButton.textContent === 'Punch In' ? 'workPunchIn' : 'workPunchOut';
        action === 'workPunchIn' ? punchIn() : punchOut();
    });

    breakButton.addEventListener('click', () => {
        const action = breakButton.textContent === 'Break In' ? 'breakPunchIn' : 'breakPunchOut';
        action === 'breakPunchIn' ? breakIn() : breakOut();
    });

    // Initialize Punch In/Out Button State
    const isPunchedIn = localStorage.getItem("isPunchedIn") === "true";
    const punchInTime = localStorage.getItem("punchInTime");
    if (isPunchedIn && punchInTime) {
        startWorkSessionTimer(new Date(punchInTime));
        punchButton.textContent = 'Punch Out';
    } else {
        punchButton.textContent = 'Punch In';
    }

    displayTotalWorkTime();
    displayTotalBreakTime();

    fetchAttendanceRecords();
};

// Display Total Work and Break Times
function displayTotalWorkTime() {
    document.getElementById('workHoursDisplay').textContent = formatTime(accumulatedWorkTime);
}

function displayTotalBreakTime() {
    document.getElementById('breakHoursDisplay').textContent = formatTime(accumulatedBreakTime);
}

// Punch In Function
async function punchIn() {
    try {
        const response = await fetch(`${attendance_API}/punch`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'workPunchIn' })
        });
        
        const data = await response.json();
        if (response.ok) {
            workSessionStartTime = new Date();
            localStorage.setItem("isPunchedIn", "true");
            localStorage.setItem("punchInTime", workSessionStartTime);
            startWorkSessionTimer(workSessionStartTime);
            document.getElementById('punchButton').textContent = 'Punch Out';
            fetchAttendanceRecords();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Punch-in failed:', error.message);
    }
}

// Punch Out Function
async function punchOut() {
    try {
        const response = await fetch(`${attendance_API}/punch`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'workPunchOut' })
        });
        
        const data = await response.json();
        if (response.ok) {
            accumulatedWorkTime += new Date() - workSessionStartTime;
            localStorage.setItem("accumulatedWorkTime", accumulatedWorkTime);
            localStorage.setItem("isPunchedIn", "false");
            stopWorkSessionTimer();
            displayTotalWorkTime();
            document.getElementById('punchButton').textContent = 'Punch In';
            fetchAttendanceRecords();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Punch-out failed:', error.message);
    }
}

// Break In Function
async function breakIn() {
    try {
        const response = await fetch(`${attendance_API}/punch`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'breakPunchIn' })
        });

        const data = await response.json();
        if (response.ok) {
            breakSessionStartTime = new Date();
            localStorage.setItem("isOnBreak", "true");
            
            // Stop work timer without resetting accumulatedWorkTime
            stopWorkSessionTimer();
            
            startBreakSessionTimer();
            document.getElementById('breakButton').textContent = 'Break Out';
            fetchAttendanceRecords();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Break-in failed:', error.message);
    }
}

// Break Out Function - resumes the work timer without resetting it
async function breakOut() {
    try {
        const response = await fetch(`${attendance_API}/punch`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'breakPunchOut' })
        });

        const data = await response.json();
        if (response.ok) {
            accumulatedBreakTime += new Date() - breakSessionStartTime;
            localStorage.setItem("totalBreakTime", accumulatedBreakTime);
            localStorage.setItem("isOnBreak", "false");
            
            stopBreakSessionTimer();
            displayTotalBreakTime();
            
            // Resume work timer if the user is punched in
            if (localStorage.getItem("isPunchedIn") === "true") {
                startWorkSessionTimer(new Date());
            }
            document.getElementById('breakButton').textContent = 'Break In';
            fetchAttendanceRecords();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Break-out failed:', error.message);
    }
}

// Timer Functions remain the same
function startWorkSessionTimer(startTime) {
    workSessionStartTime = startTime;
    clearInterval(workTimerInterval);
    workTimerInterval = setInterval(updateWorkSessionTime, 1000);
}

function stopWorkSessionTimer() {
    clearInterval(workTimerInterval);
}

function updateWorkSessionTime() {
    const elapsedTime = new Date() - workSessionStartTime + accumulatedWorkTime;
    document.getElementById('workSessionTime').textContent = formatTime(elapsedTime);
}

function startBreakSessionTimer() {
    breakSessionStartTime = new Date();
    clearInterval(breakTimerInterval);
    breakTimerInterval = setInterval(updateBreakSessionTime, 1000);
}

function stopBreakSessionTimer() {
    clearInterval(breakTimerInterval);
}

function updateBreakSessionTime() {
    const elapsedTime = new Date() - breakSessionStartTime + accumulatedBreakTime;
    document.getElementById('breakSessionTime').textContent = formatTime(elapsedTime);
}

// Fetch attendance records with date reset check
async function fetchAttendanceRecords() {
    checkAndResetDate(); // Check if today’s date has changed and reset if necessary

    try {
        const response = await fetch(`${attendance_API}/get`, {
            method: 'GET',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch attendance records');
        }

        const data = await response.json();
        console.log("API Response:", data); // Log to verify data structure

        if (data.attendanceRecords && data.attendanceRecords.length > 0) {
            populateTable(data.attendanceRecords);
        } else {
            displayNoRecordsMessage();
            resetLocalStorageValues();
        }
    } catch (error) {
        console.error('Error fetching attendance:', error.message);
    }
}

// Populate Table with attendance data
function populateTable(data) {
    const tableBody = document.getElementById('attendance-table');
    tableBody.innerHTML = '';

    data.reverse().forEach((entry, index) => {
        console.log("Entry Data:", entry); // Log to check if break times are present

        const row = document.createElement('tr');
        const date = new Date(entry.date).toLocaleDateString();
        const punchIn = entry.punchIn ? new Date(entry.punchIn).toLocaleTimeString() : '-';
        const punchOut = entry.punchOut ? new Date(entry.punchOut).toLocaleTimeString() : '-';

        // Calculate total work time from punch in and punch out times
        const totalWorkTime = entry.totalWorkTime !== undefined ? entry.totalWorkTime : calculateTotalTime(entry.punchIn, entry.punchOut);
        const totalWorkHoursDisplay = formatTime(totalWorkTime);

        // Calculate total break time from all break sessions
        let totalBreakTime = 0;
        if (entry.breakSessions && entry.breakSessions.length > 0) {
            entry.breakSessions.forEach(breakSession => {
                if (breakSession.punchIn && breakSession.punchOut) {
                    totalBreakTime += calculateTotalTime(breakSession.punchIn, breakSession.punchOut);
                }
            });
        }
        const totalBreakHoursDisplay = formatTime(totalBreakTime);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${date}</td>
            <td>${punchIn}</td>
            <td>${punchOut}</td>
            <td>${totalWorkHoursDisplay}</td>
            <td>${totalBreakHoursDisplay}</td>
        `;

        tableBody.appendChild(row);
    });
}

function displayNoRecordsMessage() {
    const tableBody = document.getElementById('attendance-table');
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">No attendance records found</td>
        </tr>
    `;
}
