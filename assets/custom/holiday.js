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
import { checkbox_function } from './multi_checkbox.js'; // Import checkbox functionality
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { holiday_API, global_search_API } from './apis.js';
import {  formatDate,  capitalizeFirstLetter } from './globalFunctions2.js'
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
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
    const searchFields = ["holidayName"]; // IDs of input fields
    const searchType = "holiday"; // Type to pass to the backend
    const tableData = document.getElementById("holidayData");
    let tableContent = ''; // Initialize table content

    try {
        loading_shimmer(); // Show loading shimmer

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
        console.log("Holiday Data Response:", res); // Debug the response

        if (res.data?.length > 0) {
            // Results found, generate table rows
            tableContent = res.data.map((holiday) => `
                <tr data-id="${holiday._id}">
                    <td><input type="checkbox" class="checkbox_child" value="${holiday._id || '-'}"></td>
                    <td>${capitalizeFirstLetter(holiday.holidayName)}</td>
                    <td>${formatDate(holiday.holidayDate)}</td>
                    <td>${capitalizeFirstLetter(holiday.offDays)}</td>
                    <td class=" manager_restriction employee_restriction">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" onclick="handleClickOnEditHoliday('${holiday._id}')" data-bs-toggle="modal" data-bs-target="#edit_holiday">
                                    <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                </a>
                                <a class="dropdown-item" onclick="individual_delete('${holiday._id}')" data-bs-toggle="modal" data-bs-target="#delete_holiday">
                                    <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            // No results found
            tableContent = `
                <tr>
                    <td colspan="5" class='text-center'>
                        <i class="fa-solid fa-times"></i>No Data Found
                    </td>
                </tr>`;
        }

        tableData.innerHTML = tableContent; // Update table content
        checkbox_function(); // Apply checkbox functionality after updating the table
    } catch (error) {
        console.error("Error during search:", error);
        // Display error message in the table
        tableContent = `
            <tr>
                <td colspan="5" class="text-center">
                    <i class="fa-solid fa-times"></i> An error occurred during search
                </td>
            </tr>`;
        tableData.innerHTML = tableContent;
    } finally {
        remove_loading_shimmer(); // Remove loading shimmer
    }
    try{
        main_hidder_function();
    } catch (error){console.log(error)}
}



// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});



let res = []; // Renaming `res` to `holidayData` for clarity

// Load Holiday List
async function all_data_load_dashboard() {
 
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------

    const table = document.getElementById('holidayData');
    table.innerHTML = ''; // Clear table content
    let rows = '';

    try {
        const response = await fetch(`${holiday_API}/get${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let r2 = await response.json(); // Assign the fetched data to `holidayData`
        console.log("alsjd aslkd d d;+ ",r2)
        setTotalDataCount(r2?.totalHolidays);
        res = r2?.data;
        // console.log("Holiday Data:", holidayData);

        if(res.length>0) {
            // Generate table rows
            res.forEach((holiday) => {
                rows += `
                    <tr data-id="${holiday._id}">
                        <td><input type="checkbox" class="checkbox_child" value="${holiday._id || '-'}"></td>
                        <td>${capitalizeFirstLetter(holiday.holidayName)}</td>
                        <td>${ formatDate(holiday.holidayDate)}</td>
                        <td>${capitalizeFirstLetter(holiday.offDays)}</td>
                        <td class=" manager_restriction employee_restriction">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditHoliday('${holiday._id}')" data-bs-toggle="modal" data-bs-target="#edit_holiday">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                    <a class="dropdown-item" onclick="individual_delete('${holiday._id}')" data-bs-toggle="modal" data-bs-target="#delete_holiday">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            });
        } else {
            rows = `
                <tr>
                    <td  colspan="5" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
                </tr>`;
        }

        table.innerHTML = rows;
        checkbox_function(); // Apply checkbox functionality after loading the list
        document.dispatchEvent(new Event('removeDataFromHoliday'));
    
    } catch (error) {
        console.error("Error loading terminations:", error);
    }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
}

// Add New Holiday
document.getElementById('add_holiday').addEventListener('submit', async function (event) {
  event.preventDefault();

    try {
        try{
            Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
        } catch(error){console.log(error)}
        try{
            loading_shimmer();
        } catch(error){console.log(error)}
        // ----------------------------------------------------------------------------------------------------
        

        const holidayName = document.getElementById('holiday_Name').value;
        const holidayDate = document.getElementById('holidayDate').value;
        const offDays = document.getElementById('offDays').value;


        const response = await fetch(`${holiday_API}/post`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ holidayName, holidayDate, offDays })
        });
        
        try{
            document.getElementById('holiday_Name').value = '';
            document.getElementById('holidayDate').value = '';
            document.getElementById('offDays').value = '';
        } catch(error){console.log(error)}

        const success = response.ok;
        status_popup(success ? "Holiday Created <br> Successfully!" : "Please try <br> again later", success);
        if (success){
            all_data_load_dashboard();
        } 

    } catch (error) {
        console.error('Error adding holiday:', error);
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

// Show holiday data in edit modal
window.handleClickOnEditHoliday = async function (_id) {
    const holiday = res.find(h => h._id === _id);
    if (holiday) {
        document.getElementById('editHolidayName').value = holiday.holidayName;
        document.getElementById('editHolidayDate').value = holiday.holidayDate;
        document.getElementById('editHolidayDay').value = holiday.offDays;

        const editForm = document.getElementById('edit_holiday');
        if (editForm) {
            editForm.onsubmit = async function(event) {
                event.preventDefault();
                    try{
                        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
                    } catch(error){console.log(error)}
                    try{
                        loading_shimmer();
                    } catch(error){console.log(error)}
                    try {
                        const holidayName = document.getElementById('editHolidayName').value;
                        const holidayDate = document.getElementById('editHolidayDate').value;
                        const offDays = document.getElementById('editHolidayDay').value;

                        const response = await fetch(`${holiday_API}/update`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ holidayName, holidayDate, offDays, _id })
                        });

                        const success = response.ok;
                        status_popup(success ? "Holiday Updated <br> Successfully!" : "Please try <br> again later", success);
                        if (success) {
                            await all_data_load_dashboard(); // Reload holiday list
                        }
                    } catch (error) {
                        console.error("Error updating holiday:", error);
                        status_popup("Please try <br> again later", false);
                    }
                    // ----------------------------------------------------------------------------------------------------
                    try{
                        remove_loading_shimmer();
                    } catch(error){console.log(error)}
            };
        } else {
            console.error("Edit holiday form element not found");
        }
    }
};

 

window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);


// Remove data from holiday 
// document.addEventListener('removeDataFromHoliday',()=>{
//     let User_role = localStorage.getItem('User_role')
//     let addHolidayButton = document.getElementById('add-holiday-btn');
//     let holidayAction = document.getElementById('holiday-action');
//     let holidayTable = document.getElementById('holidayData').children
//     // let tableDeleteButton = document.getElementsByClassName('holidayDeleteBtn');
//     let deleteHolidayButton = document.getElementById('delete_btn_multiple_file');
//     let downloadExcelFile = document.getElementById('download_excel_multiple_file');
    
//     if(User_role == "Manager"){
//         addHolidayButton.remove();
//             holidayAction.remove();
//             deleteHolidayButton.remove();
//             downloadExcelFile.remove();
//         for(let i=0; i<holidayTable.length; i++){
//             if (holidayTable[i] && holidayTable[i].cells && holidayTable[i].cells[4]){
//             holidayTable[i].cells[4].remove()
//             }
//         }
//     }
//     else if(User_role == "Employee"){
//         addHolidayButton.remove();
//         holidayAction.remove();
//         deleteHolidayButton.remove();
//             downloadExcelFile.remove();
//             for(let i=0; i<holidayTable.length; i++){
//                 if (holidayTable[i] && holidayTable[i].cells && holidayTable[i].cells[4]){
//                 holidayTable[i].cells[4].remove()
//                 }
//             }
//     }
// })
 