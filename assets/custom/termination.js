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
import { user_API, termination_API, global_search_API, } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';

// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================

async function handleSearch() {
    const searchFields = ["employee.name"]; // Fields to search
    const searchType = "termination"; // Type to pass to the backend
    const tableData = document.getElementById("termination-table-body");
    let rows = '';

    try {
        loading_shimmer();

        // Construct query parameters for the search
        const queryParams = new URLSearchParams({ type: searchType });
        searchFields.forEach((field) => {
            const value = document.getElementById(field)?.value;
            console.log(`Field: ${field}, Value: ${value}`); // Debug log
            if (value) {
                queryParams.append(field, value);
            }
        });

        console.log("Query Parameters:", queryParams.toString()); // Debug log

        // Fetch search results
        const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const res = await response.json();
        console.log("Search Results:", res); // Debug log

        if (res.data?.length > 0) {
            res.data.forEach((e) => {
                const employeeName = e.employee ? e.employee.name : '-';
                const terminationType = e.terminationType || '-';
                const reason = e.reason || '-';
                const terminationDate = e.terminationDate
                    ? new Date(e.terminationDate).toLocaleDateString()
                    : '-';

                rows += `
                    <tr data-id="${e._id}">
                        <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                        <td>${employeeName}</td>
                        <td>${capitalizeFirstLetter(terminationType)}</td>
                        <td>${terminationDate}</td>
                        <td>${reason}</td>
                        <td>
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="material-icons">more_vert</i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditTermination('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_termination">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                    <a class="dropdown-item" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_termination">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            });
        } else {
            // If no data is found, show a placeholder message
            rows = `
                <tr>
                    <td colspan="6" class="text-center">No results found</td>
                </tr>`;
        }

        tableData.innerHTML = rows; // Update table content
        checkbox_function(); // Reinitialize checkbox functionality
    } catch (error) {
        console.error("Error during search:", error);
        // Display an error message in the table
        tableData.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">An error occurred while loading data</td>
            </tr>`;
    } finally {
        remove_loading_shimmer(); // Remove the loading shimmer
    }
}



// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});


// Caching employees and departments to avoid redundant API calls
let cachedEmployee = [];
let res =[]

// Fetch Employee and Department Data
async function fetchEmployeeAndDepartments() {
    if (cachedEmployee.length === 0) {
        try {
            const EmployeeResponse = await fetch(`${user_API}/data/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const res = await EmployeeResponse.json();
            cachedEmployee = res.users.employees || []; // Use fallback to empty array
        } catch (error) {
            console.error('Error fetching Employee:', error);
        }
    }
}

// Populate Dropdowns for Add/Edit Forms
function populateEmployeeDropdown() {
    const addEmpSelectOption = document.getElementById("add_employee");
    const editEmpSelectOption = document.getElementById("edit_employee");

    if (!addEmpSelectOption || !editEmpSelectOption) {
        console.error("Employee dropdown elements not found.");
        return;
    }

    addEmpSelectOption.innerHTML = `<option value="" disabled selected>Select Employee</option>`;
    editEmpSelectOption.innerHTML = `<option value="" disabled selected>Select Employee</option>`;

    cachedEmployee.forEach(employee => {
        const option = document.createElement("option");
        option.value = employee._id;
        option.textContent = `${employee.name} (${employee?.userId})`;
        addEmpSelectOption.appendChild(option);
        editEmpSelectOption.appendChild(option.cloneNode(true)); // Clone for edit dropdown
    });
}

// Load Termination Data
async function all_data_load_dashboard() {
    try {
        loading_shimmer();
        await fetchEmployeeAndDepartments();

        populateEmployeeDropdown();

        const table = document.getElementById('termination-table-body');
        table.innerHTML = ''; // Clear previous data
        let rows = [];

        const response = await fetch(`${termination_API}/getAll${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let r2 = await response.json(); // Populate global res array with termination data\
        res = r2?.data;
        setTotalDataCount(r2?.totalTerminations)
        console.log("Termination Data Loaded in `res`:", res); // Log `res` to check data

        res.forEach(e => {
            const employeeName = e.employee ? e.employee.name : '-';
            const terminationType = e.TerminationType || '-';
            const reason = e.reason || '-';

            rows.push(`<tr data-id="${e._id}">
                <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                <td>${employeeName}</td>
                <td>${e.email}</td>
                <td>${capitalizeFirstLetter(terminationType)}</td>
                <td>${formatDate(e.terminationDate)}</td>
                <td>${reason}</td>
                <td>
                    <div class="dropdown dropdown-action">
                        <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="material-icons">more_vert</i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right">
                            <a class="dropdown-item" onclick="handleClickOnEdittermination('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_termination">
                                <i class="fa-solid fa-pencil m-r-5"></i> Edit
                            </a>
                            <a class="dropdown-item" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_termination">
                                <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                            </a>
                        </div>
                    </div>
                </td>
            </tr>`);
        });

        table.innerHTML = rows.join('');
        checkbox_function();

    } catch (error) {
        console.error("Error loading terminations:", error);
    } finally {
        remove_loading_shimmer();
    }
}

// Load all data on page load
window.onload = all_data_load_dashboard;

// add Email in the add and edit form 

const employeeName = document.getElementById('add_employee'); 
const addTermination = document.getElementById('add_termination')
addTermination.addEventListener('click',()=>{
    if (employeeName) {
        employeeName.addEventListener('change', () => { 
            let terminationEmployeeEmail = document.getElementById('terminationEmployeeEmail')
            // console.log('This is my Add Event Listener result: ', cachedEmployee);
            for (const e of cachedEmployee){
                if(employeeName.value == e._id){
                terminationEmployeeEmail.value = e.email
                break;
                }
                else{
                    console.log('email not found')
                }
            }
        });
    } else {
        console.error('Element with ID "add_employee" not found');
    }
})


// Add Termination
document.getElementById('add-termination-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    try {
        Array.from(document.querySelectorAll(".btn-close")).forEach(e => e.click());
        loading_shimmer();

        const employee = document.getElementById('add_employee').value;
        const email = document.getElementById('terminationEmployeeEmail').value;
        const TerminationType = document.getElementById('TerminationType').value;
        const terminationDate = document.getElementById('add_terminationDate').value;
        const reason = document.getElementById('add_reason').value;

        // document.getElementById('add-termination-form').reset(); // Clear form fields

        const response = await fetch(`${termination_API}/post`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ employee, TerminationType, terminationDate, reason ,email })
        });

        const success = response.ok;
        status_popup(success ? "Termination Created <br> Successfully!" : "Please try again later", success);
        if (success) 
            all_data_load_dashboard();
    } catch (error) {
        console.error('Error adding Termination:', error);
        status_popup("Please try again later", false);
    } finally {
        remove_loading_shimmer();
    }
});


let editId;
// Edit Termination
window.handleClickOnEdittermination = async function (_id) {
    const termination = res.find(item => item._id === _id);
    if (!termination) {
        console.error("Termination data not found for ID:", _id);
        return;
    }

    await fetchEmployeeAndDepartments();
    populateEmployeeDropdown();
    editId = _id;

    document.getElementById("edit_employee").value = termination.employee?._id || '';
    // document.getElementById("edit_departments").value = termination.department?._id || '';
    document.getElementById("edit_TerminationType").value = termination.TerminationType || '';
    document.getElementById("edit_terminationDate").value = termination.terminationDate ? new Date(termination.terminationDate).toISOString().split('T')[0] : '';
    document.getElementById("edit_reason").value = termination.reason || '';
    let employeeName = document.getElementById("edit_employee").value;

    if (employeeName) {
            let terminationEmployeeEmail = document.getElementById('editTerminationEmployeeEmail')
            // console.log('This is my Add Event Listener result: ', cachedEmployee);
            for (const e of cachedEmployee){
                if(employeeName == e._id){
                    terminationEmployeeEmail.value = e.email
                break;
                }
                else{
                    console.log('email not found')
                }
            }
    } else {
        console.error('Element with ID "add_employee" not found');
    }
};

const editEmployee = document.getElementById('edit_employee')
editEmployee.addEventListener('change',()=>{
    let editEmployeeName = document.getElementById("edit_employee").value;

    if (editEmployeeName) {
            let terminationEmployeeEmail = document.getElementById('editTerminationEmployeeEmail')
            // console.log('This is my Add Event Listener result: ', cachedEmployee);
            for (const e of cachedEmployee){
                if(editEmployeeName == e._id){
                    terminationEmployeeEmail.value = e.email
                break;
                }
                else{
                    console.log('email not found')
                }
            }
    } else {
        console.error('Element with ID "add_employee" not found');
    }
})

const editForm = document.getElementById("edit-termination");

    // Remove any existing submit event listeners to prevent duplicate calls
    editForm.onsubmit = null;

    // Attach new event listener for form submission
    editForm.onsubmit = async function(event) {
        event.preventDefault();

        try {
            loading_shimmer();

            const updateData = {
                employee: document.getElementById("edit_employee").value,
                email: document.getElementById("editTerminationEmployeeEmail").value,
                TerminationType: document.getElementById("edit_TerminationType").value,
                terminationDate: document.getElementById("edit_terminationDate").value,
                reason: document.getElementById("edit_reason").value
            };
            let _id = editId;

            const response = await fetch(`${termination_API}/update`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ _id, ...updateData })
            });

            const success = response.ok;
            status_popup(success ? "Termination Updated <br> Successfully!" : "Please try again later", success);

            if (success) await all_data_load_dashboard();
        } catch (error) {
            console.error('Error updating termination:', error);
            status_popup("Please try again later", false);
        } finally {
            remove_loading_shimmer();
        }
    };


window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);

 
 