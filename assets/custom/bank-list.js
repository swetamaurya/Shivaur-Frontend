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
import { user_API , global_search_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';

import {} from "./globalFunctionsExport.js";
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================
 
async function handleSearch() {
  const searchFields = ["name"]; // IDs of input fields
  const searchType = "user"; // Type to pass to the backend
  const bankDataTable = document.getElementById("bankData");

  try {
      loading_shimmer();

      // Construct query parameters
      const queryParams = new URLSearchParams({ type: searchType });
      searchFields.forEach((field) => {
          const value = document.getElementById(field)?.value;
          if (value) queryParams.append(field, value);
      });

      console.log("Query Parameters:", queryParams.toString());

      // Fetch search results
      const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log("Fetched bank details:", res);

      const employeesData = res?.data;

      if (employeesData?.length > 0) {
          const rows = employeesData.map((employee) => {
              return `
                  <tr data-id="${employee?._id || '-'}">
                    <td><input type="checkbox" class="checkbox_child" value="${employee?._id || '-'}"></td>
                    <td>${employee?.name || '-'} (${employee?.userId || '-'})</td>
                    <td>${employee?.bankDetails?.bankName || '-'}</td>
                    <td>${employee?.bankDetails?.accountNumber || '-'}</td>
                    <td>${employee?.bankDetails?.IFSCCode || '-'}</td>
                    <td>${employee?.bankDetails?.accountType || '-'}</td>
                    <td>${employee?.bankDetails?.PANNumber || '-'}</td>
                    <td class="text-end">
                      <div class="dropdown dropdown-action">
                        <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="material-icons">more_vert</i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item" onclick="handleEditBankDetails('${employee?._id}')" data-bs-toggle="modal" data-bs-target="#edit_bank"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                          <a class="dropdown-item" onclick="individual_delete('${employee?._id}')" data-bs-toggle="modal" data-bs-target="#delete_bank"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                        </div>
                      </div>
                    </td>
                  </tr>`;
          });
          bankDataTable.innerHTML = rows.join('');
          checkbox_function();
      } else {
          bankDataTable.innerHTML = `
              <tr>
                  <td colspan="8" class="text-center"><i class="fa-solid fa-times"></i>No Data Found</td>
              </tr>`;
      }
  } catch (error) {
      console.error("Error during search:", error);
      status_popup("Error loading data. Please try again.", false);
  } finally {
      remove_loading_shimmer();
  }
}

// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Search button clicked");
  handleSearch(); // Trigger search
});

















