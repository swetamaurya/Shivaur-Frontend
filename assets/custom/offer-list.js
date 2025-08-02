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
import { enquiry_API, offer_API ,global_search_API } from "./apis.js";
import { loading_shimmer, remove_loading_shimmer, status_popup } from "./globalFunctions1.js";
import { checkbox_function } from "./multi_checkbox.js";
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
// =================================================================================
import { individual_delete, objects_data_handler_function} from "./globalFunctionsDelete.js";
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
import {} from "./globalFunctionsExport.js";
// ------------------------------------------------------------------------------------
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// =================================================================================
const token = localStorage.getItem("token");
// get API for Estimate start


async function handleSearch() {
  const searchFields = ["offerTitle"]; // IDs of input fields
  const searchType = "offer"; // Type to pass to the backend
  const productTable = document.getElementById("offerData"); // Product table body
  let tableContent = ''; // Initialize table content

  try {
    loading_shimmer(); // Display shimmer during loading
  } catch (error) {
    console.error("Error showing shimmer:", error);
  }

  try {
    // Build query parameters
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
    setTotalDataCount(res?.totalPages);

    const offers = res?.data || [];
    // Loop through products to populate table rows
    let tableRows = "";
    for (const offer of offers) {
      const enquiry = offer.enquiry || {}; // Default to empty object if `enquiry` is null
      tableRows += `<tr data-id="${offer._id}">
              <td class="width-thirty">
                <input type="checkbox" class="checkbox_child" value="${offer._id || "-"}">
              </td>
<td>${offer.offerReferenceNumber || '-'}</td>
                <td>${offer.offerTitle ||   "-"}</td>
                <td>${formatDate(offer.createdAt)}</td>
                <td>${offer?.company?.POSDetails?.[0]?.POSName ?? enquiry?.company?.POSDetails?.[0]?.POSName ?? "-"}
</td>
                <td>${offer.emd_Status || enquiry.emd_Status ||"-"}</td>
               <td><button class="btn btn-sm rounded add-btn" onclick="offerEditDynamicFn('${offer._id}')" data-bs-toggle="modal" data-bs-target="#emd_modal" ><i class="fa-solid fa-pencil text-white"></i></button> </td>               
                <td class="text-end">
                  <div class="dropdown dropdown-action">
                    <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                    <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" href="offer-view.html?id=${offer._id}"><i class="fa-solid fa-eye m-r-5"></i> View</a>
                      <a class="dropdown-item employee_restriction" href="edit-offer.html?id=${offer._id}"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                      <a class="dropdown-item employee_restriction" onclick="individual_delete('${offer._id}')" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                    </div>
                  </div>
                </td>
          </tr>`;
    }
    productTable.innerHTML = tableRows;
    checkbox_function();
  } catch (error) {
    console.error("Error during search:", error);
    productTable.innerHTML = `<tr><td colspan="7" class="text-center">An error occurred during search</td></tr>`;
  } finally {
    // Ensure the shimmer is always removed
    try {
      remove_loading_shimmer();
    } catch (error) {
      console.error("Error hiding shimmer:", error);
    }
    try {
      main_hidder_function();
    } catch (error) {
      console.error("Error running main hidder function:", error);
    }
  }
}


// Attach the search function to the search button
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch(); // Trigger search on button click
});
 
