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
import { task_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
import { global_search_API } from './apis.js'; // Define your global search API URL
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================

async function handleSearch() {
    const searchFields = ["title", "taskId"]; // IDs of input fields
    const searchType = "Task"; // Type to pass to the backend
    const tableData = document.getElementById("tableData");
    let x = '';

    try {
        loading_shimmer(); // Display loader

        // Build query parameters for the search
        const queryParams = new URLSearchParams({ type: searchType });
        searchFields.forEach((field) => {
            const value = document.getElementById(field)?.value?.trim();
            if (value) queryParams.append(field, value);
        });

        // Fetch search results from the API
        const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();

        if (response.ok && res.data?.length > 0) {
            // Populate the table rows with fetched data
            res.data.forEach((task) => {
                // const assignedToNames = (task.assignedTo || [])
                //     .map((user) => user.ContractorName || '-')
                //     .join(", ");

                x += `
                    <tr data-id="${task?._id || '-'}">
                        <td><input type="checkbox" class="checkbox_child" value="${task?._id || '-'}"></td>
                        <td>${task?.title || '-'}</td>
                                                <td>${task?.taskId || '-'}</td>

                        <td>${task?.project?.projectName || '-'} (${task?.project?.projectId || '-'})</td>
                    
                        <td>${formatDate(task?.startDate) || '-'}</td>
                        <td>${formatDate(task?.deadlineDate) || '-'}</td>
                        <td>${capitalizeFirstLetter(task?.status) || '-'}</td>
                        <td class="text-end">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="material-icons">more_vert</i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                 <a class="dropdown-item" href="task-view.html?id=${task?._id}">
                                        <i class="fa-solid fa-eye m-r-5"></i> View
                                    </a>    
                                <a class="dropdown-item hr_restriction employee_restriction" href="edit-tasks.html?id=${task?._id}">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                   
                                    <a class="dropdown-item hr_restriction employee_restriction" onclick="individual_delete('${task?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            });
        } else {
            // Show no results message
            x = `<tr><td colspan="8" class="text-center">No results found</td></tr>`;
        }
    } catch (error) {
        console.error("Error during search:", error);
        x = `<tr><td colspan="8" class="text-center">An error occurred during search</td></tr>`;
    } finally {
        // Update the table and reinitialize checkbox function
        tableData.innerHTML = x;
        checkbox_function(); // Reinitialize checkboxes
        document.dispatchEvent(new Event('removeDataFromTask'));
        remove_loading_shimmer(); // Remove loader
    }
    try{
        main_hidder_function();
    } catch (error){console.log(error)}
}

// Attach the search function to the search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});


async function all_data_load_dashboard(){
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    
    const tableData = document.getElementById('tableData');
    const response = await fetch(`${task_API}/get${rtnPaginationParameters()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    let zzzz1 = await response.json();
    // console.log("brbrbr :- ",zzzz1)
    let user = zzzz1?.data;
    
    setTotalDataCount(zzzz1?.totalTasks);

    let x = '';
    if(user.length>0){
    // if(false){
        for (let i = 0; i < user.length; i++) {
            // let assignToName = [];

            // let zz1 = user[i]?.assignedTo || 0;
            // if(zz1?.length>0){
            // (zz1).map((e)=>{
            //     let z1 = `${e?.ContractorName || '' }`;
            //     assignToName.push(z1);
            // })
            // }

            x += `<tr data-id="${user[i]?._id || '-'}">
            <td ><input type="checkbox" class="checkbox_child" value="${user[i]?._id || '-'}"></td>
            <td>${user[i]?.title || '-'}</td>
                                                            <td>${user[i]?.taskId || '-'}</td>

            <td>${user[i]?.project?.projectName || '-'} (${user[i]?.project?.projectId || ''})</td>
             <td>${formatDate(user[i]?.startDate) || '-'}</td>
                                     <td>${formatDate(user[i]?.deadlineDate) || '-'}</td>

            <td>${user[i]?.status || '-'}</td>
            <td class="text-end">
                <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="material-icons">more_vert</i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item taskViewBtn " href="task-view.html?id=${user[i]?._id}" ><i class="fa-solid fa-eye m-r-5"></i> View</a>
    
                <a class="dropdown-item taskEditBtn hr_restriction " href="edit-tasks.html?id=${user[i]?._id}"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                    <a class="dropdown-item taskDeleteBtn hr_restriction employee_restriction" onclick="individual_delete('${user[i]?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                </div>
                </div>
            </td>
            </tr>`;
        }
    } else {
        x = `
                <tr>
                    <td  colspan="9" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
                </tr>`;
    }
    tableData.innerHTML = x;  
    checkbox_function();
    document.dispatchEvent(new Event('removeDataFromTask'));
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}

    try{
        main_hidder_function();
    } catch (error){console.log(error)}
    
}
// =======================================================================================
// =======================================================================================

// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);