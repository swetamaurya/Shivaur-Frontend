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
import { departments_API, desginations_API ,global_search_API } from './apis.js';
// -------------------------------------------------------------------------
import { individual_delete, objects_data_handler_function } from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';

// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================

async function handleSearch() {
    const searchFields = ["designations"]; // IDs of input fields
    const searchType = "designation"; // Type to pass to the backend
    const tableData = document.getElementById("designationsData");
    let tableContent = ''; // Initialize table content

    try {
        // Show loading shimmer
        loading_shimmer();
      
          // Fetch department data and populate dropdowns
          await fetchDepartmentsData();
          populateDepartmentDropdown();
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

        if (res.data?.length > 0) {
            // Results found
            const rows = res.data.map((e) => {
                const departmentName = e.departments ? e.departments.departments : '-';
                return `
                    <tr data-id="${e._id}">
                        <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                        <td>${capitalizeFirstLetter(e.designations)}</td>
                        <td>${capitalizeFirstLetter(departmentName)}</td>
                        <td>
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditdesignations('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_designations"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                    <a class="dropdown-item" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_designations"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tableContent = rows.join(''); // Update tableContent with rows
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
        tableData.innerHTML = tableContent; // Correctly update the table content
        checkbox_function(); // Reinitialize checkboxes
        remove_loading_shimmer(); // Remove loading shimmer
    }
}

  


// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});



let cachedDepartments = [];
let res = [];

// Fetch Department Data
async function fetchDepartmentsData() {
    if (cachedDepartments.length === 0) {
        try {
            const departmentResponse = await fetch(`${departments_API}/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            let r2 = await departmentResponse.json();
            cachedDepartments = r2?.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }
}

// Populate Department Dropdowns
function populateDepartmentDropdown(selectedDepartmentId = '') {
    const addDeptSelectOption = document.getElementById("departments");
    const editDeptSelectOption = document.getElementById("editdepartments");

    if (!addDeptSelectOption || !editDeptSelectOption) {
        console.error("Department dropdown elements not found.");
        return;
    }

    addDeptSelectOption.innerHTML = `<option value="" disabled selected>Select Department</option>`;
    editDeptSelectOption.innerHTML = `<option value="" disabled selected>Select Department</option>`;

    cachedDepartments.forEach(department => {
        const option = document.createElement("option");
        option.value = department._id;
        option.textContent = department.departments;
        addDeptSelectOption.appendChild(option);
        
        const editOption = option.cloneNode(true);
        if (selectedDepartmentId && department._id === selectedDepartmentId) {
            editOption.selected = true;
        }
        editDeptSelectOption.appendChild(editOption);
    });
}

// Load Designation List
async function all_data_load_dashboard() {
    try {
        try{
            loading_shimmer();
            await fetchDepartmentsData();
            populateDepartmentDropdown();
        } catch(error){console.log(error)}
        // -----------------------------------------------------------------------------------
        const table = document.getElementById('designationsData');
        table.innerHTML = ''; // Clear table content
        let rows = [];

        const response = await fetch(`${desginations_API}/get${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let r2 = await response.json();

        res = r2?.data;
        setTotalDataCount(r2?.totalDesignations);
        console.log("Designation Data:", res);

        if(res.length>0){
            res.forEach((e) => {
                const departmentName = e.departments ? e.departments.departments : '-';
                rows.push(`
                    <tr data-id="${e._id}">
                        <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                        <td>${capitalizeFirstLetter(e.designations)}</td>
                        <td>${capitalizeFirstLetter(departmentName)}</td>
                        <td>
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditdesignations('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_designations"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                    <a class="dropdown-item" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_designations"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                `);
            });

            table.innerHTML = rows.join('');
            checkbox_function();
        } else {
            rows = `
                <tr>
                    <td  colspan="4" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
                </tr>`;

            table.innerHTML = rows;
        }

    } catch (error) {
        console.error("Error loading designations:", error);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
}
const add_designation = document.getElementById('add_designation_form');
add_designation.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        try{
            loading_shimmer();
            Array.from(document.querySelectorAll(".btn-close")).forEach(e => e.click());
        } catch(error){console.log(error)}
        // -----------------------------------------------------------------------------------

        const designations = document.getElementById('designations_name').value;
        const departments = document.getElementById('departments').value;


        // console.log("broo : ",designations)

     
        const response = await fetch(`${desginations_API}/post`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ designations, departments })
        });

        const success = response.ok;
        status_popup(success ? "Designation Added Successfully!" : "Please try again later", success);

        if (success) {
            all_data_load_dashboard();
            add_designation.reset();

        }
    } catch (error) {
        console.error('Error adding Designation:', error);
        status_popup("Please try again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

// Show designation data in edit modal
window.handleClickOnEditdesignations = async function (_id) {
    const designation = res.find(item => item._id === _id);
    if (!designation) {
        console.error("Designation not found for ID:", _id);
        return;
    }

    await fetchDepartmentsData(); // Fetch department data
    populateDepartmentDropdown(designation.departments ? designation.departments._id : ''); // Populate dropdown and set selected department

    document.getElementById('editdesignations').value = designation.designations || '';

    // Set up form submission for the update
    const editForm = document.getElementById('edit_designations'); // Ensure this ID matches your HTML
    editForm.onsubmit = null; // Remove any existing submission handlers

    // Attach new event listener for form submission
    editForm.onsubmit = async function(event) {
        event.preventDefault();

        try {
            try{
                loading_shimmer();
                Array.from(document.querySelectorAll(".btn-close")).forEach(e => e.click());
            } catch(error){console.log(error)}
            // -----------------------------------------------------------------------------------
    

            const updateData = {
                designations: document.getElementById('editdesignations').value,
                departments: document.getElementById('editdepartments').value
            };

            const response = await fetch(`${desginations_API}/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id, ...updateData })
            });

            const success = response.ok;
            status_popup(success ? "Designations Updated Successfully!" : "Failed to update designation", success);

            if (success) {
                await all_data_load_dashboard(); // Reload designations list
            }

        } catch (error) {
            console.error("Error updating Designations:", error);
            status_popup("Failed to update Designations", false);
        } 
        // ----------------------------------------------------------------------------------------------------
        try{
            remove_loading_shimmer();
        } catch(error){console.log(error)}
    };
};

window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);
