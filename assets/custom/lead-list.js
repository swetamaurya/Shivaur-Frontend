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
  import { status_popup ,loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
  import { capitalizeFirstLetter, formatDate } from './globalFunctions2.js';
  import { lead_API, global_search_API } from './apis.js';
  import { rtnPaginationParameters, setTotalDataCount } from './globalFunctionPagination.js';
  import { individual_delete, objects_data_handler_function } from './globalFunctionsDelete.js';
  import { main_hidder_function } from './gloabl_hide.js';
  
  window.individual_delete = individual_delete; 
  // =================================================================================
  const token = localStorage.getItem('token');
  let enquiryRightHistory = JSON.parse(localStorage.getItem('isEnquiry')) || [];
  import {} from "./globalFunctionsImport.js";
  import {} from "./globalFunctionsExport.js";
  // =================================================================================
  // Function to handle search and update the same table
  async function handleSearch() {
    const searchFields = ["leadName" ]; // IDs of input fields for search
    const searchType = "lead"; // Type to pass to the backend
    const tableData = document.getElementById("leadData");
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
          // Extract callInfo data
          const callDate = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
          ? e.callInfo[e.callInfo.length - 1]?.date 
          : e.callInfo[0]?.date 
          : '-';
          const callStatus = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
            ? e.callInfo[e.callInfo.length - 1]?.status 
            : e.callInfo[0]?.status 
          : '-'; 
          const callNextFollowUpDate = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
            ? e.callInfo[e.callInfo.length - 1]?.nextFollowUpdate 
            : e.callInfo[0]?.nextFollowUpdate : '-' 
          const callNextRemark = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
            ? e.callInfo[e.callInfo.length - 1]?.remark 
            : e.callInfo[0]?.remark : '-'

          x += `<tr data-id="${e._id}">
                  <td><input type="checkbox" class="checkbox_child" value="${e._id}" /></td>
                  <td>${capitalizeFirstLetter(e?.leadName) || '-'}</td>
                  <td>${e?.designation || '-'}</td>
                  <td>${e?.department}</td> <!-- Display the first email only -->
                  <td>${e?.company || '-'}</td>
              <td>${formatDate(callDate) || '-'}</td> <!-- Display the call date -->
                                    <td>${formatDate(callNextFollowUpDate) || '-'}</td> <!-- Display the call status -->

                  <td class="text-truncate" style="max-width:150px;">${callNextRemark}</td> <!-- Display the call status -->
                  <td>-</td>
                  <td class="d-flex justify-content-center"><a onclick="getFollowUpId('${e?._id}')" href="#" style="min-width:60px;" data-bs-toggle="modal" data-bs-target="#editFollowups" class="btn rounded add-btn hr_restriction employee_restriction" ><i class="fa-solid fa-pencil text-white"></i></a></td>
              <td class="text-end">
                  <div class="dropdown dropdown-action">
                      <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                      <div class="dropdown-menu dropdown-menu-right">
                          <a href="lead-view.html?id=${e?._id}" class="dropdown-item"><i class="fa-regular fa-eye"></i> hello View</a>
                          <a href="edit-lead.html?id=${e?._id}" class="dropdown-item"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                          <a class="dropdown-item" onclick="individual_delete('${e?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
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
  
  // =================================================================================
  // Lead dashboard data - table - load
  async function all_data_load_dashboard() {
    try {
      loading_shimmer(); // Show shimmer while loading
    } catch (error) {
      console.error(error);
    }
  
    const tableData = document.getElementById("leadData");
    tableData.innerHTML = ''; // Clear the table data
    let x = ""; // Variable to store HTML rows
  
    try {
      // Fetch the leads data from the API
      const response = await fetch(`${lead_API}/getAll${rtnPaginationParameters()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
        const res = await response.json();
       setTotalDataCount(res?.pagination?.totalLeads); // Update pagination count
// console.log(res?.pagination?.totalLeads)
      const leads = res?.data;
  
      if (leads.length > 0) {
        for (const e of leads) {
          // Debugging the raw email field
          // console.log('Raw Email Field:', e?.email);
      
          // Extract the first email
          const firstEmail = Array.isArray(e?.email)
            ? (typeof e?.email[0] === 'string' && e?.email[0].includes(',')
                ? e?.email[0].split(',')[0].trim() // Split and trim if comma-separated
                : e?.email[0]) // Take the first item if no comma
            : '-'; // Fallback for missing email
      
          // Extract callInfo data
          const callDate = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
          ? e.callInfo[e.callInfo.length - 1]?.date 
          : e.callInfo[0]?.date 
          : '-';
          const callStatus = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
            ? e.callInfo[e.callInfo.length - 1]?.status 
            : e.callInfo[0]?.status 
          : '-'; 
          const callNextFollowUpDate = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
            ? e.callInfo[e.callInfo.length - 1]?.nextFollowUpdate 
            : e.callInfo[0]?.nextFollowUpdate : '-' 
          const callNextRemark = e?.callInfo?.length > 0 
          ? e.callInfo.length > 1 
            ? e.callInfo[e.callInfo.length - 1]?.remark 
            : e.callInfo[0]?.remark : '-'

          // Debugging extracted callInfo fields
          // console.log('Call Date:', callDate);
          // console.log('Call Status:', callStatus);

//           let enqRight;
// let entry = enquiryRightHistory.find(entry => entry.enquiryRightId == e._id);
// if (entry) {
//   enqRight = entry.enquiryRight;
// }
      
          // Generate table row HTML
          x += `<tr data-id="${e._id}">
                  <td><input type="checkbox" class="checkbox_child" value="${e._id}" /></td>
                  <td>${capitalizeFirstLetter(e?.leadName) || '-'}</td>
                  <td>${e?.designation || '-'}</td>
                  <td>${e?.department}</td> <!-- Display the first email only -->
                  <td>${e?.company || '-'}</td>
                  <td>${formatDate(callDate) || '-'}</td> <!-- Display the call date -->
                                    <td>${formatDate(callNextFollowUpDate) || '-'}</td> <!-- Display the call status -->

                  <td class="text-truncate" style="max-width:150px;">${callNextRemark}</td> <!-- Display the call status -->
                  <td>${e.enquiryStatus || '-'}</td>
                  <td class="d-flex justify-content-center"><a onclick="getFollowUpId('${e?._id}')" href="#" style="min-width:60px;" data-bs-toggle="modal" data-bs-target="#editFollowups" class="btn rounded add-btn hr_restriction employee_restriction" ><i class="fa-solid fa-pencil text-white"></i></a></td>
                   <td class="text-end">
                      <div class="dropdown dropdown-action">
                          <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="material-icons">more_vert</i>
                          </a>
                          <div class="dropdown-menu dropdown-menu-right">
                              <a href="lead-view.html?id=${e?._id}" class="dropdown-item">
                                <i class="fa-regular fa-eye"></i> View
                              </a>
                              <a href="edit-leads.html?id=${e?._id}" class="dropdown-item">
                                <i class="fa-solid fa-pencil m-r-5"></i> Edit
                              </a>
                              
                              <a class="dropdown-item" onclick="individual_delete('${e?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data">
                                <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                              </a>
                          </div>
                      </div>
                  </td>
                </tr>`;
        }
        tableData.innerHTML = x; // Insert rows into the table
      } else {
        x = `<tr><td colspan="8" class="text-center">No data found</td></tr>`;
        tableData.innerHTML = x;
      }
      
      
       
    } catch (error) {
      // Handle errors gracefully
      x = `<tr><td colspan="8" class="text-center">An error occurred while loading data</td></tr>`;
      tableData.innerHTML = x;
      console.error("Error loading leads data:", error);
    } finally {
      try {
        checkbox_function(); // Initialize checkboxes
        remove_loading_shimmer(); // Hide shimmer
      } catch (error) {
        console.error(error);
      }
      try {
        main_hidder_function(); // Execute additional UI updates
      } catch (error) {
        console.error(error);
      }
    }
  }
  
  
  
  
  // On page load, load lead data for the dashboard
  all_data_load_dashboard();
  objects_data_handler_function(all_data_load_dashboard);

  let followUpId;
  window.getFollowUpId = function getFollowUpId(id){
    followUpId = id;
  }

  let username = localStorage.getItem('User_name');
  let userName = document.getElementById("createdByFollowUp")
  userName.value = username;
  let addFollowAddEnquiryUpBtn = document.getElementById('addFollowAddEnquiryUpBtn');
  let addFollowUpBtn = document.getElementById('addFollowUpBtn');
  addFollowAddEnquiryUpBtn.addEventListener('click',(event)=>{
    event.preventDefault();
    if (!validatorFollowUp()) {
      return;
    }
    addFollowUpForm()
    const leadId = encodeURIComponent(followUpId); 
    setTimeout(() => {
      window.location.href = `add-enquiry.html?id=${leadId}`
    }, 3000);
  })
  addFollowUpBtn.addEventListener('click',(event)=>{
    event.preventDefault();
    addFollowUpForm()
  })

  const add_FollowUp_form = document.getElementById('add_FollowUp_form');
  // add_FollowUp_form.addEventListener('submit',async(event)=>{
    // event.preventDefault();
  async function addFollowUpForm(){
    if (!validatorFollowUp()) {
      return;
    }
    try{
      document.querySelectorAll(".btn-close").forEach(e=>e.click());
    } catch(error){console.log(error)}
    try {
      loading_shimmer();
      let _id = followUpId;
      let callInfo =[{
        createdByFollowUp:document.getElementById('createdByFollowUp').value,
        date: document.getElementById('follow-up-date').value,
        nextFollowUpdate: document.getElementById('follow-up-next-date').value,
        remark: document.getElementById('follow-up-remark').value,
        status: document.getElementById('follow-up-status').value
      }]
      // callInfo.push(callInformation)
      console.log("Request body:", { _id, callInfo });
      const response = await fetch(`${lead_API}/followUp/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({_id,callInfo}),
      });
      const res = await response.json()
      console.log('my response: ',res)
      const c1=response.ok
      if(response.ok){
        status_popup("Data Added <br> Successfully", true);
        all_data_load_dashboard();
        add_FollowUp_form.reset();
      }
      else{
        status_popup("Please try <br> again later", false );
      }
    } catch (error) {
      console.log('Error is ',error);
    }
    finally{
      remove_loading_shimmer();
    }
  }

  // Validate Add Follow Up 

  function validatorFollowUp() {
    // Clear previous errors
    clearErrors();

    let isValid = true;

    let callInfo =[{
      createdByFollowUp:document.getElementById('createdByFollowUp').value,
      date: document.getElementById('follow-up-date').value,
      nextFollowUpdate: document.getElementById('follow-up-next-date').value,
      remark: document.getElementById('follow-up-remark').value,
      status: document.getElementById('follow-up-status').value
    }]

    // Validate Follow-Up Date
    if (!callInfo[0].date) {
        showError(document.getElementById('follow-up-date'), 'Follow-up date is required');
        isValid = false;
    }

    // Validate Next Follow-Up Date
    if (!callInfo[0].nextFollowUpdate) {
        showError(document.getElementById('follow-up-next-date'), 'Next follow-up date is required');
        isValid = false;
    }

        if (callInfo[0].nextFollowUpdate < callInfo[0].date) {
            showError(document.getElementById('follow-up-next-date'), 'Next follow-up date cannot less than date');
            isValid = false;
        }
    

    // Validate Follow-Up Remark
    if (!callInfo[0].remark) {
        showError(document.getElementById('follow-up-remark'), 'Remark is required');
        isValid = false;
    }

    // Validate Follow-Up Status
    if (!callInfo[0].status) {
        showError(document.getElementById('follow-up-status'), 'Please select a follow-up status');
        isValid = false;
    }
 

    return isValid;
  }
  
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
// --------------------------------------------------------------------------------------------------
function clearErrors() {
  const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
  errorMessages.forEach((msg) => msg.remove());
}
  