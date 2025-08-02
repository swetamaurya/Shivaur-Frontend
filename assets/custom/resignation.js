// Redirect if token is missing
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

import { checkbox_function } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { global_search_API, resignation_API, departments_API, user_API } from './apis.js';
import { individual_delete, objects_data_handler_function } from './globalFunctionsDelete.js';
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';

window.individual_delete = individual_delete;
const token = localStorage.getItem('token');

// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
// -------------------------------------------------------------------------
async function handleSearch() {
    const searchFields = ["employee.name"]; // Adjust as needed
    const searchType = "resignation"; // Type to pass to the backend
    const tableData = document.getElementById("resignation-table-body");
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
                const email = e.employee ? e.employee.email : '-';
                const reason = e.reason || '-';
                const resignationDate = e.resignationDate
                    ? new Date(e.resignationDate).toLocaleDateString()
                    : '-';
                const noticeDate = e.noticeDate
                    ? new Date(e.noticeDate).toLocaleDateString()
                    : '-';
                    const status = e.status || '-';

                rows += `
                    <tr data-id="${e._id}">
                        <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                        <td>${employeeName}</td>
                        <td>${email}</td>
                         <td>${reason}</td>
                        <td>${noticeDate}</td>
                          <td>${resignationDate}</td>
                           <td>${status}</td>

                        <td class="text-end">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" onclick="handleClickOnEditApproveResignation('${e._id}')" data-bs-toggle="modal" data-bs-target="#approve_resignation">
                                      <i class="fa-regular fa-thumbs-up"></i> Approve
                                  </a>    
                                <a class="dropdown-item" onclick="handleClickOnEditResignation('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_resignation">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                      
                                    <a class="dropdown-item" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_resignation">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } else {
            rows = `<tr><td colspan="7" class="text-center">No results found</td></tr>`;
        }

        tableData.innerHTML = rows;
        checkbox_function(); // Reinitialize checkboxes
    } catch (error) {
        console.error("Error during search:", error);
        tableData.innerHTML = `<tr><td colspan="7" class="text-center">An error occurred while loading data</td></tr>`;
    } finally {
        remove_loading_shimmer();
    }
}




// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch(); // Trigger search
});

 
let cachedEmployee = [];
// let cachedDepartments = [];
let res = [];

// Fetch Employee and Department Data
async function fetchEmployeeAndDepartments() {
    if (cachedEmployee.length === 0) {
        try {
            const response = await fetch(`${user_API}/data/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            cachedEmployee = data.users.employees || [];
            
        } catch (error) {
            // console.error('Error fetching Employee:', error);
        }
    }
 
}

window.populateEmployeeDropdown = function populateEmployeeDropdown() {
    const editEmpSelectOption = document.getElementById("edit_employee");
    editEmpSelectOption.innerHTML = `<option value="" disabled selected>Select Employee</option>`;

    cachedEmployee.forEach(employee => {
        const option = document.createElement("option");
        option.value = employee._id ? employee._id : '';
        option.textContent = employee.name ? employee.name : '';
        option.setAttribute("data-email", employee.email || ''); // Add email as a data attribute
        editEmpSelectOption.appendChild(option);
    });
};


 