let employeesData = []; // Store the employee data globally
 
 
// Function to load all data for the dashboard
async function all_data_load_dashboard() {
  try {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------

    const bankDataTable = document.getElementById("bankData");
    bankDataTable.innerHTML = ''; // Clear table data

  // Fetch employees' bank details on page load
  const response = await fetch(`${user_API}/data/get${rtnPaginationParameters()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  console.log("Fetched bank details:", res);
  setTotalDataCount(res?.totalEmployees);

  employeesData = res?.users?.employees;

  console.log(employeesData)

    if(employeesData.length>0){
      const rows = employeesData.map((employee) => {
        return `
          <tr data-id="${employee?._id || '-'}">
            <td><input type="checkbox" class="checkbox_child" value="${employee?._id || '-'}"></td>
            <td>${employee?.name || '-'} (${employee?.userId || '-'})</td>
            <td>${employee?.bankDetails?.bankName || '-'}</td>
            <td>${employee?.bankDetails?.accountNumber || '-'}</td>
            <td>${employee?.bankDetails?.IFSCCode || '-'}</td>
            <td>${employee?.bankDetails?.accountType || '-'}</td>
            <td>${employee?.bankDetails?.PANNumber || '-'}</td>
            <td class="text-end">
              <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="material-icons">more_vert</i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a class="dropdown-item" onclick="handleEditBankDetails('${employee?._id}')" data-bs-toggle="modal" data-bs-target="#edit_bank"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                  <a class="dropdown-item" onclick="individual_delete('${employee?._id}')" data-bs-toggle="modal" data-bs-target="#delete_bank"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                </div>
              </div>
            </td>
          </tr>`
      });
      bankDataTable.innerHTML = rows.join('');
      checkbox_function();
    } else {
      let rows = `
          <tr>
              <td  colspan="8" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
          </tr>`;

      bankDataTable.innerHTML = rows;
    }
  } catch (error) {
    status_popup("Error loading data. Please try again.", false);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
}
  
// Function to handle edit action
window.handleEditBankDetails = async function(_id) {
  
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------

  const employee = employeesData.find((emp) => emp._id === _id);

  // Populate the modal fields with existing data
  document.getElementById("editBankName").value = employee?.bankDetails?.bankName || '';
  document.getElementById("editAccountNumber").value = employee?.bankDetails?.accountNumber || '';
  document.getElementById("editIFSCCode").value = employee?.bankDetails?.IFSCCode || '';
  document.getElementById("editAccountType").value = employee?.bankDetails?.accountType || '';
  document.getElementById("editPANNumber").value = employee?.bankDetails?.PANNumber || '';
  document.getElementById("editholderName").value = employee?.bankDetails?.accountHolder || '';

  const editForm = document.getElementById("edit_bank");

  
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}

  // Remove any existing submit event listeners to prevent duplicate calls
  editForm.onsubmit = null;
 
  // Attach new event listener for form submission
  editForm.onsubmit = async function(event) {
    event.preventDefault();
    // console.log("brother th is sis demo")
    if (!validateBankForm()) {
      return; // Stop form submission if validation fails
    }

    try {
      try{
          loading_shimmer();
      } catch(error){console.log(error)}
      try{
          Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
      } catch(error){console.log(error)}
      // ----------------------------------------------------------------------------------  
      const bankDetails = {
        bankName : document.getElementById("editBankName").value.trim(),
        accountNumber: document.getElementById("editAccountNumber").value.trim(),
        IFSCCode: document.getElementById("editIFSCCode").value.trim(),
        accountType: document.getElementById("editAccountType").value.trim(),
        PANNumber: document.getElementById("editPANNumber").value.trim(),
        accountHolder: document.getElementById("editholderName").value.trim(),
      };
      const response = await fetch(`${user_API}/update-bank-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id, bankDetails }),
      });
      const success = response.ok;
      status_popup(success ? "Bank Information Updated <br> Successfully!" : "Please try <br> again later", success);

      if (success) {
        await all_data_load_dashboard(); // Reload dashboard to reflect changes
      }
  
    } catch (error) {
      console.error("Error updating bank details:", error);
      status_popup("An error occurred while <br> updating the bank details", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
  }
};
 
window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);
// ==============================================================================
// ==============================================================================
// ==============================================================================
// ==============================================================================
// ==============================================================================

// Validation function
function validateBankForm() {
  clearErrors(); // Clear previous error messages

  let isValid = true;

  const bankName = document.getElementById("editBankName");
  const accountNumber = document.getElementById("editAccountNumber");
  const ifscCode = document.getElementById("editIFSCCode");
  const accountType = document.getElementById("editAccountType");
  const panNumber = document.getElementById("editPANNumber");
  const accountHolderName = document.getElementById("editholderName");

  // Bank Name Validation
  if (!bankName.value.trim()) {
    showError(bankName, "Bank Name is required");
    isValid = false;
  }

  // Account Number Validation
  if (!accountNumber.value.trim()) {
    showError(accountNumber, "Account Number is required");
    isValid = false;
  }

  // IFSC Code Validation
  if (!ifscCode.value.trim()) {
    showError(ifscCode, "IFSC Code is required");
    isValid = false;
  }

  // Account Type Validation
  if (!accountType.value.trim()) {
    showError(accountType, "Account Type is required");
    isValid = false;
  }

  // PAN Number Validation
  if (!panNumber.value.trim()) {
    showError(panNumber, "PAN Number is required");
    isValid = false;
  }

  // Account Holder Name Validation
  if (!accountHolderName.value.trim()) {
    showError(accountHolderName, "Account Holder Name is required");
    isValid = false;
  }

  return isValid;
}
// --------------------------------------------------------------------------------------------------
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
