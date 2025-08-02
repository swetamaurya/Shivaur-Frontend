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
import { checkbox_function } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
import { leave_API, leaveType_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================

async function leaveSelectOption() {
    try {
        const response = await fetch(`${leaveType_API}/get`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const res = (await response.json())?.data;

        let t1 = document.getElementById("edit-leaveType");
        let t2 = document.getElementById("leaveType");

        res.forEach(e2 => {
            let option1 = document.createElement("option");
            option1.value = e2._id;
            option1.text = e2.leaveName;
            t1.appendChild(option1);

            let option2 = document.createElement("option");
            option2.value = e2._id;
            option2.text = e2.leaveName;
            t2.appendChild(option2);
        });
    } catch (error) {
        console.log("Error in leaveSelectOption:", error);
    }
}
leaveSelectOption();

let cachedDesignations = [];

async function fetchDesignationsAndDepartments() {
    if (cachedDesignations.length === 0) {
        try {
            const designationResponse = await fetch(`${leaveType_API}/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            let r1 = await designationResponse.json();    
            cachedDesignations = (r1)?.data;
        } catch (error) {
            console.error('Error fetching designations:', error);
        }
    }
}

function getCachedDesignation(designationId) {
    const designation = cachedDesignations.find(d => d._id === designationId);
    return designation ? designation.leaveName : '-';
}

async function all_data_load_dashboard() {
    let table = document.getElementById('leaveData');
    table.innerHTML = '';

    try {
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    await fetchDesignationsAndDepartments();

    try {
        const response = await fetch(`${leave_API}/get${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const res = await response.json();
        setTotalDataCount(res?.summary?.totalRecords);

        // **Handle leave type counts properly**
        let leaveTypeCounts = res?.leaveTypeCounts || {}; // Default to empty if missing
        let medicalLeave = leaveTypeCounts['Medical Leave'] || 0;
        let otherLeave = leaveTypeCounts['Other Leave'] || 0;
        let paidLeave = leaveTypeCounts['Paid Leave'] || 0;
        let casualLeave = leaveTypeCounts['Casual Leave'] || 0;

        // **Dynamically calculate leave counts if missing in API**
        if (Object.keys(leaveTypeCounts).length === 0) {
            res.leaves.forEach((leave) => {
                if (leave?.leaveType?.leaveName === "Medical Leave") medicalLeave++;
                if (leave?.leaveType?.leaveName === "Other Leave") otherLeave++;
                if (leave?.leaveType?.leaveName === "Paid Leave") paidLeave++;
                if (leave?.leaveType?.leaveName === "Casual Leave") casualLeave++;
            });
        }

        // **Update UI**
        document.getElementById('total_medical_leave').textContent = medicalLeave;
        document.getElementById('total_other_leave').textContent = otherLeave;
        document.getElementById('paidLeaveCount').textContent = paidLeave;
        document.getElementById('casualLeaveCount').textContent = casualLeave;

        let r = res.leaves;
        let tableRows = '';

        if (r && r.length > 0) {
            r.forEach(e => {
                // **Handle cases where `leaveType` is missing**
                const leaveTypeName = e?.leaveType?.leaveName || '-';

                tableRows += `
                    <tr data-id="${e._id || '-'}">
                        <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                        <td>${leaveTypeName}</td>
                        <td>${formatDate(e.from) || '-'}</td>
                        <td>${formatDate(e.to) || '-'}</td>
                        <td>${e.noOfDays || '-'}</td>
                        <td>${e.reason || '-'}</td>
                        <td>${e.leaveStatus || 'Pending'}</td>
                        <td>${e.approvedBy?.name || '-'}</td>
                        <td class="text-end">
                            <div class="dropdown dropdown-action"> 
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="material-icons">more_vert</i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditLeaves('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                    <a class="dropdown-item employee_restriction" onclick="individual_delete('${e._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div> 
                            </div> 
                        </td>
                    </tr>`;
            });
            table.innerHTML = tableRows;
            checkbox_function();
        } else {
            table.innerHTML = `<tr><td colspan="9" class="text-center">No leave records found</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        table.innerHTML = `<tr><td colspan="9" class="text-center">Error fetching data</td></tr>`;
    }

    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
}



// =============================================================================================
// =============================================================================================
// =============================================================================================
// On page load, load employee data for the dashboard
window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);
// =============================================================================================
// =============================================================================================


//add leave function
document.getElementById('add-leave-employee-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!validateLeaveForm()) {
        return; // Stop form submission if validation fails
    }
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------

    let leaveType = document.getElementById('leaveType').value;
    let halfDay = (document.getElementById("half_day_hide").classList.contains('d-none')) ? (null) : (document.getElementById('halfDayOption').value);
    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;
    let noOfDays = document.getElementById('noOfDays').value;
    let reason = document.getElementById('reason').value;
    
    try{
        let response = await fetch(`${leave_API}/post`,{
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({leaveType, halfDay, from, to, noOfDays, reason})  
        })

        try{
            document.getElementById('leaveType').value = '';
            document.getElementById('half_day_checkbox').checked = false;
            document.getElementById('from').value = '';
            document.getElementById('to').value = '';
            document.getElementById('noOfDays').value = '';
            document.getElementById('reason').value = '';
        } catch (error){}

        const resp = await response.json();
        console.log(resp);
        const success = response.ok;
        status_popup(success ? "Leave Created <br> Successfully!" : "Please try again later", success);
        if (success){
            all_data_load_dashboard();
        }
    } catch(error){
        console.log(error);
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

document.getElementById("half_day_checkbox").addEventListener("change", function(event){
    if(event.target.checked){
        document.getElementById("half_day_hide").classList.remove("d-none");
    } else{
        document.getElementById("half_day_hide").classList.add("d-none");
    }
}); // Event listeners for date changes and type selection
["from","to","half_day_checkbox","halfDayOption"].map((e)=>{
    document.getElementById(`${e}`).addEventListener("change", calculateNumberOfDays1);
})
function calculateNumberOfDays1() {
    const fromDate = new Date(document.getElementById('from').value);
    const toDate = new Date(document.getElementById('to').value);
    const halfDay = document.getElementById('half_day_checkbox').checked;
    const halfDayOption = document.getElementById('halfDayOption').value;

    // Calculate the difference in days, accounting for half-day options
    let daysDiff = toDate - fromDate;
    daysDiff = Math.ceil(daysDiff / (1000 * 60 * 60 * 24));
    if (halfDay) {
        if (halfDayOption === 'First Half') {
            daysDiff -= 0.5;
        } else if (halfDayOption === 'Second Half') {
            daysDiff -= 0.5;
        }
    }

    // Update the noOfDays input field
    document.getElementById('noOfDays').value = daysDiff+1;
}


document.getElementById("edit-half_day_checkbox").addEventListener("change", function(event){
    if(event.target.checked){
        document.getElementById("edit-half_day_hide").classList.remove("d-none");
    } else{
        document.getElementById("edit-half_day_hide").classList.add("d-none");
    }
});  // Event listeners for date changes and type selection
["edit-from","edit-to","edit-half_day_checkbox","edit-halfDayOption"].map((e)=>{
    document.getElementById(`${e}`).addEventListener("change", calculateNumberOfDays2);
})
function calculateNumberOfDays2() {
    const fromDate = new Date(document.getElementById('edit-from').value);
    const toDate = new Date(document.getElementById('edit-to').value);
    const halfDay = document.getElementById('edit-half_day_checkbox').checked;
    const halfDayOption = document.getElementById('edit-halfDayOption').value;

    // Calculate the difference in days, accounting for half-day options
    let daysDiff = toDate - fromDate;
    daysDiff = Math.ceil(daysDiff / (1000 * 60 * 60 * 24));
    if (halfDay) {
        if (halfDayOption === 'First Half') {
            daysDiff -= 0.5;
        } else if (halfDayOption === 'Second Half') {
            daysDiff -= 0.5;
        }
    }

    // Update the noOfDays input field
    document.getElementById('edit-noOfDays').value = daysDiff+1;
}
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
//edit the data
window.handleClickOnEditLeaves = async function handleClickOnEditLeaves(e){
    const response = await fetch(`${leave_API}/get/${e}`, 
    {
        method: 'GET',
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type':'application/json'
        }
    });
    let d1 = await response.json();

    try{
        document.getElementById("update-id").values = d1?._id;
        document.getElementById("edit-leaveType").value = d1?.leaveType._id || '';
        document.getElementById("edit-from").value = formatDateForInput(d1?.from) || '';
        document.getElementById("edit-to").value = formatDateForInput(d1?.to) || '';
        document.getElementById("edit-noOfDays").value = d1?.noOfDays || '';
        document.getElementById("edit-reason").value = d1?.reason || '';  
          
        if(d1?.halfDay!=null || d1?.halfDay!=''){
            document.getElementById("edit-half_day_checkbox").checked = true;
            document.getElementById("edit-half_day_hide").classList.remove("d-none");
            document.getElementById("edit-halfDayOption").value = d1?.halfDay || '';
        }
    } catch(error){

    }

}
// ----------------------------------------------------------------------------------------
// Update Employee Leave
document.getElementById('edit-leave-employee-form').addEventListener('submit',async function(event){
    event.preventDefault();
    // leaveUpdateForm.removeEventListener('submit',luf);
        
    if (!validateEditLeaveForm()) {
        return; // Stop form submission if validation fails
    }
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    
    try{
        let leaveType = document.getElementById('edit-leaveType').value;
        let halfDay = (document.getElementById("edit-half_day_hide").classList.contains('d-none')) ? (null) : (document.getElementById('edit-halfDayOption').value);
        let from = document.getElementById('edit-from').value;
        let to = document.getElementById('edit-to').value;
        let noOfDays = document.getElementById('edit-noOfDays').value;
        let reason = document.getElementById('edit-reason').value;
        let _id = document.getElementById("update-id").values;
        
        let response = await fetch(`${leave_API}/update`,{
            method:'POST',
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify({leaveType,from,to,noOfDays,halfDay,reason ,_id})
        }) 
    
        const success = response.ok;
        status_popup(success ? "Leave Updated <br> Successfully!" : "Please try <br> again later", success);
        if (success){
            all_data_load_dashboard();
        }
    } catch(error){
        console.log(error)
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

// ==================================================================================
// ==================================================================================
// ==================================================================================
// ==================================================================================
// ==================================================================================

// Validation function for edit leave form
function validateEditLeaveForm() {
    clearErrors(); // Clear previous error messages

    let isValid = true;

    // Get field elements
    const leaveType = document.getElementById('edit-leaveType');
    const halfDayOption = document.getElementById('edit-halfDayOption');
    const halfDayCheckbox = document.getElementById('edit-half_day_checkbox');
    const from = document.getElementById('edit-from');
    const to = document.getElementById('edit-to');
    const reason = document.getElementById('edit-reason');

    // Leave Type Validation
    if (!leaveType.value.trim()) {
        showError(leaveType, 'Please select a leave type');
        isValid = false;
    }

    // Half Day Validation (only if checkbox is checked)
    if (halfDayCheckbox.checked && !halfDayOption.value.trim()) {
        showError(halfDayOption, 'Please select a half-day type');
        isValid = false;
    }

    // From Date Validation
    if (!from.value.trim()) {
        showError(from, 'Please select a start date');
        isValid = false;
    }

    // To Date Validation
    if (!to.value.trim()) {
        showError(to, 'Please select an end date');
        isValid = false;
    } else if (new Date(to.value) < new Date(from.value)) {
        showError(to, 'End date cannot be before start date');
        isValid = false;
    }

    // Reason Validation
    if (!reason.value.trim()) {
        showError(reason, 'Please provide a reason for leave');
        isValid = false;
    }

    return isValid;
}

// Show/Hide Half Day Option based on checkbox
document.getElementById('edit-half_day_checkbox').addEventListener('change', function () {
    const halfDaySection = document.getElementById('edit-half_day_hide');
    if (this.checked) {
        halfDaySection.classList.remove('d-none');
    } else {
        halfDaySection.classList.add('d-none');
        document.getElementById('edit-halfDayOption').value = ''; // Reset half-day value
    }
});

// ----------------------------------------------------------------------------------
// Validation function for add leave form
function validateLeaveForm() {
    clearErrors(); // Clear previous error messages

    let isValid = true;

    // Get field elements
    const leaveType = document.getElementById('leaveType');
    const halfDayOption = document.getElementById('halfDayOption');
    const halfDayCheckbox = document.getElementById('half_day_checkbox');
    const from = document.getElementById('from');
    const to = document.getElementById('to');
    const reason = document.getElementById('reason');

    // Leave Type Validation
    if (!leaveType.value.trim()) {
        showError(leaveType, 'Please select a leave type');
        isValid = false;
    }

    // Half Day Validation (only if checkbox is checked)
    if (halfDayCheckbox.checked && !halfDayOption.value.trim()) {
        showError(halfDayOption, 'Please select a half-day type');
        isValid = false;
    }

    // From Date Validation
    if (!from.value.trim()) {
        showError(from, 'Please select a start date');
        isValid = false;
    }

    // To Date Validation
    if (!to.value.trim()) {
        showError(to, 'Please select an end date');
        isValid = false;
    } else if (new Date(to.value) < new Date(from.value)) {
        showError(to, 'End date cannot be before start date');
        isValid = false;
    }

    // Reason Validation
    if (!reason.value.trim()) {
        showError(reason, 'Please provide a reason for leave');
        isValid = false;
    }

    return isValid;
}

// Function to show error messages next to labels
function showError(element, message) {
    const errorContainer = element.previousElementSibling; // Access the div with label
    let errorElement = errorContainer.querySelector('.text-danger.text-size');

    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'text-danger text-size     mohit_error_js_dynamic_validation';
        errorElement.style.fontSize = '10px';
        errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
        errorContainer.appendChild(errorElement);
    } else {
        errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
    }
}

// Function to clear all error messages
function clearErrors() {
    const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
    errorMessages.forEach((msg) => msg.remove());
}

// Show/Hide Half Day Option based on checkbox
document.getElementById('half_day_checkbox').addEventListener('change', function () {
    const halfDaySection = document.getElementById('half_day_hide');
    if (this.checked) {
        halfDaySection.classList.remove('d-none');
    } else {
        halfDaySection.classList.add('d-none');
        document.getElementById('halfDayOption').value = ''; // Reset half-day value
    }
});



// Set the min attribute of date inputs to today's date
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('from').setAttribute('min', today);
    document.getElementById('to').setAttribute('min', today);
});
