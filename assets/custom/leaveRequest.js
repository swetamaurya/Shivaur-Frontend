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
import {leave_API, leaveType_API, global_search_API} from './apis.js'
import { checkbox_function } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function } from './globalFunctionsDelete.js';
// -------------------------------------------------------------------------
import {formatDate} from './globalFunctions2.js'
window.individual_delete = individual_delete;
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// -------------------------------------------------------------------------
const token = localStorage.getItem('token');
// =================================================================================


// async function handleSearch() {
//   const searchFields = ["leaveStatus", "name"]; // IDs of input fields
//   const searchType = "leaves"; // Type to pass to the backend
//   const tableData = document.getElementById("leavesData");
//   let tableContent = ''; // Initialize table content

//   try {
//       loading_shimmer();

//       // Construct query parameters for the search
//       const queryParams = new URLSearchParams({ type: searchType });
//       searchFields.forEach((field) => {
//           const value = document.getElementById(field)?.value;
//           if (value) queryParams.append(field, value);
//       });

//       // Fetch search results
//       const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
//           method: 'GET',
//           headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`,
//           },
//       });

//       const res = await response.json();
//       console.log("Search API Response:", res); // Debug the response

//       if (res.data?.length > 0) {
//           res.data.forEach((leave) => {
//               tableContent += `
//                   <tr data-id="${leave._id}">
//                       <td><input type="checkbox" class="checkbox_child" value="${leave._id || '-'}"></td>
//                       <td>${leave.employee ? leave.employee.name : 'N/A'}</td>
//                       <td>${leave.leaveType ? leave.leaveType.leaveName : 'N/A'}</td>
//                       <td>${leave.from}</td>
//                       <td>${leave.to}</td> 
//                       <td>${leave.noOfDays}</td>
//                       <td>${leave.reason}</td>
//                       <td>${leave.leaveStatus}</td>
//                       <td class="text-end">
//                           <div class="dropdown dropdown-action">
//                               <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
//                                   <i class="material-icons">more_vert</i>
//                               </a>
//                               <div class="dropdown-menu dropdown-menu-right">
//                                   <a onclick="handleClickToEditLeaves('${leave._id}')" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#edit_leave">
//                                       <i class="fa-solid fa-pencil m-r-5"></i> Edit
//                                   </a>
//                                   <a class="dropdown-item" onclick="handleClickOnEditApproveLeaves('${leave._id}')" data-bs-toggle="modal" data-bs-target="#approve_leave">
//                                       <i class="fa-regular fa-thumbs-up"></i> Approve
//                                   </a>
//                                   <a class="dropdown-item" onclick="individual_delete('${leave._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
//                                       <i class="fa-regular fa-trash-can m-r-5"></i> Delete
//                                   </a>
//                               </div>
//                           </div>
//                       </td>
//                   </tr>`;
//           });
//       } else {
//           // No results found
//           tableContent = `
//               <tr>
//                   <td colspan="9" class="text-center">
//                       <i class="fa-solid fa-times"></i> No results found
//                   </td>
//               </tr>`;
//       }
//   } catch (error) {
//       console.error("Error during search:", error);
//       // Display error message in the table
//       tableContent = `
//           <tr>
//               <td colspan="9" class="text-center">
//                   <i class="fa-solid fa-times"></i> An error occurred during search
//               </td>
//           </tr>`;
//   } finally {
//       // Update the table with results or error message
//       tableData.innerHTML = tableContent;
//       console.log("Updated Table Content:", tableContent); // Debug the generated table rows
//       checkbox_function(); // Reinitialize checkboxes
//       remove_loading_shimmer(); // Remove loading shimmer
//   }
// }





// =======================================================================================
// Event listener for search button
// document.getElementById("searchButton").addEventListener("click", (e) => {
//   e.preventDefault();
//   handleSearch(); // Trigger search
// });



