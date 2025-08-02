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
  import { enquiry_API, global_search_API, } from './apis.js';
//   import { rtnPaginationParameters, setTotalDataCount } from './globalFunctionPagination.js';
  import { individual_delete, objects_data_handler_function } from './globalFunctionsDelete.js';
  import { main_hidder_function } from './gloabl_hide.js';
  
  window.individual_delete = individual_delete;
  // =================================================================================
  const token = localStorage.getItem('token');
  import {} from "./globalFunctionsImport.js";
  import {} from "./globalFunctionsExport.js";
import { rtnPaginationParameters, setTotalDataCount } from './globalFunctionPagination.js';
  // =================================================================================

  // =================================================================================
 // Search Functionality
  // =================================================================================
  // Function to handle search and update the same table
  async function handleSearch() {
      const searchFields = ["enquiryTitle"]; // IDs of input fields
      // const searchField = document.getElementById('enquiryName').value?.trim()
      const searchType = "enquiry"; // Type to pass to the backend
      
      const tableData = document.getElementById("enquiryData");
      let x = ''; // Initialize rows content
  
      try {
          loading_shimmer(); 
  
          // Construct query parameters for the search
          const queryParams = new URLSearchParams({ type: searchType });
          searchFields.forEach((field) => {
            const value = document.getElementById(field)?.value?.trim();
            if (value) queryParams.append(field, value);
        });          
  
          // Send search request
         
          const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
          });
  
          const res = await response.json();
          // debugger;
  
          if (response.ok && res.data?.length > 0) {
              // Generate table rows dynamically
              const rows = res.data.map((enquiry) => {
                  return `<tr data-id="${enquiry._id}">
            <td><input type="checkbox" class="checkbox_child" value="${enquiry._id}" /></td>
            <td>${enquiry?.enquiryTitle ||   '-'}</td>
            <td> ${enquiry?.offers[0]?.offerReferenceNumber || '-'}
</td>
            <td>${formatDate(enquiry?.enquiryDate)}</td> <!-- Display the first email only -->
            <td>
            ${formatDate(enquiry?.offers[0]?.offerDate) ||  '-'}
            </td>
  
            <td class="text-truncate" style="max-width:150px;">${enquiry.detailOfEnquiry}</td> <!-- Display the call status -->
             <td class="text-end">
                <div class="dropdown dropdown-action">
                    <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="material-icons">more_vert</i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a href="enquiry-view.html?_id=${enquiry?._id}" class="dropdown-item">
                          <i class="fa-regular fa-eye"></i> View
                        </a>
                        <a href="edit-enquiry.html?_id=${enquiry?._id}" class="dropdown-item">
                          <i class="fa-solid fa-pencil m-r-5"></i> Edit
                        </a>
                        
                        <a class="dropdown-item" onclick="individual_delete('${enquiry?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data">
                          <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                        </a>
                    </div>
                </div>
            </td>
          </tr>`;
              });
  
              tableData.innerHTML = rows.join(''); // Insert rows into the table
          } else {
              x = `<tr><td colspan="9" class="text-center">No results found</td></tr>`;
          }
      } catch (error) {
          console.error("Error during search:", error);
          x = `<tr><td colspan="9" class="text-center">An error occurred during search</td></tr>`;
      } finally {
          if (x) tableData.innerHTML = x; // If no data, show message
          checkbox_function(); // Reinitialize checkboxes
          remove_loading_shimmer(); // Remove shimmer loader
      }
  }
  // Attach the search function to the search button
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch(); // Trigger search
}); 
  
  // =================================================================================
  // Enquiry dashboard data - table - load

 
async function all_data_load_dashboard() {
    try {
      loading_shimmer(); // Show shimmer while loading
    } catch (error) {
      console.error(error);
    }
  
    const tableData = document.getElementById("enquiryData");
    tableData.innerHTML = ''; // Clear the table data
    let x = ""; // Variable to store HTML rows
  
    try {
      // Fetch the leads data from the API
      const r = await fetch(`${enquiry_API}/getAll${rtnPaginationParameters()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const res = await r.json();
      const enquiry = res?.enquiry || [];  // Safely access the enquiry data
      setTotalDataCount(res.pagination.totalRecords);
      console.log(enquiry)
      if (enquiry.length > 0) {
        enquiry.map((e, i) => {
          x += `<tr data-id="${e._id}">
            <td><input type="checkbox" class="checkbox_child" value="${e._id}" /></td>
            <td>${e?.enquiryTitle  || '-'}</td>
            <td>${e?.offers[0]?.offerReferenceNumber || '-'}</td>
            <td>${formatDate(e?.enquiryDate)}</td> <!-- Display the first email only -->
            <td>${formatDate(e?.offers[0]?.offerDate) || '-'}</td>
  
            <td class="text-truncate" style="max-width:150px;">${e.detailOfEnquiry}</td> <!-- Display the call status -->
             <td class="text-end">
                <div class="dropdown dropdown-action">
                    <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="material-icons">more_vert</i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a href="enquiry-view.html?_id=${e?._id}" class="dropdown-item">
                          <i class="fa-regular fa-eye"></i> View
                        </a>
                        <a href="edit-enquiry.html?_id=${e?._id}" class="dropdown-item">
                          <i class="fa-solid fa-pencil m-r-5"></i> Edit
                        </a>
                        
                        <a class="dropdown-item" onclick="individual_delete('${e?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data">
                          <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                        </a>
                    </div>
                </div>
            </td>
          </tr>`;
        });
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
    }
  }
  
  // On page load, load lead data for the dashboard
  all_data_load_dashboard();
  
  objects_data_handler_function(all_data_load_dashboard);

  
  