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
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate  } from './globalFunctions2.js'
import { user_API, expense_API,global_search_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================
// =================================================================================

// Function to handle search and update the same table
async function handleSearch() {
    const searchFields = ["expenseName", "purchaseDate"]; // IDs of input fields
    const searchType = "expense"; // Type to pass to the backend
    const tableData = document.getElementById("expenseTbody");
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
        const expenses = res.data;
  
        expenses.forEach((e) => {
          tableContent += `
            <tr data-id=${e?._id}>
              <td class="width-thirty"><input type="checkbox" class="checkbox_child" value="${e?._id || '-'}"></td>
              <td>${e?.expenseName || '-'}</td>
              <td>${e?.purchaseBy?.name ? `${e.purchaseBy.name} (${e.purchaseBy.userId || '-'})` : '-'}</td>                          
              <td>${formatDate(e?.purchaseDate) || '-'}</td>
              <td>₹ ${e?.amount || 0}</td>
              <td>${e?.paidBy || '-'}</td>
              <td class="text-center">${e?.status || '-'}</td>
             <td class="text-end">
                              <div class="dropdown dropdown-action">
                                  <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                  <div class="dropdown-menu dropdown-menu-right">
                                                                            <a onclick="handleClickToGenerateViewExpense('${e?._id}')" class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#view_data"><i class="fa-solid fa-eye m-r-5"></i>View</a>

                                  <a onclick="handleClickToGenerateEditExpense('${e?._id}')" class="dropdown-item  hr_restriction " href="#" data-bs-toggle="modal" data-bs-target="#edit_data"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                      <a class="dropdown-item  hr_restriction " onclick="individual_delete('${e?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete </a>
                                  </div>
                              </div>
                          </td>
            </tr>
          `;
        });
      } else {
        // No results found
        tableContent = `
          <tr>
            <td colspan="8" class="text-center">
              <i class="fa-solid fa-times"></i> No results found
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error("Error during search:", error);
      // Handle errors gracefully
      tableContent = `
        <tr>
          <td colspan="8" class="text-center">
            <i class="fa-solid fa-times"></i> An error occurred during search
          </td>
        </tr>
      `;
    } finally {
      // Update the table content and remove shimmer
      tableData.innerHTML = tableContent;
      checkbox_function(); // Reinitialize checkboxes
      remove_loading_shimmer();
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



// let cachedClient = [];
try {
  const response = await fetch(`${user_API}/data/get`, {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
      },
  });
  const resp = await response.json();
// //   console.log("askldfja;ls as;ldfjkasd; fasd;lf;kasd j :- ",resp)

//   cachedClient = resp?.users.employees;
  
//   // ---------------------------------------------------------------------------------------------------
  const purchaseBy_select_option = document.getElementById('purchaseBy_select_option');
  resp.users.employees.map(employee=>{
      const option = document.createElement("option");
      option.value = employee._id;
      option.text = `${employee?.name} (${employee?.userId})`;
      purchaseBy_select_option.appendChild(option);
  })
//   // ---------------------------------------------------------------------------------------------------
  var edit_purchaseBy_select_option = document.getElementById('edit-purchaseBy_select_option');
  resp.users.employees.map(employee=>{
      const option = document.createElement("option");
      option.value = employee._id;
      option.text = `${employee?.name}`;
      edit_purchaseBy_select_option.appendChild(option);
  })
//   // ---------------------------------------------------------------------------------------------------
//   var view_purchaseBy_select_option = document.getElementById('view-purchaseBy_select_option');
//   resp.users.employees.map(employee=>{
//       const option = document.createElement("option");
//       option.value = employee._id;
//       option.text = `${employee?.name}`;
//       view_purchaseBy_select_option.appendChild(option);
//   })
//   // ---------------------------------------------------------------------------------------------------
}
catch(error){
  console.log(error)
}
// // ------------------------------------------------------------------------------------------
//  
// ===============ac===========================================================================
// ===========================================================================================
async function all_data_load_dashboard () {

  try{
      loading_shimmer(); 
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  var tableData = document.getElementById('expenseTbody');
  try{
      const response = await fetch(`${expense_API}/get${rtnPaginationParameters()}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      })
      const r2 = await response.json();
      let res  = r2?.data;

    //   console.log("alsdfjasf ;pasdf :- ",res);
      setTotalDataCount(r2?.totalExpenses);

      var x = '';
      if(res.length>0){
          for (var i = 0; i < res.length; i++) {
              var e = res[i];
            //   console.log("lrlkasj as;broroororor:---===-=-= ",e)
              x += `<tr data-id=${e?._id}>
                          <td class="width-thirty"><input type="checkbox" class="checkbox_child" value="${e?._id || '-'}"></td>
                          <td>${e?.expenseName}</td>
                          <td>${e?.purchaseBy?.name ? `${e.purchaseBy.name} (${e.purchaseBy.userId || '-'})` : '-'}</td>                          
                          <td>${formatDate(e?.purchaseDate)}</td>
                          <td>₹ ${e?.amount}</td>
                          <td>${e?.paidBy}</td>
                          <td class="text-center">${e?.status}</td>
                          <td class="text-end">
                              <div class="dropdown dropdown-action">
                                  <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                  <div class="dropdown-menu dropdown-menu-right">
                                                                            <a onclick="handleClickToGenerateViewExpense('${e?._id}')" class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#view_data"><i class="fa-solid fa-eye m-r-5"></i>View</a>

                                  <a onclick="handleClickToGenerateEditExpense('${e?._id}')" class="dropdown-item  hr_restriction " href="#" data-bs-toggle="modal" data-bs-target="#edit_data"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                      <a class="dropdown-item  hr_restriction " onclick="individual_delete('${e?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete </a>
                                  </div>
                              </div>
                          </td>
                      </tr>
                  `;
          }
      } else {
          x = `
              <tr>
                  <td  colspan="8" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
              </tr>`;
      }
      tableData.innerHTML = x;
      checkbox_function();    
  } catch(error){
      let x = `
          <tr>
              <td  colspan="8" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
          </tr>`;
      tableData.innerHTML = x;
      console.log(error);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
  
}
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);

