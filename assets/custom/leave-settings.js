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
// Import required modules and functions
import { checkbox_function } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js';
import { leaveType_API } from './apis.js';
// -------------------------------------------------------------------------
import { individual_delete, objects_data_handler_function } from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// =================================================================================
const token = localStorage.getItem('token');

// =================================================================================
// Fetch and display all leave data in the dashboard
async function all_data_load_dashboard() {

    try {
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    let tableData = document.getElementById('tableData');
    tableData.innerHTML = '';
    let rows;

    try {
        const response = await fetch(`${leaveType_API}/get${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        let r2 = await response.json();
        let res = r2?.data;
        setTotalDataCount(r2?.totalLeaveTypes);

        // console.log("brrooro :--- ",res);

        if (res && res.length > 0) {
            rows = res.map((leave, index) => {
                return `
                <tr data-id="${leave._id || '-'}">
                    <td><input type="checkbox" class="checkbox_child" value="${leave._id || '-'}"></td>
                    <td>${index + 1}</td>
                    <td>${capitalizeFirstLetter(leave.leaveName) || '-'}</td>
                    <td>${leave.day || '-'}</td>
                    <td>${capitalizeFirstLetter(leave.durationLeave) || '-'}</td>
                    <td>
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="material-icons">more_vert</i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" onclick="handleEditLeave('${leave._id}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                                    <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                </a>
                                <a class="dropdown-item" onclick="individual_delete('${leave._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                                    <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>`;
            });

            tableData.innerHTML = rows.join('');
            checkbox_function(); // Ensure checkboxes work after loading data
        } else {
            tableData.innerHTML = `
                <tr>
                    <td colspan="6" class='text-center'><i class="fa-solid fa-times"></i> No leave data available</td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error fetching leave data:', error);
        tableData.innerHTML = `
            <tr>
                <td colspan="6" class='text-center'><i class="fa-solid fa-times"></i> Error loading data</td>
            </tr>`;
    }

    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
}

// =========================================================================================
// Handle form submission for adding a new leave type
document.getElementById('add_leave_setting').addEventListener('submit', async function(event) {
    event.preventDefault();

    if (!validateLeaveForm()) {
        return;
    }

    try {
        Array.from(document.querySelectorAll(".btn-close")).map(e => e.click());
    } catch (error) {
        console.log(error);
    }

    try {
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    const leaveName = document.getElementById('type-of-leave').value.trim();
    const day = document.getElementById('leaveDays').value.trim();
    const durationLeave = document.getElementById('days-of-leave').value;

    try {
        const response = await fetch(`${leaveType_API}/post`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ leaveName, day, durationLeave }),
        });

        const success = response.ok;
        status_popup(success ? "Leave Created <br> Successfully!" : "Please try again later", success);
        if (success) {
            all_data_load_dashboard();
            add_leave_setting.reset()
        }
    } catch (error) {
        console.error('Error adding leave type:', error);
        status_popup("Please try again later", false);
    }

    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
});

// =========================================================================================
// Load leave details for editing
window.handleEditLeave = async function(leaveId) {

    try {
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    try {
        const response = await fetch(`${leaveType_API}/get/${leaveId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const leave = await response.json();
        console.log(" :- ",leave)
        document.getElementById("_id_hidden_edit").value = leave._id || '';
        document.getElementById('edi-type-of-leave').value = leave.leaveName || '';
        document.getElementById('editleaveDays').value = leave.day || '';
        document.getElementById('edit-days-of-leave').value = leave.durationLeave || '';
    } catch (error) {
        console.error('Error loading leave details:', error);
    }

    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
};

// =========================================================================================
// Handle form submission for updating leave type
document.getElementById('edit_leave_setting').addEventListener('submit', async function(event) {
    event.preventDefault();

    if (!validateEditLeaveForm()) {
        return;
    }

    try {
        Array.from(document.querySelectorAll(".btn-close")).map(e => e.click());
    } catch (error) {
        console.log(error);
    }

    try {
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    const _id = document.getElementById("_id_hidden_edit").value;
    const leaveName = document.getElementById('edi-type-of-leave').value.trim();
    const day = document.getElementById('editleaveDays').value.trim();
    const durationLeave = document.getElementById('edit-days-of-leave').value;

    try {
        const response = await fetch(`${leaveType_API}/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, leaveName, day, durationLeave }),
        });

        const success = response.ok;
        status_popup(success ? "Leave Updated <br> Successfully!" : "Please try <br> again later", success);
        if (success) {
            all_data_load_dashboard();
        }
    } catch (error) {
        console.error('Error updating leave type:', error);
        status_popup("Please try <br> again later", false);
    }

    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
});

// =========================================================================================
// Validation for adding leave form
function validateLeaveForm() {
    clearErrors();

    let isValid = true;
    const leaveName = document.getElementById('type-of-leave');
    const leaveDays = document.getElementById('leaveDays');
    const daysLeaveType = document.getElementById('days-of-leave');

    if (!leaveName.value.trim()) {
        showError(leaveName, 'Leave name is required');
        isValid = false;
    }

    if (!leaveDays.value.trim() || isNaN(leaveDays.value) || leaveDays.value <= 0) {
        showError(leaveDays, 'Enter a valid number of leave days');
        isValid = false;
    }

    if (!daysLeaveType.value) {
        showError(daysLeaveType, 'Please select a duration type');
        isValid = false;
    }

    return isValid;
}

// Validation for editing leave form
function validateEditLeaveForm() {
    clearErrors();

    let isValid = true;
    const leaveName = document.getElementById('edi-type-of-leave');
    const leaveDays = document.getElementById('editleaveDays');
    const daysLeaveType = document.getElementById('edit-days-of-leave');

    if (!leaveName.value.trim()) {
        showError(leaveName, 'Leave name is required');
        isValid = false;
    }

    if (!leaveDays.value.trim() || isNaN(leaveDays.value) || leaveDays.value <= 0) {
        showError(leaveDays, 'Enter a valid number of leave days');
        isValid = false;
    }

    if (!daysLeaveType.value) {
        showError(daysLeaveType, 'Please select a duration type');
        isValid = false;
    }

    return isValid;
}

// --------------------------------------------------------------------------------------------------
// Function to show error messages inside the correct div next to labels
// --------------------------------------------------------------------------------------------------
function showError(element, message) {
    const errorContainer = element.previousElementSibling; // Access the div with label
    let errorElement = errorContainer.querySelector('.text-danger.text-size');
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'text-danger text-size mohit_error_js_dynamic_validation';
        errorElement.style.fontSize = '10px';
        errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
        errorContainer.appendChild(errorElement);
    } else {
        errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
    }
}
// --------------------------------------------------------------------------------------------------
// Function to clear all error messages
// --------------------------------------------------------------------------------------------------
function clearErrors() {
    const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
    errorMessages.forEach((msg) => msg.remove());
}

// =========================================================================================
// Load data on page load
window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);
