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
import { purchaseOrder_API , global_search_API } from "./apis.js";
import { loading_shimmer, remove_loading_shimmer,status_popup } from "./globalFunctions1.js";
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


 // Function to handle search and update the same table
//  async function handleSearch() {
//     const searchFields = ["material", "purchaseOrderDate"]; // IDs of input fields
//     const searchType = "purchase"; // Type to pass to the backend
//     const tableData = document.getElementById("purchaseOrderTableData");
//     let x = ''; // Initialize rows content

//     try {
//         loading_shimmer(); // Show shimmer while fetching data

//         // Construct query parameters for the search
//         const queryParams = new URLSearchParams({ type: searchType });
//         searchFields.forEach((field) => {
//             const value = document.getElementById(field)?.value?.trim();
//             if (value) queryParams.append(field, value);
//         });

//         console.log("Query Parameters:", queryParams.toString()); // Debug log

//         // Fetch search results from API
//         const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//         });

//         const res = await response.json();

//         if (response.ok && res.data?.length > 0) {
//             // Loop through results and generate table rows
//             res.data.forEach((e) => {
//                 x += `<tr data-id="${e._id}">
//                     <td><input type="checkbox" class="checkbox_child" value="${e._id}" /></td>
//                     <td>${capitalizeFirstLetter(e?.projectName) || '-'}</td>
//                     <td>${e?.projectId || '-'}</td>
//                     <td>${e?.clientName?.name ? `${capitalizeFirstLetter(e?.clientName?.name)} (${e?.clientName?.userId || '-'})` : '-'}</td>
//                     <td>${e?.assignedTo?.name ? `${capitalizeFirstLetter(e?.assignedTo?.name)} (${e?.assignedTo?.userId || '-'})` : '-'}</td>
//                     <td>${formatDate(e?.deadline) || '-'}</td>
//                     <td>${capitalizeFirstLetter(e?.status) || '-'}</td>
//                     <td class="text-end">
//                         <div class="dropdown dropdown-action">
//                             <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
//                             <div class="dropdown-menu dropdown-menu-right">
//                                 <a href="project-view.html?id=${e?._id}" class="dropdown-item"><i class="fa-regular fa-eye"></i> View</a>
//                                 <a href="edit-project.html?id=${e?._id}" class="dropdown-item hr_restriction employee_restriction"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
//                                 <a class="dropdown-item hr_restriction employee_restriction" onclick="individual_delete('${e?._id}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
//                             </div>
//                         </div>
//                     </td>
//                 </tr>`;
//             });
//         } else {
//             // Display a message when no results are found
//             x = `<tr><td colspan="8" class="text-center">No results found</td></tr>`;
//         }
//     } catch (error) {
//         console.error("Error during search:", error);
//         x = `<tr><td colspan="8" class="text-center">An error occurred during search</td></tr>`;
//     } finally {
//         // Update the table with results or error message
//         tableData.innerHTML = x;
//         checkbox_function(); // Reinitialize checkboxes
//         remove_loading_shimmer(); // Hide shimmer loader
//     }
// }

// // Event listener for search button
// document.getElementById("searchButton").addEventListener("click", (e) => {
//     e.preventDefault();
//     handleSearch(); // Trigger search
// });
 

// var res;
async function all_data_load_dashboard() {
  try {
    loading_shimmer();
  } catch (error) {
    console.log(error);
  }
  // ----------------------------------------------------------------------------------------------------

  let purchaseOrderTableData = document.getElementById("purchaseOrderTableData");
  const response = await fetch(`${purchaseOrder_API}/getAll${rtnPaginationParameters()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let r2 = await response.json();
  let res = r2?.purchases;
  console.log(res);
  setTotalDataCount(r2?.pagination.totalRecords);


  var x = "";
  for (var i = 0; i < res.length; i++) {
    var e = res[i];
    x += `<tr data-id="${e._id}">
            <td class="width-thirty"><input type="checkbox" class="checkbox_child" value="${
              e?._id || "-"
            }"></td>
                    <td>${i + 1}</td>
                    <td>${e?.material?.material? e.material.material : '-'}</td>
                    <td>${e.purchasePurpose || '-'}</td> 
                    <td>${e?.purchaseVendor?.vendorName? e.purchaseVendor.vendorName : '-'}</td>
                    <td>${e.quantity || '-'}</td>
                   <td>${formatDate(e.purchaseOrderDate) || "-"}</td>

                    <td class="d-flex justify-content-center"><a onclick="getPurchaseOrderId('${e?._id}')" href="#" style="min-width:60px;" data-bs-toggle="modal" data-bs-target="#createInvoice" class="btn rounded add-btn hr_restriction employee_restriction" ><i class="fa-solid fa-pencil text-white"></i></a></td>
                    <td class="text-end">
                      <div class="dropdown dropdown-action">
                        <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false"><i class="material-icons">more_vert</i></a>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item" href="purchase-order-view.html?id=${ e._id}">
                          <i class="fa-solid fa-eye m-r-5"></i> View</a>
                          <a class="dropdown-item employee_restriction" href="edit-purchase-order.html?id=${e._id}">
                          <i class="fa-solid fa-pencil m-r-5"></i>
                            Edit</a>
                              <a class="dropdown-item employee_restriction" onclick="individual_delete('${
                                e?._id
                              }')" data-bs-toggle="modal" data-bs-target="#delete_data">
                            <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                        </a>
                        </div>
                      </div>
                    </td>
                  </tr>`;
  }
  purchaseOrderTableData.innerHTML = x;
  checkbox_function();

  // ----------------------------------------------------------------------------------------------------
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.log(error);
  }
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
}


// Add API for the Purchase Invoice ============================================
let purchaseOrderId;
window.getPurchaseOrderId = function getPurchaseOrderId(id){
  console.log('this is my purchase order id: ',id);
  purchaseOrderId = id
}

document
  .getElementById("createInvoiceFform")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    try{
      Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
  } catch(error){console.log(error)}

    try {
      loading_shimmer(); // Show loading shimmer
      let formData = new FormData();

      const files = document.getElementById("document").files;
  for (const file of files) {
    formData.append("file", file);
  }
  
  let purchaseId = purchaseOrderId
  formData.append("invoiceDate", document.getElementById('createInvoiceDate').value);
  // formData.append("invoiceNo", document.getElementById('createInvoiceNumber').value);
  formData.append("invoiceValue", document.getElementById('createInvoiceValue').value);
  formData.append("remark", document.getElementById('follow-up-remark').value);
  formData.append("purchaseId", purchaseId);

      // Submit data to the server
      const response = await fetch(`${purchaseOrder_API}/invoice/post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();
      console.log("Purchase Order Response: ", res);

      if (!response.ok) throw new Error(res.message || "Failed to add purchase order");

      status_popup("Purchase Invoice Created Successfully!", true);
      setTimeout(() => {
        window.location.href = "purchase-order-list.html";
      }, Number(document.getElementById("b1b1").innerText) * 1000);
    } catch (error) {
      console.error("Error creating purchase Invoice:", error);
      status_popup("Error adding Purchase Invoice. Please try again.", false);
    } finally {
      remove_loading_shimmer(); // Hide loading shimmer
    }
  });

  // On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);