// ===========================================================================================
// ===========================================================================================
// ===========================================================================================
// ===========================================================================================

const addExpenseForm = document.getElementById('add_expense_form');

addExpenseForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validate form fields before submission
    if (!validateAddExpenseForm()) {
        return; // Prevent form submission if validation fails
    }

    try {
        // Close any open modal windows or UI elements
        Array.from(document.querySelectorAll(".btn-close")).map(e => e.click());
    } catch (error) {
        console.log(error);
    }

    try {
        // Show loading shimmer or animation
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    // Collect form data
    const item = document.getElementById('add-item-name').value;
    const expenseName = document.getElementById('add-expense-name').value;
    const purchaseDate = document.getElementById('add-purchase-date').value;
    const purchaseBy = document.getElementById('purchaseBy_select_option').value;
    const amount = document.getElementById('add-amount').value;
    const paidBy = document.getElementById('add-paid-by').value;
    const status = document.getElementById('add-status').value;
    const description = document.getElementById('description').value;

    try {
        const formData = new FormData();

        // Add files to the form data
        const files = document.getElementById('add-file').files;
        for (const file of files) {
            formData.append("file", file);
        }

        // Append other form fields
        formData.append("item", item);
        formData.append("expenseName", expenseName);
        formData.append("purchaseDate", purchaseDate);
        formData.append("purchaseBy", purchaseBy);
        formData.append("amount", amount);
        formData.append("paidBy", paidBy);
        formData.append("status", status);
        formData.append("description", description);

        // Send form data to server
        const response = await fetch(`${expense_API}/post`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const success = response.ok;
        status_popup(success ? "Expense Created <br> Successfully!" : "Please try <br> again later", success);

        if (success) {
            // Reload dashboard and reset form
            all_data_load_dashboard(); // Ensure dashboard reload happens
            addExpenseForm.reset(); // Clear form fields
        }
    } catch (error) {
        // Show error popup in case of failure
        status_popup("Please try <br> again later");
        console.error('Error submitting expense:', error);
    }

    // Hide loading shimmer or animation
    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
});

// ============================================================================================
// ============================================================================================
// ============================================================================================

