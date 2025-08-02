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
import { user_API, departments_API, desginations_API, global_search_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================
// Function to handle search and update the same table
async function handleSearch() {
    const searchFields = ["userId", "name"]; // IDs of input fields
    const searchType = "user"; // Type to pass to the backend
    
    const tableData = document.getElementById("tableData");
    let x = ''; // Initialize rows content

    try {
        loading_shimmer(); // Display shimmer loader

        // Construct query parameters for the search
        const queryParams = new URLSearchParams({ type: searchType }); 
        searchFields.forEach((field) => {
            const value = document.getElementById(field)?.value?.trim();
            if (value) queryParams.append(field, value);
        });

        // Send search request
       
        const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();

        if (response.ok && res.data?.length > 0) {
           // Filter out users with 'Admin' or 'Client' roles
           const filteredData = res.data.filter(
            (user) => !['Admin', 'Client'].includes(user.roles?.roles)
        );

        if (filteredData.length > 0) {
            // Generate table rows dynamically
            const rows = filteredData.map((user) => {
                // const designation = getCachedDesignation(user?.designations);
                return `
                <tr data-id="${user?._id || '-'}">
                    <td><input type="checkbox" class="checkbox_child" value="${user?._id || '-'}"></td>
                    <td>${capitalizeFirstLetter(user?.name) || '-'}</td>
                    <td>${user?.userId || '-'}</td>
                    <td>${user?.mobile || '-'}</td>
                    <td>${capitalizeFirstLetter(user?.designations?.designations) || '-'}</td>
                    <td>${capitalizeFirstLetter(user?.status) || '-'}</td>
                    <td>${formatDate(user?.joiningDate) || '-'}</td>
                    <td>${formatDate(user?.DOB) || '-'}</td>
                    <td class="">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="material-icons">more_vert</i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="userProfile.html?id=${user?._id}">
                                    <i class="fa-regular fa-eye"></i> View
                                </a>
                                <a class="dropdown-item" onclick="handleClickOnEditEmployee('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                                    <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                </a>
                                <a class="dropdown-item" onclick="individual_delete('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                                    <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>`;
            });

            tableData.innerHTML = rows.join(''); // Insert rows into the table
        } else {
            x = `<tr><td colspan="9" class="text-center">No results found</td></tr>`;
        }
    } else {
        x = `<tr><td colspan="9" class="text-center">No results found</td></tr>`;
    }
    } catch (error) {
        console.error("Error during search:", error);
        x = `<tr><td colspan="9" class="text-center">An error occurred during search</td></tr>`;
    } finally {
        if (x) tableData.innerHTML = x; // If no data, show message
        checkbox_function(); // Reinitialize checkboxes
        remove_loading_shimmer(); // Remove shimmer loader
    }
}

// Attach the search function to the search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});


// =================================================================================
// =================================================================================
// =================================================================================

let cachedDesignations = [];
let cachedDepartments = [];
// Fetch and cache designations and departments once
async function fetchDesignationsAndDepartments() {
    if (cachedDesignations.length === 0) {
        try {
            const designationResponse = await fetch(`${desginations_API}/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            let r = await designationResponse.json();
            cachedDesignations = r?.data;
        } catch (error) {
            console.error('Error fetching designations:', error);
        }
    }

    if (cachedDepartments.length === 0) {
        try {
            const departmentResponse = await fetch(`${departments_API}/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            let r = await departmentResponse.json();
            cachedDepartments = r?.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }
}

// Populate select dropdowns with cached data
function populateSelectOptions(elementId, options) {
    try{
        const select = document.getElementById(elementId);
        select.innerHTML = '';
        select.innerHTML = `<option value="" disabled selected>Select ${capitalizeFirstLetter(elementId)}</option>`;
        select.innerHTML += options.map(option =>{            
            return (
                `<option value="${option._id}">${option?.designations || option?.departments}</option>`
            )
        }).join('');
    } catch (error){console.error(error)}
}
// -------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------
// Load all employee data for the dashboard table
async function all_data_load_dashboard() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    await fetchDesignationsAndDepartments();
    
    let tableData = document.getElementById('tableData');
    tableData.innerHTML = '';
    let rows;
    // -----------------------------------------------------------------------------------
    try {
        const response = await fetch(`${user_API}/data/get${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();
        setTotalDataCount(res?.totalEmployees);
        const users = res?.users?.employees;

        if (users && users.length>0) {
            // Generate table rows asynchronously
            rows = users.map((user) => {
                // const designation = getCachedDesignation(user?.designations);
                return `
                <tr data-id="${user?._id || '-'}">
                    <td><input type="checkbox" class="checkbox_child" value="${user?._id || '-'}"></td>
                    <td>${capitalizeFirstLetter(user?.name) || '-'}</td>
                    <td>${user?.userId || '-'}</td>
                    <td>${user?.mobile || '-'}</td>
                    <td>${capitalizeFirstLetter(user?.designations?.designations) || '-'}</td>
                    <td>${(user?.status) || '-'}</td>
                    <td>${formatDate(user?.joiningDate) || '-'}</td>
                    <td>${formatDate(user?.DOB) || '-'}</td>
                    <td class="">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item"  href="userProfile.html?id=${user?._id}"><i class="fa-regular fa-eye"></i> View</a>
                                <a class="dropdown-item" onclick="handleClickOnEditEmployee('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                <a class="dropdown-item" onclick="individual_delete('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                            </div>
                        </div>
                    </td>
                </tr>`;
            });

            tableData.innerHTML = rows.join('');
            checkbox_function();
        } else {
            rows = `
                <tr>
                    <td  colspan="9" class='text-center'><i class="fa-solid fa-times"></i> Data is not available, please insert the data</td>
                </tr>`;

            tableData.innerHTML = rows;
        }
    } catch (error) {
        rows = `
            <tr>
                <td  colspan="9" class='text-center'><i class="fa-solid fa-times"></i> Data is not available, please insert the data</td>
            </tr>`;

        tableData.innerHTML = rows;
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        document.dispatchEvent(new Event('removeDataFromEmployee'))
        remove_loading_shimmer();
    } catch(error){console.log(error)}

    // Populate the select options only once using cached data
    populateSelectOptions('departments', cachedDepartments);
    populateSelectOptions('designations', cachedDesignations);
}

// Get cached designation name by ID
// function getCachedDesignation(designationId) {
//     const designation = cachedDesignations.find(d => d._id === designationId);
//     return designation ? designation.designations : '';
// }

// ==========================================================================================
// Logic to check both email fields on blur for equality
document.getElementById('email').addEventListener('blur', function() {
    const email = document.getElementById('email').value;
    const personalEmail = document.getElementById('personalEmail').value;
    if (email === personalEmail) {
        showError(document.getElementById('personalEmail'), 'Personal Email cannot be the same as official email');
    }
});

document.getElementById('personalEmail').addEventListener('blur', function() {
    const email = document.getElementById('email').value;
    const personalEmail = document.getElementById('personalEmail').value;
    if (email === personalEmail) {
        showError(document.getElementById('personalEmail'), 'Personal Email cannot be the same as official email');
    }
});
// -------------------------------------------------------------------------------------------------------

// Handle form submission
document.getElementById('add_employee_form').addEventListener('submit', async function(event) {
    event.preventDefault();
    if (!validatorAddEmployee()) {
        return; 
      }
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------

    // Clear the form fields after submission

    try {
        let formData = rtnEmpFormData();

        const response = await fetch(`${user_API}/post`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const success = response.ok;
        status_popup(success ? "Employee Created <br> Successfully!" : "Please try again later", success);
        if (success){
            all_data_load_dashboard();
            document.getElementById('add_employee_form').reset();

        }
    } catch (error) {
        console.error('Error adding employee:', error);
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});
// ----------------------------------------------------------------------------------------------------
function rtnEmpFormData() {
    let f = new FormData();

    // Utility function to append file (if exists)
    function appendFile(key, elementId) {
        let fileInput = document.getElementById(elementId);
        if (fileInput && fileInput.files.length > 0) {
            f.append(key, fileInput.files[0]);  // Sirf ek file bhej raha hai
        }
    }

    // Utility function to append multiple files (if exists)
    function appendMultipleFiles(key, elementId) {
        let fileInput = document.getElementById(elementId);
        if (fileInput && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                f.append(key , fileInput.files[i]);  // Multiple images
            }
        }
    }

    // Utility function to append text field (if exists)
    function appendValue(key, elementId) {
        let element = document.getElementById(elementId);
        if (element) {
            f.append(key, element.value.trim());
        }
    }

    // Single image upload
    appendFile("image", "employee_employee_photo"); // Employee Profile Photo
    appendFile("panImage", "panCardImage"); // PAN Card Image

    // Multiple images upload
    appendMultipleFiles("aadharImage", "aadharCardImage"); // Aadhar Multiple Images
    appendMultipleFiles("pfFiles", "pfFileImage"); // PF Documents

    // Basic Details
    appendValue("name", "employee_name");
    appendValue("email", "email");
    appendValue("password", "password");
    appendValue("personalEmail", "personalEmail");
    appendValue("mobile", "mobile");
    appendValue("roles", "roles");
    appendValue("joiningDate", "joiningDate");
    appendValue("DOB", "DOB");
    appendValue("status", "status");
    appendValue("departments", "departments");
    appendValue("designations", "designations");
    appendValue("gender", "employee-gender");
    appendValue("address", "employee-address");

    // Identity Details
    appendValue("PANNumber", "employee_addhar_card_number");
    appendValue("aadharNumber", "employee_pan_card");
    appendValue("pfNumber", "employee_pf_number");

    // Bank Details
    f.append("bankDetails[bankName]", document.getElementById("employee_bank_name")?.value || "");
    f.append("bankDetails[accountNumber]", document.getElementById("employee_account_number")?.value || "");
    f.append("bankDetails[IFSCCode]", document.getElementById("employee_ifsc_code")?.value || "");
    f.append("bankDetails[accountType]", document.getElementById("employee_account_type")?.value || "");
    f.append("bankDetails[accountHolder]", document.getElementById("employee_holder_name")?.value || "");
    f.append("bankDetails[branchName]", document.getElementById("employee_branch_name")?.value || "");

    return f;
}


// ===========================================================================================================
// ===========================================================================================================
// ===========================================================================================================

function updateRtnEmpFormData() {
    let f = new FormData();
    f.append("_id",document.getElementById("update-id").value);

    // Utility function to append file (if exists)
    function appendFile(key, elementId) {
        let fileInput = document.getElementById(elementId);
        if (fileInput && fileInput.files.length > 0) {
            f.append(key, fileInput.files[0]);  // Sirf ek file bhej raha hai
        }
    }

    // Utility function to append multiple files (if exists)
    function appendMultipleFiles(key, elementId) {
        let fileInput = document.getElementById(elementId);
        if (fileInput && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                f.append(key , fileInput.files[i]);  // Multiple images
            }
        }
    }

    // Utility function to append text field (if exists)
    function appendValue(key, elementId) {
        let element = document.getElementById(elementId);
        if (element) {
            f.append(key, element.value.trim());
        }
    }

    // Single image upload
    appendFile("image", "update-employee_employee_photo"); // Employee Profile Photo
    appendFile("panImage", "update-panCardImage"); // PAN Card Image

    // Multiple images upload
    appendMultipleFiles("aadharImage", "update-aadharCardImage"); // Aadhar Multiple Images
    appendMultipleFiles("pfFiles", "update-pfFileImage"); // PF Documents

    // Basic Details
    appendValue("name", "update-employee_name");
    appendValue("email", "update-email");
    appendValue("personalEmail", "update-personalEmail");
    appendValue("mobile", "update-mobile");
    appendValue("roles", "update-roles");
    appendValue("joiningDate", "update-joiningDate");
    appendValue("DOB", "update-DOB");
    appendValue("status", "update-status");
    appendValue("departments", "update-departments");
    appendValue("designations", "update-designations");
    appendValue("gender", "update-employee-gender");
    appendValue("address", "update-employee-address");

    // Identity Details
    appendValue("PANNumber", "update-employee_addhar_card_number");
    appendValue("aadharNumber", "update-employee_pan_card");
    appendValue("pfNumber", "update-employee_pf_number");

    // Bank Details
    f.append("bankDetails[bankName]", document.getElementById("update-employee_bank_name")?.value || "");
    f.append("bankDetails[accountNumber]", document.getElementById("update-employee_account_number")?.value || "");
    f.append("bankDetails[IFSCCode]", document.getElementById("update-employee_ifsc_code")?.value || "");
    f.append("bankDetails[accountType]", document.getElementById("update-employee_account_type")?.value || "");
    f.append("bankDetails[accountHolder]", document.getElementById("update-employee_holder_name")?.value || "");
    f.append("bankDetails[branchName]", document.getElementById("update-employee_branch_name")?.value || "");

    return f;
}
// ===========================================================================================================
// ===========================================================================================================
// Load employee details for editing
window.handleClickOnEditEmployee = async function (employeeId) {
    await fetchDesignationsAndDepartments(); // Ensure designations and departments are loaded before editing
    populateSelectOptions("update-department", cachedDepartments);
    populateSelectOptions("update-designation", cachedDesignations);
    
    const formDocument = document.getElementById("employee-update-form");
    try {
        const response = await fetch(`${user_API}/get/${employeeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const r = await response.json();

        try{
            formDocument.querySelector("#update-id").value = r?._id ;

            formDocument.querySelector("#update-status").value = r?.status || '' ;
            formDocument.querySelector("#update-joiningDate").value = r?.joiningDate || '' ;
            formDocument.querySelector("#update-employee_name").value = r?.name || '' ;
            formDocument.querySelector("#update-email").value = r?.email || '' ;
            formDocument.querySelector("#update-personalEmail").value = r?.personalEmail || '' ;
        } catch (error){
            console.log(error);
        }
        try{
            formDocument.querySelector("#update-mobile").value = r?.mobile || '' ;
            formDocument.querySelector("#update-DOB").value = r?.DOB || '' ;
            formDocument.querySelector("#update-department").value = r?.departments?._id || '' ;
            formDocument.querySelector("#update-designation").value = r?.designations?._id || '' ;
            formDocument.querySelector("#update-employee-gender").value = r?.gender || '' ;
            formDocument.querySelector("#update-employee-address").value = r?.address || '' ;
        } catch (error){
            console.log(error);
        }
        try{
            formDocument.querySelector("#update-employee_addhar_card_number").value = r?.aadharNumber ;
            formDocument.querySelector("#update-employee_pan_card").value = r?.PANNumber ;
            formDocument.querySelector("#update-employee_pf_number").value = r?.pfNumber ;
        } catch (error){
            console.log(error);
        }
        try{
            const bank = r?.bankDetails;
            formDocument.querySelector("#update-employee_bank_name").value = bank?.bankName ;
            formDocument.querySelector("#update-employee_branch_name").value = bank?.branchName ;
            formDocument.querySelector("#update-employee_holder_name").value = bank?.accountHolder ;
            formDocument.querySelector("#update-employee_account_type").value = bank?.accountType ;
            formDocument.querySelector("#update-employee_account_number").value = bank?.accountNumber ;
            formDocument.querySelector("#update-employee_ifsc_code").value = bank?.IFSCCode ;
        } catch (error){
            console.log(error);
        }
    } catch (error) {
        console.error('Error loading employee details:', error);
    }
};
// ----------------------------------------------------------------------------
// Update employee details
let empUpdtMdlForm = document.getElementById('employee-update-form');
empUpdtMdlForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    if(!validatorEditEmployee()){
        return
    }
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------

    try {
        let formData = updateRtnEmpFormData();
        const response = await fetch(`${user_API}/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const success = response.ok;
        status_popup(success ? "Employee Updated <br> Successfully!" : "Please try <br> again later", success);
        if (success){
            all_data_load_dashboard();
        }
    } catch (error) {
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        empUpdtMdlForm.reset();
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

// =======================================================================================
// =======================================================================================

// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);

// ==================================================================================================
// Validation for Add Employee ======================================================================
function validatorAddEmployee() {
    // Clear previous errors
    clearErrors();

    let isValid = true;


    const roles = document.getElementById('roles');
    const status = document.getElementById('status');
    const joiningDate = document.getElementById('joiningDate');
    const employeeName = document.getElementById('employee_name');
    const personalEmail = document.getElementById('personalEmail');
    const mobile = document.getElementById('mobile');
    const DOB = document.getElementById('DOB');
    const departments = document.getElementById('departments');
    const designations = document.getElementById('designations');
    const employeeGender = document.getElementById('employee-gender');
    const employeeAddress = document.getElementById('employee-address');
    const employeeAdhaarCardNumber = document.getElementById('employee_addhar_card_number');
    // const aadharCardImage = document.getElementById('aadharCardImage');
    const employeePanCard = document.getElementById('employee_pan_card');
    // const panCardImage = document.getElementById('panCardImage');
    const employeePfNumber = document.getElementById('employee_pf_number');
    // const pfFileImage = document.getElementById('pfFileImage');
    const employeeBankName = document.getElementById('employee_bank_name');
    const employeeBranchName = document.getElementById('employee_branch_name');
    const employeeHolderName = document.getElementById('employee_holder_name');
    const employeeAccountType = document.getElementById('employee_account_type');
    const employeeAccountNumber = document.getElementById('employee_account_number');
    const employeeIfscCode = document.getElementById('employee_ifsc_code');

    // Validation logic

    //Validate Roles
    if (!roles.value.trim()) {
        showError(roles, "IFSC code is required");
        isValid = false;
      }

    //Validate Status  
    if (!status.value.trim()) {
        showError(status, "Status is required");
        isValid = false;
    }

    // Validate Joining Date
    if (!joiningDate.value.trim()) {
        showError(joiningDate, 'Joining date is required');
        isValid = false;
    }

    // Validate Joining Date
    if (!DOB.value.trim()) {
        showError(DOB, 'DOB is required');
        isValid = false;
    }

    //Validate Department
    if (!departments.value.trim()) {
        showError(departments, 'Department is required');
        isValid = false;
    }
    //Validate Department
    if (!designations.value.trim()) {
        showError(designations, 'Designation is required');
        isValid = false;
    }

    // Validate Employee Name
    if (!employeeName.value.trim() || /\d/.test(employeeName.value)) {
        showError(employeeName, 'Enter a valid name without numbers');
        isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!personalEmail.value.trim() || !emailPattern.test(personalEmail.value)) {
        showError(email, 'Enter a valid email address');
        isValid = false;
    }

    // if (!GST.value.trim() || /\d/.test(gstNumber.value)) {
    //     showError(gstNumber, 'Enter a valid GST numbers');
    //     isValid = false;
    // }

    // Validate Mobile
    const mobileValue = mobile.value.trim();
    if (!mobileValue || mobileValue.length < 10 || mobileValue.length > 13 || !/^\d+$/.test(mobileValue)) {
        showError(mobile, 'Enter a valid phone number');
        isValid = false;
    }

    // Validate Aadhar Number
    const aadharPattern = /^\d{12}$/; // Aadhar number should be exactly 12 digits
    if (!employeeAdhaarCardNumber.value.trim() || !aadharPattern.test(employeeAdhaarCardNumber.value)) {
        showError(employeeAdhaarCardNumber, 'Enter a valid 12-digit Aadhar number');
        isValid = false;
    }

    // Validate PAN Number
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/; // PAN format: 5 letters, 4 digits, 1 letter
    if (!employeePanCard.value.trim() || !panPattern.test(employeePanCard.value)) {
        showError(employeePanCard, 'Enter a valid PAN number');
        isValid = false;
    }

    // Validate Employee Pf Number
    if (!employeePfNumber.value.trim()) {
        showError(employeePfNumber, 'Employee Pf Number is required');
        isValid = false;
    }

    // Validate Address
    if (!employeeAddress.value.trim() || employeeAddress.value.length < 5) {
        showError(employeeAddress, 'Address must be at least 5 characters long');
        isValid = false;
    }

    // Validate Bank Name
    if (!employeeBankName.value.trim()) {
        showError(employeeBankName, "Bank name is required");
        isValid = false;
      } 

    // Validate Branch Name
    if (!employeeBranchName.value.trim()) {
        showError(employeeBranchName, "Branch name is required");
        isValid = false;
    }

    // Validate Employee Holder Name
    if (!employeeHolderName.value.trim()) {
        showError(employeeHolderName, "Holder name is required");
        isValid = false;
    } 

    // Validate employeeAccountType
    if (!employeeAccountType.value.trim()) {
        showError(employeeAccountType, "Account Type is required");
        isValid = false;
    }
      
    //Validate Account Number
    if (!employeeAccountNumber.value.trim()) {
        showError(employeeAccountNumber, "Account number is required");
        isValid = false;
    } else if (!/^\d+$/.test(employeeAccountNumber.value.trim())) {
        showError(employeeAccountNumber, "Account number must be numeric");
        isValid = false;
    }

    // Validate IFSC Code
    if (!employeeIfscCode.value.trim()) {
        showError(employeeIfscCode, "IFSC code is required");
        isValid = false;
    }

    // Validate Gender
    if (!employeeGender.value.trim() || !['male', 'female', 'other'].includes(employeeGender.value.toLowerCase())) {
        showError(employeeGender, 'Select a valid gender');
        isValid = false;
    }

    return isValid;
}

// Validate Edit Employee
function validatorEditEmployee() {
    // Clear previous errors
    clearErrors();

    let isValid = true;


    const roles = document.getElementById('update-roles');
const status = document.getElementById('update-status');
const joiningDate = document.getElementById('update-joiningDate');
const employeeName = document.getElementById('update-employee_name');
const personalEmail = document.getElementById('update-personalEmail');
const mobile = document.getElementById('update-mobile');
const DOB = document.getElementById('update-DOB');
const departments = document.getElementById('update-department'); 
const designations = document.getElementById('update-designation');
const employeeGender = document.getElementById('update-employee-gender');
const employeeAddress = document.getElementById('update-employee-address');
const employeeAdhaarCardNumber = document.getElementById('update-employee_addhar_card_number');
// const aadharCardImage = document.getElementById('update-aadharCardImage');
const employeePanCard = document.getElementById('update-employee_pan_card');
// const panCardImage = document.getElementById('update-panCardImage');
const employeePfNumber = document.getElementById('update-employee_pf_number');
// const pfFileImage = document.getElementById('update-pfFileImage');

    const employeeBankName = document.getElementById("update-employee_bank_name")
    const employeeBranchName = document.getElementById("update-employee_branch_name");
    const employeeHolderName = document.getElementById("update-employee_holder_name");
    const employeeAccountType = document.getElementById("update-employee_account_type");
    const employeeAccountNumber = document.getElementById("update-employee_account_number");
    const employeeIfscCode = document.getElementById("update-employee_ifsc_code");

    // Validation logic

    //Validate Roles
    // if (!roles.value.trim()) {
    //     showError(roles, "IFSC code is required");
    //     isValid = false;
    //   }

    //Validate Status  
    if (!status.value.trim()) {
        showError(status, "Status is required");
        isValid = false;
    }

    // Validate Joining Date
    if (!joiningDate.value.trim()) {
        showError(joiningDate, 'Joining date is required');
        isValid = false;
    }

    // Validate Joining Date
    if (!DOB.value.trim()) {
        showError(DOB, 'DOB is required');
        isValid = false;
    }

    //Validate Department

    if (!departments.value.trim()) {
        showError(departments, 'Departments is required');
        isValid = false;
    }
    //Validate Department

    if (!designations.value.trim()) {
        showError(designations, 'Designation is required');
        isValid = false;
    }

    // Validate Employee Name
    if (!employeeName.value.trim() || /\d/.test(employeeName.value)) {
        showError(employeeName, 'Enter a valid name without numbers');
        isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!personalEmail.value.trim() || !emailPattern.test(personalEmail.value)) {
        showError(email, 'Enter a valid email address');
        isValid = false;
    }

    // if (!GST.value.trim() || /\d/.test(gstNumber.value)) {
    //     showError(gstNumber, 'Enter a valid GST numbers');
    //     isValid = false;
    // }

    // Validate Mobile
    const mobileValue = mobile.value.trim();
    if (!mobileValue || mobileValue.length < 10 || mobileValue.length > 13 || !/^\d+$/.test(mobileValue)) {
        showError(mobile, 'Enter a valid phone number');
        isValid = false;
    }

    // Validate Aadhar Number
    const aadharPattern = /^\d{12}$/; // Aadhar number should be exactly 12 digits
    if (!employeeAdhaarCardNumber.value.trim() || !aadharPattern.test(employeeAdhaarCardNumber.value)) {
        showError(employeeAdhaarCardNumber, 'Enter a valid 12-digit Aadhar number');
        isValid = false;
    }

    // Validate PAN Number
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/; // PAN format: 5 letters, 4 digits, 1 letter
    if (!employeePanCard.value.trim() || !panPattern.test(employeePanCard.value)) {
        showError(employeePanCard, 'Enter a valid PAN number');
        isValid = false;
    }

    // Validate Employee Pf Number
    if (!employeePfNumber.value.trim()) {
        showError(employeePfNumber, 'Employee Pf Number is required');
        isValid = false;
    }

    // Validate Address
    if (!employeeAddress.value.trim() || employeeAddress.value.length < 5) {
        showError(employeeAddress, 'Address must be at least 5 characters long');
        isValid = false;
    }

    // Validate Bank Name
    if (!employeeBankName.value.trim()) {
        showError(employeeBankName, "Bank name is required");
        isValid = false;
      } 

    // Validate Branch Name
    if (!employeeBranchName.value.trim()) {
        showError(employeeBranchName, "Branch name is required");
        isValid = false;
    }

    // Validate Employee Holder Name
    if (!employeeHolderName.value.trim()) {
        showError(employeeHolderName, "Holder name is required");
        isValid = false;
    } 

    // Validate employeeAccountType
    if (!employeeAccountType.value.trim()) {
        showError(employeeAccountType, "Account Type is required");
        isValid = false;
    }
      
    //Validate Account Number
    if (!employeeAccountNumber.value.trim()) {
        showError(employeeAccountNumber, "Account number is required");
        isValid = false;
    } else if (!/^\d+$/.test(employeeAccountNumber.value.trim())) {
        showError(employeeAccountNumber, "Account number must be numeric");
        isValid = false;
    }

    // Validate IFSC Code
    if (!employeeIfscCode.value.trim()) {
        showError(employeeIfscCode, "IFSC code is required");
        isValid = false;
    }

    // Validate Gender
    if (!employeeGender.value.trim() || !['male', 'female', 'other'].includes(employeeGender.value.toLowerCase())) {
        showError(employeeGender, 'Select a valid gender');
        isValid = false;
    }

    return isValid;
}

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
// ==================================================================================================
