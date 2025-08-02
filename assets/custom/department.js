// Ensure token is set and redirect if not found
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
import { capitalizeFirstLetter } from './globalFunctions2.js'
import { departments_API,global_search_API } from './apis.js';
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
    const searchFields = ["departments"]; // IDs of input fields
    const searchType = "Department"; // Type to pass to the backend
    const tableData = document.getElementById("departmentData");
    let tableContent = ''; // Initialize table content
  
    try {
      // Show loading shimmer
      loading_shimmer();
  
      // Construct query parameters for the search
      const queryParams = new URLSearchParams({ type: searchType });
      searchFields.forEach((field) => {
        const value = document.getElementById(field)?.value;
        if (value) queryParams.append(field, value);
      });
  
      // Fetch search results
      const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const res = await response.json();
  
      if (response.ok && res.data?.length > 0) {
        // If search results exist, render them in the table
        const departments = res.data;
  
        departments.forEach((department) => {
          tableContent += `
            <tr data-id="${department._id}">
              <td><input type="checkbox" class="checkbox_child" value="${department._id || '-'}"></td>
              <td>${capitalizeFirstLetter(department?.departments) || '-'}</td>
              <td>
                <div class="dropdown dropdown-action">
                  <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="material-icons">more_vert</i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item" onclick="handleClickOnEditDepartment('${department._id}')" data-bs-toggle="modal" data-bs-target="#edit_department">
                      <i class="fa-solid fa-pencil m-r-5"></i> Edit
                    </a>
                    <a class="dropdown-item" onclick="individual_delete('${department._id}')" data-bs-toggle="modal" data-bs-target="#delete_department">
                      <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          `;
        });
      } else {
        // No results found
        tableContent = `
          <tr>
            <td colspan="8" class="text-center">
              <i class="fa-solid fa-times"></i> No results found
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error("Error during search:", error);
      // Handle errors gracefully
      tableContent = `
        <tr>
          <td colspan="8" class="text-center">
            <i class="fa-solid fa-times"></i> An error occurred during search
          </td>
        </tr>
      `;
    } finally {
      // Update the table with results or error message
      tableData.innerHTML = tableContent;
      checkbox_function(); // Reinitialize checkboxes
      remove_loading_shimmer(); // Remove loading shimmer
    }
  }
  


// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});

let res = [];

 // Load Department List
async function all_data_load_dashboard() {
    try {
        try{
            loading_shimmer();
        } catch(error){console.log(error)}
        // -----------------------------------------------------------------------------------

        // Fetch departments data
        const table = document.getElementById('departmentData');
        table.innerHTML = ''; // Clear previous data
        let rows = [];

        const response = await fetch(`${departments_API}/get${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let r2 = await response.json(); // Fetch and parse department data

        res = r2.data;
        console.log("Department Data:", res); // Log fetched data

        setTotalDataCount(r2?.totalDepartments);

        console.log(res)

        if(res.length>0){
            res.forEach(department => {
                rows.push(`
                    <tr data-id="${department._id}">
                        <td><input type="checkbox" class="checkbox_child" value="${department._id || '-'}"></td>
                        <td>${capitalizeFirstLetter(department?.departments) || '-'}</td>
                        <td>
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="material-icons">more_vert</i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditdepartment('${department._id}')" data-bs-toggle="modal" data-bs-target="#edit_department">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                    <a class="dropdown-item" onclick="individual_delete('${department._id}')" data-bs-toggle="modal" data-bs-target="#delete_department">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>
                `);
            });

            // Add the rows to the table
            table.innerHTML = rows.join('');
            checkbox_function(); // Apply checkbox functionality
        } else {
            rows = `
                <tr>
                    <td  colspan="3" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
                </tr>`;
    
            table.innerHTML = rows;
        }

    } catch (error) {
        console.error("Error loading departments:", error);
        status_popup("Failed to load departments", false);
    } 
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
}

// Department addition logic
const add_department = document.getElementById('add_department_from');
 
    add_department.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        try{
            loading_shimmer();
            document.querySelectorAll(".btn-close").forEach(e => e.click());
        } catch(error){console.log(error)}
        // -----------------------------------------------------------------------------------
        

        const departments = document.getElementById('departments_name').value;
        // console.log("bror alksj as;:::: - ", departments)
        const response = await fetch(`${departments_API}/post`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ departments })
        });

        const success = response.ok;
        status_popup(success ? "Department Added <br> Successfully!" : "Please try again later", success);
        if (success) {
            all_data_load_dashboard(); // Reload departments after addition
            add_department.reset();
          }
    } catch (error) {
        console.error('Error adding Department:', error);
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

// Show department data in edit modal by _id
window.handleClickOnEditdepartment = function (_id) {
    const department = res.find(dept => dept._id === _id);
    if (department) {
        document.getElementById('editdepartment').value = department.departments || '';

        const editForm = document.getElementById('edit_department_form');
 
        editForm.onsubmit = null;

        // Attach new event listener for form submission
        editForm.onsubmit = async function(event) {
            event.preventDefault();
            try {
                try{
                    Array.from(document.querySelectorAll(".btn-close")).forEach(e => e.click());
                    loading_shimmer();
                } catch(error){console.log(error)}
                // -----------------------------------------------------------------------------------

                const departments = document.getElementById('editdepartment').value;
                const response = await fetch(`${departments_API}/update`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ departments, _id })
                });

                const success = response.ok;
                status_popup(success ? "Department Updated Successfully!" : "Failed to update department", success);
                if (success) {
                    editForm.reset(); // Reset edit form fields
                    await all_data_load_dashboard(); // Reload department list
                }
            } catch (error) {
                console.error("Error updating department:", error);
                status_popup("Failed to update department", false);
            }
            // ----------------------------------------------------------------------------------------------------
            try{
                remove_loading_shimmer();
            } catch(error){console.log(error)}
        };
    } else {
        console.error("Edit department form element not found");
    }
}


window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);