window.handleClickToGenerateViewExpense = async function handleClickToGenerateViewExpense(id) {
    try {
        loading_shimmer();
    } catch (error) {
        console.error(error);
    }

    try {
        // Fetch expense data by ID
        const responseData = await fetch(`${expense_API}/get/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const resp = await responseData.json();

        // Populate fields with fetched data
        document.getElementById("_id_hidden").value = resp?._id || '';
        document.getElementById("view-item-name").value = resp?.item || '';
        document.getElementById("view-expense-name").value = resp?.expenseName || '';
        document.getElementById("view-purchase-date").value = resp?.purchaseDate || '';
        document.getElementById("view-amount").value = resp?.amount || '';
        document.getElementById("view-paid-by").value = resp?.paidBy || '';
        document.getElementById("view-status").value = resp?.status || '';
        document.getElementById("view-description").value = resp?.description || '';
        document.getElementById("view-purchaseBy_select_option").value = resp?.purchaseBy.name || '';
        console.log(resp?.purchaseBy.name)
        // Handle "Purchased By" field
        // const purchaseBy = resp?.purchaseBy;
        // const purchaseByElement = document.getElementById("view-purchaseBy_select_option");

        // if (purchaseBy && purchaseBy.name && purchaseBy.userId) {
        //     // Set the value as a readable string
        //     purchaseByElement.innerHTML = `${purchaseBy.name} (${purchaseBy.userId})`;
        // } else {
        //     purchaseByElement.innerHTML = 'Not Available';
        // }

        // Handle uploaded files
        const files = resp?.files || [];
        const uploadFilesDiv = document.getElementById("viewUploadFilesDiv");
        const tbody1 = document.getElementById("viewUplaodFilesTable");

        if (files.length > 0) {
            uploadFilesDiv.classList.remove("d-none");
            tbody1.innerHTML = ''; // Clear any existing rows

            files.forEach((file, index) => {
                const z1 = document.createElement("tr");
                z1.innerHTML = `
                    <td>${index + 1}</td>
                    <td><input type="text" class="form-control" name="" value="File ${index + 1}" disabled id=""></td>
                    <td class="text-center"><a href="${file}" target="_blank" class="btn btn-primary"><i class="fa-regular fa-eye"></i></a></td>
                `;
                tbody1.appendChild(z1);
            });
        } else {
            uploadFilesDiv.classList.add("d-none");
        }
    } catch (error) {
        console.error("Error fetching expense data:", error);
    } finally {
        try {
            remove_loading_shimmer();
        } catch (error) {
            console.error(error);
        }
    }
};



// ============================================================================================
window.handleClickToGenerateEditExpense = async function handleClickToGenerateEditExpense(id) {
    try {
        loading_shimmer();
    } catch (error) {
        console.error(error);
    }

    try {
        // Fetch the expense data by ID
        const response = await fetch(`${expense_API}/get/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const resp = await response.json();

        // Populate fields with fetched data
        document.getElementById("_id_hidden").value = resp?._id || '';
        document.getElementById("edit-item-name").value = resp?.item || '';
        document.getElementById("edit-expense-name").value = resp?.expenseName || '';
        document.getElementById("edit-purchase-date").value = resp?.purchaseDate || '';
        document.getElementById("edit-amount").value = resp?.amount || '';
        document.getElementById("edit-paid-by").value = resp?.paidBy || '';
        document.getElementById("edit-status").value = resp?.status || '';
        document.getElementById("edit-description").value = resp?.description || ''; // Populate description field

        // Preselect the "Purchased By" dropdown
        const purchaseBySelect = document.getElementById("edit-purchaseBy_select_option");
        purchaseBySelect.innerHTML = ""; // Clear existing options

        // Fetch all employees (assumes cached or separate API call)
        const employeesResponse = await fetch(`${user_API}/data/get`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const employeesData = await employeesResponse.json();
        const employees = employeesData?.users?.employees || [];

        // Populate the dropdown and pre-select the matched employee
        employees.forEach((employee) => {
            const option = document.createElement("option");
            option.value = employee._id;
            option.text = `${employee.name} (${employee.userId || 'N/A'})`;
            if (employee._id === resp?.purchaseBy) {
                option.selected = true; // Pre-select the current "Purchased By" value
            }
            purchaseBySelect.appendChild(option);
        });

        // Handle uploaded files
        const files = resp?.files || [];
        if (files.length > 0) {
            document.getElementById("uploadFilesDiv").classList.remove("d-none");
            const tbody = document.getElementById("uplaodFilesTable");
            tbody.innerHTML = ""; // Clear any previous rows

            files.forEach((file, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><input type="text" class="form-control" name="" value="File ${index + 1}" disabled></td>
                    <td class="text-center"><a href="${file}" target="_blank" class="btn btn-primary"><i class="fa-regular fa-eye"></i></a></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            document.getElementById("uploadFilesDiv").classList.add("d-none");
        }
    } catch (error) {
        console.error("Error fetching expense data:", error);
    } finally {
        try {
            remove_loading_shimmer();
        } catch (error) {
            console.error(error);
        }
    }
};



const editExpenseForm = document.getElementById('edit_expense_form');
editExpenseForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    if (!validateEditExpenseForm()) {
        return; // Prevent form submission if validation fails
    }

    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=>e.click());
    } catch(error){console.log(error)}
    
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    try {
        const item = document.getElementById('edit-item-name').value;
        const expenseName = document.getElementById('edit-expense-name').value;
        const purchaseDate = document.getElementById('edit-purchase-date').value;
        const purchaseBy = document.getElementById('edit-purchaseBy_select_option').value;
        const amount = document.getElementById('edit-amount').value;
        const paidBy = document.getElementById('edit-paid-by').value;
        const status = document.getElementById('edit-status').value;
        const description = document.getElementById('edit-description').value;
        const _id = document.getElementById("_id_hidden").value;

        const formData = new FormData();

        const files = document.getElementById('edit-files').files;
        for (const file of files) {
            formData.append("file", file);
        }

        // Append form fields
        formData.append("item", item);
        formData.append("expenseName", expenseName);
        formData.append("purchaseDate", purchaseDate);
        formData.append("purchaseBy", purchaseBy);
        formData.append("amount", amount);
        formData.append("paidBy", paidBy);
        formData.append("status", status);
        formData.append("description", description);
        formData.append("_id", _id);

        
        const response = await fetch(`${expense_API}/update`, {
        method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const success = response.ok;
        status_popup(success ? "Expense Updated <br> Successfully!" : "Please try <br> again later", success);
        if (success){
            all_data_load_dashboard();
        }             
    } catch (error) {
        status_popup( ("Please try <br> again later"), (false) );
        console.error('Error submitting project:', error);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})


// =========================================================================================================

function validateAddExpenseForm() {
    clearErrors();

    let isValid = true;

    // Validate fields
    const expenseName = document.getElementById("add-expense-name");
    const item = document.getElementById("add-item-name");
    const purchaseDate = document.getElementById("add-purchase-date");
    const purchaseBy = document.getElementById("purchaseBy_select_option");
    const amount = document.getElementById("add-amount");
    const paidBy = document.getElementById("add-paid-by");
    const status = document.getElementById("add-status");
    // const description = document.getElementById("description");

    if (!expenseName.value.trim()) {
        showError(expenseName, "Expense Name is required");
        isValid = false;
    }

    if (!item.value.trim()) {
        showError(item, "Item Name is required");
        isValid = false;
    }

    if (!purchaseDate.value.trim()) {
        showError(purchaseDate, "Purchase Date is required");
        isValid = false;
    }

    if (!purchaseBy.value.trim()) {
        showError(purchaseBy, "Please select an employee");
        isValid = false;
    }

    if (!amount.value.trim() || isNaN(amount.value) || parseFloat(amount.value) <= 0) {
        showError(amount, "Enter a valid amount");
        isValid = false;
    }

    if (!paidBy.value.trim()) {
        showError(paidBy, "Please select a payment mode");
        isValid = false;
    }

    if (!status.value.trim()) {
        showError(status, "Please select a status");
        isValid = false;
    }

    // if (!description.value.trim()) {
    //     showError(description, "Description is required");
    //     isValid = false;
    // }

    return isValid;
}
// =========================================================================================================

function validateEditExpenseForm() {
    clearErrors();

    let isValid = true;

    // Validate fields
    const expenseName = document.getElementById("edit-expense-name");
    const item = document.getElementById("edit-item-name");
    const purchaseDate = document.getElementById("edit-purchase-date");
    const purchaseBy = document.getElementById("edit-purchaseBy_select_option");
    const amount = document.getElementById("edit-amount");
    const paidBy = document.getElementById("edit-paid-by");
    const status = document.getElementById("edit-status");
    // const item = document.getElementById("edit-description");

    if (!expenseName.value.trim()) {
        showError(expenseName, "Expense Name is required");
        isValid = false;
    }

    if (!item.value.trim()) {
        showError(item, "Item Name is required");
        isValid = false;
    }

    if (!purchaseDate.value.trim()) {
        showError(purchaseDate, "Purchase Date is required");
        isValid = false;
    }

    if (!purchaseBy.value.trim()) {
        showError(purchaseBy, "Please select an employee");
        isValid = false;
    }

    if (!amount.value.trim() || isNaN(amount.value) || parseFloat(amount.value) <= 0) {
        showError(amount, "Enter a valid amount");
        isValid = false;
    }

    if (!paidBy.value.trim()) {
        showError(paidBy, "Please select a payment mode");
        isValid = false;
    }

    if (!status.value.trim()) {
        showError(status, "Please select a status");
        isValid = false;
    }

    // if (!description.value.trim()) {
    //     showError(description, "Description is required");
    //     isValid = false;
    // }

    return isValid;
}
// --------------------------------------------------------------------------------------------------
// Function to show error messages inside the correct div next to labels
// --------------------------------------------------------------------------------------------------
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

// =========================================================================================================
// =========================================================================================================
// =========================================================================================================