async function leaveSelectOption() {
  try{
      const response = await fetch(`${leaveType_API}/get`,{
          method: 'GET',
          headers:{
              'Authorization': `Bearer ${token}`,
              'Content-Type':'application/json'
          }
      });
      let r2 = await response.json();
      let res = r2?.data;

      console.log("brother :- ",res)

      let leaveType = document.getElementById('editleaveType');

      res.map(e2=>{
            let op = document.createElement("option");
            op.value = e2?._id;
            op.text = e2?.leaveName;

            leaveType.appendChild(op);
        });
    }catch(error){
      console.log(error);
    }
}
leaveSelectOption();

async function all_data_load_dashboard() {
  try {
      loading_shimmer(); // Show loading animation
  } catch (error) {
      console.error("Error in loading shimmer:", error);
  }

  const leavestableData = document.getElementById('leavesData'); // Table body element
  let tableContent = ''; // To hold the generated rows

  try {
      // Fetch leave data from the API
      const response = await fetch(`${leave_API}/get${rtnPaginationParameters()}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });

      const res = await response.json(); // Parse the JSON response
      setTotalDataCount(res?.summary?.totalRecords || 0); // Update total records count

      const leaves = res?.leaves || []; // Get leaves or fallback to an empty array

      // Handle case when no data is returned
      if (leaves.length === 0) {
          console.warn("No leave data found in response.");
          leavestableData.innerHTML = `
              <tr>
                  <td colspan="9" class="text-center">
                      <i class="fa-solid fa-times"></i> No leave data found
                  </td>
              </tr>`;
          return; // Stop further execution
      }

      // Generate rows for each leave
      leaves.forEach((leave) => {
          tableContent += `
              <tr data-id="${leave._id}">
                  <td><input type="checkbox" class="checkbox_child" value="${leave?._id || '-'}"></td>
                  <td>${leave.employee?.name || '-'}</td>
                  <td>${leave.leaveType?.leaveName || '-'}</td>
                  <td>${formatDate(leave.from)}</td>
                  <td>${formatDate(leave.to)}</td>
                  <td>${leave.noOfDays}</td>
                  <td>${leave.reason || 'N/A'}</td>
                  <td>${leave.leaveStatus}</td>
                  <td class="text-end">
                      <div class="dropdown dropdown-action">
                          <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="material-icons">more_vert</i>
                          </a>
                          <div class="dropdown-menu dropdown-menu-right">
                           <a class="dropdown-item" onclick="handleClickOnEditApproveLeaves('${leave._id}')" data-bs-toggle="modal" data-bs-target="#approve_leave">
                                  <i class="fa-regular fa-thumbs-up"></i> Approve
                              </a>
                              <a onclick="handleClickToEditLeaves('${leave._id}')" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#edit_leave">
                                  <i class="fa-solid fa-pencil m-r-5"></i> Edit
                              </a>
                             
                              <a class="dropdown-item" onclick="individual_delete('${leave?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                                  <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                              </a>
                          </div>
                      </div>
                  </td>
              </tr>`;
      });

      // Update table content
      leavestableData.innerHTML = tableContent;

      // Reinitialize checkboxes (if needed for functionality)
      checkbox_function();
  } catch (error) {
      console.error("Error fetching leave data:", error);
      leavestableData.innerHTML = `
          <tr>
              <td colspan="9" class="text-center">
                  <i class="fa-solid fa-times"></i> An error occurred while loading leave data.
              </td>
          </tr>`;
  } finally {
      try {
          remove_loading_shimmer(); // Hide loading animation
      } catch (error) {
          console.error("Error in removing loading shimmer:", error);
      }
  }
}

// Call the function to load data when the page loads
all_data_load_dashboard();

objects_data_handler_function(all_data_load_dashboard)
// =================================================================================


let leaveId;

window.handleClickToEditLeaves = async function handleClickToEditLeaves(id) {
  leaveId = id;
  const leaveType = document.getElementById("editleaveType");
  const from = document.getElementById("editfromDate");
  const to = document.getElementById("editToDate");
  const noOfDays = document.getElementById("editNumberDays");
  const remark = document.getElementById("editReason");
  const reason = document.getElementById("editReason");
  
  const response = await fetch(`${leave_API}/get/${id}`,{
    method: 'GET',
    headers:{
      'Authorization': `Bearer ${token}`,
      'Content-Type':'application/json'
    }
  });
  let res = await response.json();

  leaveType.value = res.leaveType._id 
      from.value = res.from;
      to.value = res.to;
      noOfDays.value = res.noOfDays;
      remark.value = res.remark ? res.remark : "";
      reason.value = res.reason;
      return;
}

const edit_leave_form = document.getElementById('edit_leave_form');
edit_leave_form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  const _id = leaveId;
  const leaveType = document.getElementById("editleaveType").value;
  const from = document.getElementById("editfromDate").value;
  const to = document.getElementById("editToDate").value;
  const noOfDays = document.getElementById("editNumberDays").value;
  const remark = document.getElementById("editReason").value;
  const reason = document.getElementById("editReason").value;

  try {
    const response = await fetch(`${leave_API}/update`,{
      method: 'POST',
      headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({leaveType,from,to,noOfDays,remark,reason,_id})
    });
    let res = await response.json();
    console.log(res);
    const c1 = (response.ok==true);
      try{
          status_popup( ((c1) ? "Leave Updated <br> Successfully!" : "Please try again later"), (c1) );
          setTimeout(function(){
              // window.location.href = 'estimates.html'; 
          },(Number(document.getElementById("b1b1").innerText)*1000));
      } catch (error){
        status_popup( ("Please try again later"), (false) );
      }
  } catch (error) {
    status_popup( ("Please try again later"), (false) );
    console.log(error);
  }
})

let approveLeaveId;
window.handleClickOnEditApproveLeaves = function handleClickOnEditApproveLeaves(id){
  approveLeaveId = id
  // console.log(approveLeaveId)
}

const statusButtons = document.querySelectorAll(".status-btn");
statusButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();

    const leaveStatus = event.target.getAttribute("data-status"); // Get Approved/Declined from clicked button

    if (!leaveStatus || (leaveStatus !== "Approved" && leaveStatus !== "Declined")) {
      console.log("Invalid leave status.");
      return;
    }

    try {
      // Send POST request to update leave status
      const response = await fetch(`${leave_API}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: approveLeaveId, leaveStatus }),
      });

      const resp = await response.json();
      console.log(resp);

      // Find the row corresponding to the leave ID
      const row = document.querySelector(`tr[data-id="${approveLeaveId}"]`);
      if (row) {
        // Dynamically locate the status cell
        const statusCell = row.querySelector('td[data-column="status"]'); // Ensure the status column has a `data-column="status"` attribute
        if (statusCell) {
          statusCell.textContent = leaveStatus; // Update the leaveStatus in the table
        }
      }

      const success = response.ok;
      status_popup(
        success ? `Leave ${leaveStatus} <br> Successfully!` : "Please try again later",
        success
      );

      // Optional: Refresh the table or dashboard after a delay
      if (success) {
      
          all_data_load_dashboard(); // Replace with your function to reload the table or page
    
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      status_popup("Please try again later", false);
    }
  });
});



// Function to fetch leave summary and update the stats
async function fetchLeaveSummary() {
  try {
    // Make an API request to fetch leave summary
    const response = await fetch(`${leave_API}/get`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leave summary.');
    }

    const data = await response.json();

    // Update the stats on the UI
    document.getElementById('plannedLeaves').textContent = data.summary.totalOtherLeaves || 0; // Planned Leaves
    document.getElementById('unplannedLeaves').textContent = data.summary.totalUnplannedLeaves || 0; // Unplanned Leaves
    document.getElementById('totalPendingRequests').textContent = data.summary.totalPendingRequests || 0; // Pending Requests
    document.getElementById('totalApprovedLeaves').textContent = data.summary.totalApprovedLeaves || 0; // Approved Leaves
  } catch (error) {
    console.error('Error fetching leave summary:', error.message);
  }
}

// Call the function to update stats on page load
fetchLeaveSummary();