// Load all resignation data and display it in the table
async function all_data_load_dashboard() {
    try {
        loading_shimmer();
        await fetchEmployeeAndDepartments();

        populateEmployeeDropdown();
        // populateDepartmentDropdown();
        let rows = [];

        const response = await fetch(`${resignation_API}/getAll${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        

        let r2 = await response.json();
        // console.log("this is a game for the dveelper brother. ;;;- ",r2);
        setTotalDataCount(r2?.totalResignations);

        const table = document.getElementById('resignation-table-body');
        table.innerHTML = '';
        res = r2?.data;
        res.forEach(e => {
            const employeeName = e.employee ? e.employee.name : '-';
            const email = e.employee ? e.employee.email : '-';
            const reason = e.reason || '-';
            const noticeDate = e.noticeDate ? new Date(e.noticeDate).toLocaleDateString() : '-';

            const resignationDate = e.resignationDate ? new Date(e.resignationDate).toLocaleDateString() : '-' 
            const status = e.status || '-';

            rows.push(`<tr data-id="${e._id}">
                <td><input type="checkbox" class="checkbox_child" value="${e._id || '-'}"></td>
                <td>${employeeName}</td>
                <td>${email}</td>
                <td>${reason}</td>
                <td>${noticeDate}</td>
                <td>${resignationDate}</td>
                 <td>${status}</td>
                <td>
                    <div class="dropdown dropdown-action">
                        <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="material-icons">more_vert</i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item" onclick="handleClickOnEditApproveResignation('${e._id}')" data-bs-toggle="modal" data-bs-target="#approve_resignation">
                                      <i class="fa-regular fa-thumbs-up"></i> Approve
                                  </a>  
                        <a class="dropdown-item" onclick="handleClickOnEditResignation('${e._id}')" data-bs-toggle="modal" data-bs-target="#edit_resignation">
                                <i class="fa-solid fa-pencil m-r-5"></i> Edit
                            </a>
                              
                            <a class="dropdown-item" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_resignation">
                                <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                            </a>
                        </div>
                    </div>
                </td>
            </tr>
            `);
        });
        table.innerHTML = rows.join('');
        checkbox_function();
    } catch (error) {
        // console.error("Error loading resignations:", error);
    } finally {
        remove_loading_shimmer();
    }
}

// Format date for Edit form
function formatDate(dateString) {
    return new Date(dateString).toISOString().split('T')[0];
}

document.getElementById("edit_employee").addEventListener("change", function (event) {
    const selectedOption = event.target.selectedOptions[0]; // Get the selected option
    const email = selectedOption.getAttribute("data-email"); // Fetch the email from the data attribute
    document.getElementById("edit_email").value = email || ''; // Populate the email field
});

// Edit Resignation
window.handleClickOnEditResignation = async function (_id) {
    const resignation = res.find(item => item._id === _id);
    if (!resignation) {
        // console.error("Resignation data not found for ID:", _id);
        return;
    }

    await fetchEmployeeAndDepartments();
    populateEmployeeDropdown();

    // Populate fields with existing data
    document.getElementById("edit_employee").value = resignation.employee?._id || '';
    document.getElementById("edit_email").value = resignation.employee?.email || ''; // Auto-fill email
    document.getElementById("edit_reason").value = resignation.reason;
    document.getElementById("edit_noticeDate").value = formatDate(resignation.noticeDate) || '';
    document.getElementById("edit_resignationDate").value = formatDate(resignation.resignationDate) || '';

    // Attach submission logic
    const editForm = document.getElementById("edit-resignation");
    editForm.onsubmit = null;

    editForm.onsubmit = async function (event) {
        event.preventDefault();
        try {
            loading_shimmer();

            const updateData = {
                employee: document.getElementById("edit_employee").value,
                email: document.getElementById("edit_email").value, // Use updated email value
                reason: document.getElementById("edit_reason").value,
                noticeDate: document.getElementById("edit_noticeDate").value,
                resignationDate: document.getElementById("edit_resignationDate").value,
            };

            const response = await fetch(`${resignation_API}/update`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ _id, ...updateData })
            });

            const success = response.ok;
            status_popup(success ? "Resignation Updated <br> Successfully!" : "Please try again later", success);
            
            if (success) await all_data_load_dashboard();
        } catch (error) {
            // console.error('Error updating Resignation:', error);
            status_popup("Please try again later", false);
        } finally {
            remove_loading_shimmer();
        }
    };
};

 

// Initialize on page load
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);


let approveResignationId;

// Function to set the ID of the resignation being approved/declined
window.handleClickOnEditApproveResignation = function handleClickOnEditApproveResignation(id) {
  approveResignationId = id;
//   console.log(approveResignationId);
};

// Add event listeners to buttons for approving/declining resignation
const statusButtons = document.querySelectorAll(".status-btn");
statusButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();

    const status = event.target.getAttribute("data-status"); // Get Approved/Declined from clicked button

    if (
      !status ||
      (status !== "Approved" && status !== "Declined")
    ) {
    //   console.log("Invalid resignation status.");
      return;
    }

    try {
      // Send POST request to update resignation status
      const response = await fetch(`${resignation_API}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: approveResignationId, status }),
      });

      const resp = await response.json();
    //   console.log(resp);

      // Update the status in the table
    //   const row = document.querySelector(`tr[data-id="${approveResignationId}"]`);
    //   if (row) {
    //     row.querySelector("td:nth-child(9)").textContent = status;
    //   }

      const c1 = response.ok;
      try {
        status_popup(
          c1
            ? `Resignation ${status} <br> Successfully!`
            : "Please try again later",
          c1
        );
        all_data_load_dashboard();
      } catch (error) {
        status_popup("Please try <br> again later", false);
      }

    } catch (error) {
    //   console.error("Error approving resignation:", error);
    }
  });
});

 