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
// =================================================================================
import { attendance_API} from './apis.js'
import { loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';

const token = localStorage.getItem('token');

async function handleSearch() {
    const searchFields = ["name","month","year"];
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    let queryParams = new URLSearchParams();

    searchFields.forEach((field) => {
        const value = document.getElementById(field)?.value?.trim();
        if (value && value !== "Select Year" && value !== "Select Month") {
            queryParams.append(field, value);
        }
    });

    console.log("📢 Sending API Request:", queryParams.toString()); // Debugging

    try {
        loading_shimmer(); // Show loading effect

        const response = await fetch(`${attendance_API}/search?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();
        console.log("🔍 Attendance Search Response:", res);

        if (!res || !res.attendanceRecords || res.attendanceRecords.length === 0) {
            attendanceTableBody.innerHTML = `<tr><td colspan="32" class="text-center">No attendance records found</td></tr>`;
            return;
        }

        let thData = document.getElementById('dateData').cells;

        //  Initialize row mapping for each employee
        let attendanceMap = {};

        //  Create an empty row for each employee
        res.attendanceRecords.forEach((e) => {
            if (!attendanceMap[e.userId._id]) {
                attendanceMap[e.userId._id] = {
                    name: e.userId.name,
                    records: {} // Stores attendance by day
                };
                // Default all days to empty (-)
                for (let i = 1; i < thData.length; i++) {
                    attendanceMap[e.userId._id].records[i] = '<td>-</td>';
                }
            }

            if (e.date) {
                let day = new Date(e.date).getDate(); // Extract day from date
                attendanceMap[e.userId._id].records[day] = e.status === "Present"
                    ? '<td class="text-center text-success"><i class="fa-solid fa-check"></i></td>' //  Present
                    : '<td class="text-danger"><i class="fa fa-close"></i></td>'; //  Absent
            }
        });

        //  Populate table
        let tableRows = Object.values(attendanceMap).map((employee) => {
            let row = `<tr><td>${employee.name}</td>`; // Employee Name
            for (let i = 1; i < thData.length; i++) {
                row += employee.records[i] || '<td>-</td>'; // Default to "-"
            }
            row += '</tr>';
            return row;
        }).join('');

        attendanceTableBody.innerHTML = tableRows;

    } catch (error) {
        console.error(" Error fetching search data:", error);
        attendanceTableBody.innerHTML = `<tr><td colspan="32" class="text-center text-danger">Error fetching data</td></tr>`;
    } finally {
        remove_loading_shimmer();
    }
}

//  Attach search function to button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch();
});





async function all_data_load_dashboard() {
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    attendanceTableBody.innerHTML = ''; //  Clear table before inserting new data

    try {
        const response = await fetch(`${attendance_API}/all?page=1&limit=10`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let res = await response.json();
        console.log(" API Response:", res); // Debugging

        let thData = document.getElementById('dateData').cells;
        let today = new Date().getDate(); // Get today's date

        //  Initialize row mapping for each employee
        let attendanceMap = {};

        //  Create an empty row for each employee with all past days as "Absent"  by default
        res.attendanceStatus.forEach((e) => {
            if (!attendanceMap[e.userId]) {
                attendanceMap[e.userId] = {
                    name: e.name,
                    records: {} // Stores attendance by day
                };
                // Default past days to "Absent" , future dates as blank
                for (let i = 1; i < thData.length; i++) {
                    if (i <= today) {
                        attendanceMap[e.userId].records[i] = '<td class="text-danger"><i class="fa fa-close"></i></td>'; //  Absent default
                    } else {
                        attendanceMap[e.userId].records[i] = '<td></td>'; 
                    }
                }
            }

            //  If employee has a "Present" status, update only those days
            if (e.date) {
                let day = new Date(e.date).getDate(); // Extract day from date
                if (day <= today) { //  Only update for past & today
                    attendanceMap[e.userId].records[day] = e.status === "Present"
                        ? '<td class="text-center text-success"><i class="fa-solid fa-check"></i></td>' //  Mark as present
                        : '<td class="text-danger"><i class="fa fa-close"></i></td>'; //  Mark as absent
                }
            }
        });

        //  Populate table
        Object.values(attendanceMap).forEach((employee) => {
            let row = `<tr><td>${employee.name}</td>`; // Employee Name
            for (let i = 1; i < thData.length; i++) {
                row += employee.records[i] || '<td></td>'; //  Default to blank for future dates
            }
            row += '</tr>';
            attendanceTableBody.innerHTML += row;
        });

    } catch (error) {
        console.log(" Error Fetching Attendance:", error);
        attendanceTableBody.innerHTML = `<tr><td colspan="32" class="text-center text-danger">Error fetching data</td></tr>`;
    }
}

//  Ensure function runs only once when the page loads
document.addEventListener("DOMContentLoaded", () => {
    if (!window.hasLoadedAttendance) { 
        window.hasLoadedAttendance = true;
        all_data_load_dashboard();
    }
});




