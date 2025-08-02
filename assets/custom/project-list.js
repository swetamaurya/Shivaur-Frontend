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
import { loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
import { project_API, global_search_API } from './apis.js';
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================

// =================================================================================
 
 // Function to handle search and update the same table
 async function handleSearch() {
    const searchFields = ["projectName", "projectId"]; // IDs of input fields
    const searchType = "project"; // Type to pass to the backend
    const tableData = document.getElementById("projectData");
    let x = ''; // Initialize rows content

    try {
        loading_shimmer(); // Show shimmer while fetching data

        // Construct query parameters for the search
        const queryParams = new URLSearchParams({ type: searchType });
        searchFields.forEach((field) => {
            const value = document.getElementById(field)?.value?.trim();
            if (value) queryParams.append(field, value);
        });

        console.log("Query Parameters:", queryParams.toString()); // Debug log

        // Fetch search results from API
        const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();

        if (response.ok && res.data?.length > 0) {
            // Loop through results and generate table rows
            res.data.forEach((e) => {
                x += `<tr data-id="${e._id}">
                    <td><input type="checkbox" class="checkbox_child" value="${e._id}" /></td>
                    <td>${capitalizeFirstLetter(e?.projectName) || '-'}</td>
                    <td>${e?.projectId || '-'}</td>
                    <td>${e?.clientName?.name ? `${capitalizeFirstLetter(e?.clientName?.name)} (${e?.clientName?.userId || '-'})` : '-'}</td>
                    <td>${e?.assignedTo?.name ? `${capitalizeFirstLetter(e?.assignedTo?.name)} (${e?.assignedTo?.userId || '-'})` : '-'}</td>
                    <td>${formatDate(e?.deadline) || '-'}</td>
                    <td>${capitalizeFirstLetter(e?.status) || '-'}</td>
                    <td class="text-end">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a href="project-view.html?id=${e?._id}" class="dropdown-item"><i class="fa-regular fa-eye"></i> View</a>
                                <a href="edit-project.html?id=${e?._id}" class="dropdown-item hr_restriction employee_restriction"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                <a class="dropdown-item hr_restriction employee_restriction" onclick="individual_delete('${e?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                            </div>
                        </div>
                    </td>
                </tr>`;
            });
        } else {
            // Display a message when no results are found
            x = `<tr><td colspan="8" class="text-center">No results found</td></tr>`;
        }
    } catch (error) {
        console.error("Error during search:", error);
        x = `<tr><td colspan="8" class="text-center">An error occurred during search</td></tr>`;
    } finally {
        // Update the table with results or error message
        tableData.innerHTML = x;
        checkbox_function(); // Reinitialize checkboxes
        remove_loading_shimmer(); // Hide shimmer loader
    }
}

// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});


// employee dashboard data - table - load
async function all_data_load_dashboard(){
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    

    const tableData = document.getElementById("projectData");
    tableData.innerHTML = ''; // Clear table data
    var x = "";

    try{
        const r = await fetch((`${project_API}/get${rtnPaginationParameters()}`), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    
        let res = await r.json();
        let user = res?.data;
        setTotalDataCount(res?.totalProjects);
        
        if(user.length > 0){
            for (var i = 0; i < user.length; i++) {
                let e = user[i];
        
                // console.log(user[i].clientName)
                x += `<tr data-id="${e._id}">
                        <td ><input type="checkbox" class="checkbox_child" value="${e._id}" /></td>
                        <td>${capitalizeFirstLetter(e?.projectName) || '-'}</td>
                        <td>${e?.projectId}</td>
                        <td>${(user[i]?.clientName?.name) == undefined ? "-" : (capitalizeFirstLetter(user[i]?.clientName?.name))} (${(user[i]?.clientName?.userId) == undefined ? "-" : ((user[i]?.clientName?.userId))})</td>
                        <td>${(user[i]?.assignedTo?.name) == undefined ? "-" : (capitalizeFirstLetter(user[i]?.assignedTo?.name))} (${(user[i]?.assignedTo?.userId) == undefined ? "-" : (user[i]?.assignedTo?.userId)})</td>
                        <td>${formatDate(e?.deadline) || '-'}</td>
                        <td>${capitalizeFirstLetter(e?.status) || '-'}</td>
                        <td class="text-end">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a  href="project-view.html?id=${e?._id}" class="dropdown-item projectViewBtn employee_restriction" ><i class="fa-regular fa-eye"></i> View</a>
                                    <a  href="edit-project.html?id=${e?._id}" class="dropdown-item projectEditBtn hr_restriction" ><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                    <a class="dropdown-item projectDeleteBtn hr_restriction employee_restriction" onclick="individual_delete('${e?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            }
            tableData.innerHTML = x;
        } else {
            x = `
                <tr>
                    <td  colspan="8" class='text-center'><i class="fa-solid fa-times"></i> Data not present</td>
                </tr>`;

            tableData.innerHTML = x;
        }
    } catch(error){
        x = `
            <tr>
                <td  colspan="8" class='text-center'><i class="fa-solid fa-times"></i> Data not present</td>
            </tr>`;

        tableData.innerHTML = x;

        console.error('Error loading employee data:', error);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        checkbox_function();
        remove_loading_shimmer();
    } catch(error){console.log(error)}
    try{
        main_hidder_function();
    } catch (error){console.log(error)}
}

// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);


