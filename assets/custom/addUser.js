

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

// Import required functions and APIs
import { loading_shimmer,status_popup , remove_loading_shimmer } from "./globalFunctions1.js";
 import {user_API ,departments_API,desginations_API } from './apis.js';

// Function to populate dropdowns for Department and Designation
async function populateDropdowns() {
  try {
    loading_shimmer(); // Show shimmer while data loads

    // Fetch and populate Departments
    const departmentResponse = await fetch(`${departments_API}/get`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!departmentResponse.ok) throw new Error('Failed to fetch departments');

    const departmentData = await departmentResponse.json();
    const departmentDropdown = document.getElementById('department');
    departmentDropdown.innerHTML = '<option value="" disabled selected>Select Department</option>';

    departmentData.data.forEach((dept) => {
      const option = document.createElement('option');
      option.value = dept._id;
      option.textContent = dept.departments; // Use correct property name from API
      departmentDropdown.appendChild(option);
    });

    // Fetch and populate Designations
    const designationResponse = await fetch(`${desginations_API}/get`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!designationResponse.ok) throw new Error('Failed to fetch designations');

    const designationData = await designationResponse.json();
    const designationDropdown = document.getElementById('designation');
    designationDropdown.innerHTML = '<option value="" disabled selected>Select Designation</option>';

    designationData.data.forEach((des) => {
      const option = document.createElement('option');
      option.value = des._id;
      option.textContent = des.designations; // Use correct property name from API
      designationDropdown.appendChild(option);
    });

    status_popup("Dropdowns loaded Successfully!", true); // Show success message
  } catch (error) {
    console.error('Error populating dropdowns:', error);
    status_popup("Failed to load dropdowns. Please try again.", false); // Show error message
  } finally {
    remove_loading_shimmer(); // Hide shimmer after loading completes
  }
}

// Function to handle Add User form submission
document.getElementById('add_user').addEventListener('submit', async function (event) {
  event.preventDefault();

  const submitButton = document.querySelector("button[type='submit']");
  submitButton.disabled = true; // Disable the submit button to prevent multiple submissions

  // Gather form data
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    mobile: document.getElementById('mobile').value,
    status: document.getElementById('status').value,
    roles: document.getElementById('roles').value,
    contactName: document.getElementById('contactName').value,
    address: document.getElementById('address').value,
    joiningDate: document.getElementById('joiningDate').value,
    DOB: document.getElementById('DOB').value,
    departments: document.getElementById('department').value,
    designations: document.getElementById('designation').value,
  };

  try {
    loading_shimmer(); // Show shimmer while processing the submission

    // Send POST request to add a user
    const response = await fetch(`${user_API}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error('Failed to add user');

    // Success message and redirection
    status_popup("User Created <br> Successfully!", true);
    window.location.href = 'employees-list.html';
  } catch (error) {
    console.error('Error adding user:', error);
    status_popup("Error adding user. Please try again.", false);
  } finally {
    submitButton.disabled = false; // Re-enable the submit button
    remove_loading_shimmer(); // Hide shimmer after processing completes
  }
});

// Load dropdowns on page load
if (window.location.pathname.toLowerCase().includes('adduser')) {
  populateDropdowns(); // Populate dropdowns for Department and Designation
}
