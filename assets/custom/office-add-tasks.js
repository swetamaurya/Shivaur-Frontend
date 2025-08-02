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

import {status_popup, loading_shimmer, remove_loading_shimmer} from './globalFunctions1.js';
import {office_task_API, user_API, project_API} from './apis.js';

const token = localStorage.getItem('token');
// =======================================================
// =======================================================
// =======================================================

// ===============================================================================================================
const newOption = document.createElement("option");
newOption.value = localStorage.getItem('User_id');
newOption.text = localStorage.getItem('User_name');
const select = document.getElementById("assigned_by_select_option");
select.add(newOption);
select.value = newOption.value;
// ===============================================================================================================

async function dropdownForAddTask(){
  // =========================================================
  const r1 = await fetch(`${project_API}/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });
  const r2 = await r1.json();
  
  const project_select_option = document.getElementById("project_select_option");
  r2?.data.map((e) => {
    let a1 = document.createElement("option");
    a1.value = e?._id || '-';
    a1.text = `${e?.projectName} (${e?.projectId})` || '-' ;
    project_select_option.appendChild(a1);
  });
  // =========================================================
  // =========================================================
  const r3 = await fetch(`${user_API}/data/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });
  const r4 = (await r3.json());

  const dropdownContent_my_shivaur_mohit = document.getElementById("dropdownContent_my_shivaur_mohit");
  r4?.users?.employees.map((e) => {
    let d1 = document.createElement("div");
    d1.innerHTML = `
                    <input type="checkbox" value="${e._id}" class="assignee-checkbox_my_shivaur_m">
                    <label class="checkbox-label_my_shivaur_mohit">${e.name} (${e.userId})</label>`;
    d1.classList.add("checkbox-container_my_shivaur_mohit");
    dropdownContent_my_shivaur_mohit.appendChild(d1);    
  });
  assignee_drop_down_checkbox();
  // =========================================================
}
dropdownForAddTask();
// Task Post API 
const addTaskForm = document.getElementById('add_task_form');
addTaskForm.addEventListener('submit',async(event)=>{
  event.preventDefault();

  if (!validateTaskForm()) {
    return; // Stop form submission if validation fails
  }
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------

  
  let startDate = document.getElementById('startDate').value;
  let complateDate = document.getElementById('complateDate').value;
  let deadlineDate = document.getElementById('deadlineDate').value;
  let status = document.getElementById('status').value;
  let assignedBy = document.getElementById('assigned_by_select_option').value;
  let title = document.getElementById('task-title').value;
  let project = document.getElementById('project_select_option').value;
  let taskDescription = document.getElementById('description').value;

  let formData = new FormData();

  Array.from(document.getElementById("selectedAssignees_my_shivaur_m").children).forEach((e)=>{
    formData.append("assignedTo",e.getAttribute('value'));
  });
  
  let files = document.getElementById('file').files;
  for (const file of files) {
    formData.append("file", file);
  }

  formData.append("startDate", startDate);
  formData.append("complateDate", complateDate);
  formData.append("deadlineDate", deadlineDate);

  formData.append("status", status);
  formData.append("assignedBy", assignedBy);
  formData.append("title", title);
  formData.append("project", project);
  formData.append("taskDescription", taskDescription);

  try {
    const response = await fetch(`${office_task_API}/create-and-assign`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const c1 = (response.ok);
    try{
      status_popup( ((c1) ? "Office Task Created <br> Successfully!" : "Please try <br> again later"), (c1) );
      setTimeout(function(){
        window.location.href = 'office-tasks.html'; 
      },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error){
      status_popup("Please try <br> again later", false);
    }
  } catch (error) {
    console.log(error)
    status_popup("Please try <br> again later", false);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
});


// ==========================================================================================
// ==========================================================================================

function assignee_drop_down_checkbox(){
    
  const dropdownContent_my_shivaur_mohit = document.getElementById("dropdownContent_my_shivaur_mohit");
  const selectedAssignees_my_shivaur_m = document.getElementById("selectedAssignees_my_shivaur_m");
  const checkboxes_my_shivaur_mohit = document.querySelectorAll(".assignee-checkbox_my_shivaur_m");

  // Function to toggle dropdown visibility
  window.toggleDropdown_my_shivaur_mohit = function toggleDropdown_my_shivaur_mohit() {
    dropdownContent_my_shivaur_mohit.classList.toggle("show_my_shivaur_mohit");
  }

  // Close dropdown if clicked outside
  window.addEventListener("click", function (event) {
    if (!event.target.matches('.dropdown-btn_my_shivaur_mohit')) {
      dropdownContent_my_shivaur_mohit.classList.remove("show_my_shivaur_mohit");
    }
  });

  // Function to update selected assignees display
  function updateselectedAssignees_my_shivaur_m() {
    // Clear the display area
    selectedAssignees_my_shivaur_m.innerHTML = "";

    // Loop through each checkbox and add selected ones to display
    checkboxes_my_shivaur_mohit.forEach((checkbox) => {
      if (checkbox.checked) {
        const label = checkbox.nextElementSibling.textContent; // Get the label text
        const tag = document.createElement("span");
        tag.classList.add("tag_my_shivaur_mohit");
        tag.textContent = label; // Display the label text
        tag.setAttribute("value", checkbox.value);
        selectedAssignees_my_shivaur_m.appendChild(tag);
      }
    });
  }

  // Attach event listeners to all checkboxes for selection
  checkboxes_my_shivaur_mohit.forEach((checkbox) => {
    checkbox.addEventListener("change", updateselectedAssignees_my_shivaur_m);
  });
}
// ===============================================================================================
// ===============================================================================================
// ===============================================================================================
// ===============================================================================================
// ===============================================================================================

// Validation function
function validateTaskForm() {
  clearErrors(); // Clear previous error messages

  let isValid = true;

  // Get field elements
  const taskTitle = document.getElementById("task-title");
  const project = document.getElementById("project_select_option");
  const assignees = document.getElementById("dropdownContent_my_shivaur_mohit");
  const assignedBy = document.getElementById("assigned_by_select_option");
  const status = document.getElementById("status");
  const description = document.getElementById("description");

  // Task Title Validation
  if (!taskTitle.value.trim()) {
    showError(taskTitle, "Please enter a valid task title");
    isValid = false;
  }

  // Project Validation
  if (!project.value.trim()) {
    showError(project, "Please select a project");
    isValid = false;
  }

  // Assignee Validation
  if (!isAnyAssigneeSelected()) {
    showError(document.getElementById("just_for_form_validation"), "Please select at least one assignee");
    isValid = false;
  }

  // Assigned By Validation
  if (!assignedBy.value.trim()) {
    showError(assignedBy, "Please select the person who assigned the task");
    isValid = false;
  }

  // Status Validation
  if (!status.value.trim()) {
    showError(status, "Please select a status");
    isValid = false;
  }

  // Description Validation
  if (!description.value.trim()) {
    showError(description, "Please provide a description");
    isValid = false;
  }

  return isValid;
}

// Function to check if any assignee is selected
function isAnyAssigneeSelected() {
  const checkboxes = document.querySelectorAll(
    "#dropdownContent_my_shivaur_mohit input[type='checkbox']"
  );
  return Array.from(checkboxes).some((checkbox) => checkbox.checked);
}

// Function to get selected assignees
function getSelectedAssignees() {
  const checkboxes = document.querySelectorAll(
    "#dropdownContent_my_shivaur_mohit input[type='checkbox']"
  );
  return Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value)
    .join(", ");
}

// Automatically set the start date to today
document.addEventListener("DOMContentLoaded", function () {
  const startDateField = document.getElementById("startDate");
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // Format the date as YYYY-MM-DD
  startDateField.value = formattedDate; // Set the value to today's date
  startDateField.setAttribute("min", formattedDate); // Set the minimum date to today's date
});

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
function clearErrors() {
  const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
  errorMessages.forEach((msg) => msg.remove());
}
