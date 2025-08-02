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
  import {status_popup , loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
   import { lead_API } from './apis.js';
  
  // =================================================================================
  const token = localStorage.getItem('token');
  
  // =========================================================================================
// Fetching the Logged User 

  let username = localStorage.getItem('User_name');
  let userName = document.getElementById("createdBy")
  userName.value = username; 

// =======================================================================================
  // Add event listener for space handling in email input
  document.getElementById("email").addEventListener("keydown", function (event) {
    if (event.key === " ") {
      event.preventDefault();
      if (this.value.trim() !== "") {
        this.value += ", "; // Add a comma and space
      }
    }
  });
  
   document.getElementById("mobile").addEventListener("keydown", function (event) {
    if (event.key === " ") {
      event.preventDefault();
      if (this.value.trim() !== "") {
        this.value += ", "; // Add a comma and space
      }
    }
  });
  
  // Form submission handler
  document.getElementById("add_task_form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    if (!validatorLead()) {
      return;
    }
  
    try {
      loading_shimmer(); // Show loading shimmer
  
      // Extract input values
      const leadName = document.getElementById("leadName").value.trim();
      const email = document.getElementById("email").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
      const department = document.getElementById("department").value.trim();
      const designation = document.getElementById("designation").value.trim();
      const company = document.getElementById("company_organization").value.trim();
      const address = document.getElementById("address").value.trim();
      const date = document.getElementById("date").value.trim();
      const status = document.getElementById("status").value;
      const description = document.getElementById("description").value.trim();
      let createdBy = document.getElementById("createdBy").value.trim()
      let zipCode = document.getElementById("zipCode").value.trim()
  
      // Split emails and mobiles into arrays
      const emailArray = email.split(",").map((email) => email.trim()).filter((email) => email);
      const mobileArray = mobile.split(",").map((mobile) => mobile.trim()).filter((mobile) => mobile);
  
      // Validate required fields
      
  
      // Prepare data object
      const data = {
        leadName,
        email: emailArray,
        mobile: mobileArray,
        department,
        designation,
        company,
        address,
        date,
        status,
        description,
        createdBy,
        zipCode
      };
  
      // Submit data to the server
      const response = await fetch(`${lead_API}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }); 
      const res = await response.json()
      console.log('THIS IS MY DATA: ',res)
  
      // Check if the request was successful
      if (!response.ok) throw new Error("Failed to add lead");
  
      status_popup("Lead Created <br> Successfully!", true);  
      setTimeout(function(){
        window.location.href = 'lead-list.html';
    },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error) {
      console.error("Error adding lead:", error);
      status_popup("Error adding Lead. Please try again.", false);
    } finally {
      remove_loading_shimmer(); // Hide loading shimmer
    }
  });

  // Validate Lead 

  function validatorLead() {
    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Get all field elements
    const leadName = document.getElementById("leadName")
    const email = document.getElementById("email")
    const mobile = document.getElementById('mobile');
    const department = document.getElementById("department")
    const designation = document.getElementById("designation")
    const company = document.getElementById("company_organization")
    const address = document.getElementById('address');
    const date = document.getElementById("date")
    const status = document.getElementById("status")

    const emailArray = email.value.trim().split(",").map((email) => email.trim()).filter((email) => email);
    const mobileArray = mobile.value.trim().split(",").map((mobile) => mobile.trim()).filter((mobile) => mobile);

    // Validation logic
    // Validate Contractor Name
    if (!leadName.value.trim() || /\d/.test(leadName.value)) {
        showError(leadName, 'Enter a valid name without numbers');
        isValid = false;
    }

    if(!email.value){
      showError(email, 'Enter email address');
      isValid = false;
    }
    if(!mobile.value){
      showError(mobile, 'Enter mobile');
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailArray.forEach((emailItem) => {
        if (!emailItem || !emailPattern.test(emailItem)) {
            showError(email, 'Enter a valid email address');
            isValid = false;
        }
    });

    // Validate each mobile in the array
    mobileArray.forEach((mobileItem) => {
        if (!mobileItem || mobileItem.length < 10 || mobileItem.length > 13 || !/^\d+$/.test(mobileItem)) {
            showError(mobile, 'Enter a valid phone number (10 to 13 digits)');
            isValid = false;
        }
    });


    // Validate Department
    if (!department.value.trim() || /\d/.test(department.value)) {
      showError(department, 'Enter a valid name without numbers');
      isValid = false;
    }

    // Validate Designation
    if (!designation.value.trim() || /\d/.test(designation.value)) {
      showError(designation, 'Enter a valid name without numbers');
      isValid = false;
    }

    // Validate Company
    if (!company.value.trim() || /\d/.test(company.value)) {
      showError(company, 'Enter a valid name without numbers');
      isValid = false;
    }

    // Validate Address
    if (!address.value.trim() || address.value.length < 5) {
        showError(address, 'Address must be at least 5 characters long');
        isValid = false;
    }

    // Validate Date
    if (!date.value.trim()) {
      showError(date, 'Joining date is required');
      isValid = false;
    }
    if (!status.value.trim()) {
      showError(status, 'Please select a status');
      isValid = false;
    } 

    return isValid;
}
  
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