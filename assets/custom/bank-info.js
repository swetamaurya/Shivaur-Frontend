
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
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { user_API } from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================
window.onload = async () => {
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  try {
    const response = await fetch(`${user_API}/data/get`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const res = await response.json();

    // Populate the employee dropdown
    const empSelectOption = document.getElementById("employeeSelect");
    if (empSelectOption) { // Check if the element exists
      res.users.employees.forEach((e) => {
        let option = document.createElement("option");
        option.value = e._id;
        option.textContent = `${e.name} (${e?.userId})`;
        option.dataset.email = e.email; // Store email in data attribute
        empSelectOption.appendChild(option);
      });

      // Auto-fill email on employee selection
      empSelectOption.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        const emailInput = document.getElementById('email');
        if (emailInput) { // Check if email input exists
          emailInput.value = selectedOption.dataset.email || '';
        }
      });
    } else {
      console.error("Employee select dropdown (employeeSelect) not found in the DOM.");
    }

  } catch (error) {
    window.location.href = 'bank-list.html'; 
  }
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}
};

// Handle form submission for adding bank details
document.getElementById('submitBankDetails')?.addEventListener('click', async (event) => {
  event.preventDefault();

  if (!validateBankDetailsForm()) {
    return; // Stop form submission if validation fails
  }

  
  // Show loading shimmer if the function is available
  try {
    loading_shimmer();
  } catch (error) {
    console.log("Error in loading shimmer:", error);
  }

  const selectedEmployeeId = document.getElementById("employeeSelect")?.value;

  // Define bank details from form inputs
  const bankDetails = {
    bankName: document.getElementById('bankName')?.value.trim(),
    accountNumber: document.getElementById('accountNumber')?.value.trim(),
    IFSCCode: document.getElementById('IFSCCode')?.value.trim(),
    accountType: document.getElementById('accountType')?.value,
    accountHolder: document.getElementById('holderName')?.value.trim(),
    PANNumber: document.getElementById('uppercaseInput')?.value.trim(),
    branchName: document.getElementById("branchName")?.value?.trim()
  };

  try {
    const response = await fetch(`${user_API}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ "_id": selectedEmployeeId, bankDetails })
    });

    const success = response.ok;
    status_popup(success ? "Bank Information Updated <br> Successfully!" : "Please try <br> again later", success);
    if (success) {
      setTimeout(() => {
        window.location.href = 'bank-list.html'; // Adjust this path if needed
      }, Number(document.getElementById("b1b1").innerText) * 1000);
    }
  } catch (error) {
    console.error('Error updating bank details:', error);
    status_popup("Please try <br> again later", false);
  }
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.log("Error in removing loading shimmer:", error);
  }
});

// =======================================================================================
// =======================================================================================
// =======================================================================================
// =======================================================================================

// Validation Function
function validateBankDetailsForm() {
  clearErrors(); // Clear previous error messages

  let isValid = true;

  // Get all form elements
  const employeeSelect = document.getElementById("employeeSelect");
  const email = document.getElementById("email");
  const bankName = document.getElementById("bankName");
  const accountNumber = document.getElementById("accountNumber");
  const ifscCode = document.getElementById("IFSCCode");
  const branchName = document.getElementById("branchName");
  const accountType = document.getElementById("accountType");
  const panNumber = document.getElementById("uppercaseInput");
  const holderName = document.getElementById("holderName");

  // Employee Select Validation
  if (!employeeSelect.value.trim()) {
    showError(employeeSelect, "Please select an employee");
    isValid = false;
  }

  // Email Validation
  if (!email.value.trim()) {
    showError(email, "Email is required");
    isValid = false;
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())) {
    showError(email, "Enter a valid email");
    isValid = false;
  }

  // Bank Name Validation
  if (!bankName.value.trim()) {
    showError(bankName, "Bank name is required");
    isValid = false;
  }

  // Account Number Validation
  if (!accountNumber.value.trim()) {
    showError(accountNumber, "Account number is required");
    isValid = false;
  } else if (!/^\d+$/.test(accountNumber.value.trim())) {
    showError(accountNumber, "Account number must be numeric");
    isValid = false;
  }

  // IFSC Code Validation
  if (!ifscCode.value.trim()) {
    showError(ifscCode, "IFSC code is required");
    isValid = false;
  }

  // Branch Name Validation
  if (!branchName.value.trim()) {
    showError(branchName, "Branch name is required");
    isValid = false;
  }

  // Account Type Validation
  if (!accountType.value.trim()) {
    showError(accountType, "Please select an account type");
    isValid = false;
  }

  // PAN Number Validation
  const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/; // PAN format: 5 letters, 4 digits, 1 letter
  if (!panNumber.value.trim() || !panPattern.test(panNumber.value)) {
    showError(panNumber, "PAN number is not valid");
    isValid = false;
  }

  // Account Holder Name Validation
  if (!holderName.value.trim()) {
    showError(holderName, "Account holder name is required");
    isValid = false;
  } else if (/\d/.test(holderName.value.trim())) {
    showError(holderName, "Name cannot contain numbers");
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
