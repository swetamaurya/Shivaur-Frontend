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
import { purchaseOrder_API } from "./apis.js";
import { loading_shimmer, remove_loading_shimmer,status_popup } from "./globalFunctions1.js";
import { checkbox_function } from "./multi_checkbox.js";
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
// =================================================================================
import { individual_delete, objects_data_handler_function} from "./globalFunctionsDelete.js";
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
// ------------------------------------------------------------------------------------
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// =================================================================================
const token = localStorage.getItem("token");
// get API for Estimate start

// var res;
async function all_data_load_dashboard() {
  try {
    loading_shimmer();
  } catch (error) {
    console.log(error);
  }
  // ----------------------------------------------------------------------------------------------------

//   const url = 'https://shivaur-backend.onrender.com/invoice/getAll'
  let purchaseInvoiceTableData = document.getElementById("purchaseInvoiceTableData");
  const response = await fetch(`${purchaseOrder_API}/invoice/getAll${rtnPaginationParameters()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let r2 = await response.json();
  let res = r2?.purchaseInvoice ;
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
                    <td>${e.invoiceNo || '-'}</td> 
                    <td>${e?.purchase?.material?.material? e?.purchase?.material?.material : '-'}</td>
                    <td>${formatDate(e?.invoiceDate? e.invoiceDate : '-')}</td>
                    <td>${e?.purchase?.purchaseVendor?.vendorName? e?.purchase?.purchaseVendor?.vendorName : '-'}</td>
                    <td>${e?.invoiceValue? e.invoiceValue : '-'}</td>
                    <td class="text-end">
                      <div class="dropdown dropdown-action">
                        <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false"><i class="material-icons">more_vert</i></a>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item" href="purchase-invoice-view.html?id=${ e._id}">
                          <i class="fa-solid fa-eye m-r-5"></i> View</a>
                          <a class="dropdown-item" onclick="handleClickOnEditPurchaseInvoice('${e?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#editPurchaseInvoice">
                                <i class="fa-solid fa-pencil m-r-5"></i> Edit
                            </a>
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
  purchaseInvoiceTableData.innerHTML = x;
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

// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);

// Add API for the Purchase Invoice ============================================
let purchaseOrderId;
window.handleClickOnEditPurchaseInvoice = async function handleClickOnEditPurchaseInvoice(id){
  console.log('this is my purchase order id: ',id);
  purchaseOrderId = id;
  let _id = id;
  let invoiceDate = document.getElementById('createInvoiceDate')
  // let invoiceNo = document.getElementById('cc');
  let invoiceNumber = document.getElementById('createInvoiceNumber')
  let invoiceValue =  document.getElementById('createInvoiceValue')
  let remark = document.getElementById('follow-up-remark')
  try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
  
    try{
      const response = await fetch(`${purchaseOrder_API}/invoice/get?_id=${_id}`, { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if(!response.ok){
        throw new Error();
      }
      let r2 = await response.json();
      console.log("broror :-- ",r2)  
      let invoice = r2.invoice
      invoiceDate.value = invoice.invoiceDate
      invoiceNumber.value = invoice.invoiceNo
      invoiceValue.value = invoice.invoiceValue;
      remark.value = invoice.remark;
    } catch(error){
      // window.location.href = 'product-list.html';
      console.log('the error is ',error);
    }
    // ----------------------------------------------------------------------------------------------------
    finally{
      remove_loading_shimmer();
    }
  
}

document
  .getElementById("editPurchaseInvoice")
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
  let _id = purchaseOrderId
  formData.append("invoiceDate", document.getElementById('createInvoiceDate').value);
  formData.append("invoiceNo", document.getElementById('createInvoiceNumber').value);
  formData.append("invoiceValue", document.getElementById('createInvoiceValue').value);
  formData.append("remark", document.getElementById('follow-up-remark').value);
  formData.append("_id", _id);

      // Submit data to the server
      const response = await fetch(`${purchaseOrder_API}/invoice/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();
      console.log("Purchase Order Response: ", res);

      if (!response.ok) throw new Error(res.message || "Failed to add purchase order");

      status_popup("Purchase Invoice Updated Successfully!", true);
      setTimeout(() => {
        all_data_load_dashboard();s
      }, Number(document.getElementById("b1b1").innerText) * 1000);
    } catch (error) {
      console.error("Error updating purchase Invoice:", error);
      status_popup("Error Updating Purchase Invoice. Please try again.", false);
    } finally {
      remove_loading_shimmer(); 
    }
  });
