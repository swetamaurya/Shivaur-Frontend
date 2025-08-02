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
  import { formatDate } from './globalFunctions2.js'
  import {  global_search_API, user_API, invoice_API } from './apis.js';
  // -------------------------------------------------------------------------
  import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
  window.individual_delete = individual_delete;
  // -------------------------------------------------------------------------
  import {main_hidder_function} from './gloabl_hide.js';  
  // -------------------------------------------------------------------------
  import {} from "./globalFunctionsExport.js";
  import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';

  // =================================================================================
  const token = localStorage.getItem('token');
  // =========================================================================================
  // =========================================================================================
// Function to handle search and update the same table
async function handleSearch() {
  const searchFields = ["invoiceId", "name"]; // IDs of input fields
  const searchType = "Invoice"; // Type to pass to the backend
  const tableData = document.getElementById("tableData");
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
      const invoices = res.data;
      invoices.forEach((e, index) => {
        tableContent += `
          <tr data-id="${e._id}">
            <td class="width-thirty"><input type="checkbox" class="checkbox_child" value="${e?._id || '-'}"></td>
            <td>${index + 1}</td>
            <td>${e.invoiceId}</td>
    <td>${e?.client?.name || ''} (${e?.client?.userId})</td>
            <td>${formatDate(e.invoiceDate)}</td>
            <td>${formatDate(e.dueDate)}</td>
            <td>₹ ${Number(e.GrandTotal).toFixed(2)}</td>
            <td class="text-end">
              <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"
                  aria-expanded="false"><i class="material-icons">more_vert</i></a>
                <div class="dropdown-menu dropdown-menu-right">
                 <a class="dropdown-item" href="invoice-view.html?id=${e._id}">
                    <i class="fa-solid fa-eye m-r-5"></i> View
                  </a>
                  <a class="dropdown-item  hr_restriction" href="edit-invoice.html?id=${e._id}">
                    <i class="fa-solid fa-pencil m-r-5"></i> Edit
                  </a>
                 
                  <a class="dropdown-item  hr_restriction" onclick="individual_delete('${e._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                    <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                  </a>
                </div>
              </div>
            </td>
          </tr>`;
      });
    } else {
      // If no results found, display a "No results" message
      tableContent = `<tr><td colspan="8" class="text-center">No results found</td></tr>`;
    }
  } catch (error) {
    console.error("Error during search:", error);
    // Handle error scenario
    tableContent = `<tr><td colspan="8" class="text-center">An error occurred during search</td></tr>`;
  } finally {
    // Update the table with results or error message
    tableData.innerHTML = tableContent;
    checkbox_function(); // Reinitialize checkboxes
    remove_loading_shimmer(); // Remove loading shimmer
  }
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
}


// =======================================================================================
// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch(); // Trigger search
});

 
  
let cachedClients = [];
try {
    const response = await fetch(`${user_API}/data/get`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const res = await response.json();
    cachedClients = res?.users?.clients;
    
    console.log(cachedClients);
}
catch(error){
    console.error('Error fetching data:', error);
}
function rtnCltNm(nm){
  let data = cachedClients.find(d=> d._id == nm);
  let name = data?.name;
  let cltid = data?.userId;

  return `${name} (${cltid})`;
}
// =================================================================================

async function all_data_load_dashboard() {
  try{
    loading_shimmer();
  } catch(error){console.log(error)}
    
  var tableData = document.getElementById('tableData');
  const response = await fetch(`${invoice_API}/get${rtnPaginationParameters()}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
  })
  let r2 = await response.json();

  let res = r2?.data;
  setTotalDataCount(r2?.totalInvoices);

  var x = '';
  for (var i = 0; i < res.length; i++) {
    var e = res[i]
    console.log(e?.client)
    x += `<tr data-id="${e._id}">
    <td class="width-thirty"><input type="checkbox" class="checkbox_child" value="${e?._id || '-'}"></td>
    <td>${i + 1}</td>
    <td>${e.invoiceId}</td>
    <td>${e?.client?.name || ''} (${e?.client?.userId})</td>
    <td>${formatDate(e.invoiceDate)}</td>
    <td>${formatDate(e.dueDate)}</td>
    <td>₹ ${Number(e.GrandTotal).toFixed(2)}</td>
    <td class="text-end">
              <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"
                  aria-expanded="false"><i class="material-icons">more_vert</i></a>
                <div class="dropdown-menu dropdown-menu-right">
                     <a class="dropdown-item" href="invoice-view.html?id=${e._id}"><i class="fa-solid fa-eye m-r-5"></i>
                    View</a>

                <a class="dropdown-item hr_restriction" href="edit-invoice.html?id=${e._id}"><i class="fa-solid fa-pencil m-r-5"></i>
                    Edit</a>
                  

                  <a class="dropdown-item hr_restriction" onclick="individual_delete('${e?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                    <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                </a>
                </div>
              </div>
            </td>
    </td></tr>`
  }
  tableData.innerHTML = x;
  checkbox_function();

  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
}

all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);