// Load offer data for the dashboard
async function all_data_load_dashboard() {
  try {
    loading_shimmer();
  } catch (error) {
    console.error("Error showing shimmer:", error);
  }

  // Fetch offer data
  const policyTableData = document.getElementById("offerData");
  const response = await fetch(`${offer_API}/getAll${rtnPaginationParameters()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const r2 = await response.json();
  setTotalDataCount(r2.pagination.totalRecords);
  const offers = r2?.offers || [];
  console.log("Offers:", offers);

  // Populate table rows
  let tableRows = "";
  for (const offer of offers) {
    const enquiry = offer.enquiry || {}; // Default to empty object if `enquiry` is null
    tableRows += `<tr data-id="${offer._id}">
            <td class="width-thirty">
              <input type="checkbox" class="checkbox_child" value="${offer._id || "-"}">
            </td>
                <td>${offer.offerReferenceNumber || '-'}</td>
                <td>${offer.offerTitle ||   "-"}</td>
                <td>${formatDate(offer.createdAt)}</td>
                <td>${offer?.company?.POSDetails?.[0]?.POSName ?? enquiry?.company?.POSDetails?.[0]?.POSName ?? "-"}
</td>
                <td>${offer.emd_Status || enquiry.emd_Status ||"-"}</td>
                <td><button class="btn btn-sm rounded add-btn" onclick="offerEditDynamicFn('${offer._id}')" data-bs-toggle="modal" data-bs-target="#emd_modal" ><i class="fa-solid fa-pencil text-white"></i></button> </td>               
                <td class="text-end">
                  <div class="dropdown dropdown-action">
                    <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                    <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" href="offer-view.html?id=${offer._id}"><i class="fa-solid fa-eye m-r-5"></i> View</a>
                      <a class="dropdown-item employee_restriction" href="edit-offer.html?id=${offer._id}"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                      <a class="dropdown-item employee_restriction" onclick="individual_delete('${offer._id}')" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                    </div>
                  </div>
                </td>
          </tr>`;
  }
  policyTableData.innerHTML = tableRows; 
  checkbox_function();

  // Clean up and UI adjustments
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.error("Error hiding shimmer:", error);
  }
  try {
    main_hidder_function();
  } catch (error) {
    console.error("Error running main hidder function:", error);
  }
}

// On page load, load offer data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);

// =================================================================================================================
// =================================================================================================================

window.offerEditDynamicFn = async function(offerId){
  try {
    loading_shimmer();
    document.getElementById("_hidden_id_no_offer_list").value = offerId;
    console.log("_hidden_id_no_offer_list:- ",document.getElementById("_hidden_id_no_offer_list"))
  } catch (error) {
    console.error("Error showing shimmer:", error);
  }
  try{
    const response = await fetch(`${offer_API}/get?id=${offerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }, 
    });
    const res = await response.json();

    let EMDDetails = res?.offer?.EMD || '-';
    let emd_status = res?.offer?.emd_Status || 'No';

    try{
      document.getElementById("emdSectionCondition").value = emd_status;

      let emdForm = document.getElementById("formModelEmdSection");
      if (emd_status === "Yes") {
        emdForm.classList.remove("d-none");
        emdForm.querySelector("input[type='text']").value = EMDDetails?.emdAmount || '';
        emdForm.querySelector("input[type='date']").value = EMDDetails?.emdDate || '';
        emdForm.querySelector("textarea").value = EMDDetails?.emdRemark || '';
        
      } else {
        emdForm.classList.add("d-none");
        emdForm.reset();
      }
    } catch(error){
      console.log(error)
    }

  } catch (error){
    console.log(error)
  }
  
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.error("Error hiding shimmer:", error);
  }
}


// =================================================================================================================
// =================================================================================================================

document.getElementById("emdSectionCondition").addEventListener("change", async function() {
  try {
    loading_shimmer();
  } catch (error) {
    console.error("Error showing shimmer:", error);
  }
  try{
    let condYesOrNo = this.value;
    let emdForm = document.getElementById("formModelEmdSection");
    if (condYesOrNo === "Yes") {
      emdForm.classList.remove("d-none");
    } else {
      emdForm.classList.add("d-none");

      try{
        const response = await fetch(`${offer_API}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            'id' : document.getElementById("_hidden_id_no_offer_list").value,
            'emd_Status': 'No',
            'EMD': null
          }),
        });
        // ------------------------------------------------------------------------------------------------------
        const c1 = (response.ok);
        Array.from(document.querySelectorAll(".btn-close")).forEach(e=>e.click()); 
        try{
            status_popup( ((c1) ? "Offer Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
        } catch (error){
          status_popup( ("Please try <br> again later"), (false) );
        }
      } catch(error){console.log(error)}
      all_data_load_dashboard();     
    }
  } catch (error){
    console.log(error)
  }
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.error("Error hiding shimmer:", error);
  }
});

// =================================================================================================================

let emdFormDynamicModal = document.getElementById("formModelEmdSection");
emdFormDynamicModal.addEventListener("submit", async function(event){
  event.preventDefault();
  try {
    loading_shimmer();
  } catch (error) {
    console.error("Error showing shimmer:", error);
  }
  try{
    const response = await fetch(`${offer_API}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        'id' : document.getElementById("_hidden_id_no_offer_list").value,
        'emd_Status': 'Yes',
        'EMD': {
          'emdAmount': emdFormDynamicModal.querySelector("input[type='text']").value.trim(),
          'emdDate': emdFormDynamicModal.querySelector("input[type='date']").value.trim(),
          'emdRemark': emdFormDynamicModal.querySelector("textarea").value.trim(),
        }
      }),
    });
    // ------------------------------------------------------------------------------------------------------
    const c1 = (response.ok);
    Array.from(document.querySelectorAll(".btn-close")).forEach(e=>e.click()); 
    try{
        status_popup( ((c1) ? "Offer Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
    } catch (error){
      status_popup( ("Please try <br> again later"), (false) );
    }
    all_data_load_dashboard();
  } catch(error){console.log(error)}
  
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.error("Error hiding shimmer:", error);
  }
})





