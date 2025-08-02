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
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
import { vendor_API, global_search_API} from './apis.js';
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
    const searchFields = ["vendorName", "vendorId" ]; // IDs of input fields
    const searchType = "Vendor"; // Type to pass to the backend
    
    const tableData = document.getElementById("tableData");
    let x = ''; // Initialize rows content

    try {
        loading_shimmer(); // Display shimmer loader

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

        if (response.ok && res.data?.length > 0) {
            // Generate table rows dynamically
            const rows = res.data.map((user) => {
                // const designation = getCachedDesignation(user?.designations ? user.designations.designations : '-');
                return `
                <tr data-id="${user?._id || '-'}">
                   <td><input type="checkbox" class="checkbox_child" value="${user?._id || '-'}"></td>
                    <td>${capitalizeFirstLetter(user?.vendorName) || '-'}</td>
                    
                    <td>${user?.vendorId || '-'}</td>
                    
                    <td>${capitalizeFirstLetter(user?.mobile) || '-'}</td>
                    <td>${user?.aadharNumber || '-'}</td>
                    <td>${user?.panNumber || '-'}</td>
                    <td class="">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="material-icons">more_vert</i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="userProfile.html?id=${user?._id}">
                                    <i class="fa-regular fa-eye"></i> View
                                </a>
                                <a class="dropdown-item" onclick="handleClickOnEditEmployee('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                                    <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                </a>
                                <a class="dropdown-item" onclick="individual_delete('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#delete_data">
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




// -------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------
// Load all employee data for the dashboard table



async function all_data_load_dashboard() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
 
    let tableData = document.getElementById('tableData');
    tableData.innerHTML = '';
    let rows;

    try {
        const response = await fetch(`${vendor_API}/getAll${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();
        setTotalDataCount(res?.pagination?.totalVendors);
         const users = res.data
        //  console.log('This is my user data',users);

        if (users && users.length>0) {
             rows = users.map((user) => {
                 return `
                <tr data-id="${user?._id || '-'}">
                    <td><input type="checkbox" class="checkbox_child" value="${user?._id || '-'}"></td>
                    <td>${capitalizeFirstLetter(user?.vendorName) || '-'}</td>
                    
                    <td>${user?.vendorId || '-'}</td>
                    
                    <td>${capitalizeFirstLetter(user?.mobile) || '-'}</td>
                    <td>${user?.aadharNumber || '-'}</td>
                    <td>${user?.panNumber || '-'}</td>
                    <td class="">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="material-icons">more_vert</i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                            <a class="dropdown-item"  href="vendor-view.html?id=${user?._id}">
                                <i class="fa-regular fa-eye"></i> View
                            </a>
                            <a class="dropdown-item" onclick="handleClickOnEditEmployee('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                                <i class="fa-solid fa-pencil m-r-5"></i> Edit
                            </a>
                            <a class="dropdown-item" onclick="individual_delete('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                                <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                            </a>
                            </div>
                        </div>
                    </td>
                </tr>`;
            });

            tableData.innerHTML = rows.join('');
            checkbox_function();
        } else {
            rows = `
                <tr>
                    <td  colspan="9" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
                </tr>`;

            tableData.innerHTML = rows;
        }
    } catch (error) {
        rows = `
            <tr>
                <td  colspan="9" class='text-center'><i class="fa-solid fa-times"></i>No Data Found</td>
            </tr>`;

        tableData.innerHTML = rows;
        
        console.error('Error loading employee data:', error);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
         remove_loading_shimmer();
    } catch(error){console.log(error)}

 }



// ==========================================================================================
   
document.getElementById('add_Vendor_form').addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!validatorNewVendor()) { 
        return;
    }
    // console.log("1111111111111111")
    let expertise = [];
    document.querySelectorAll('.myWorking').forEach(element => {
        // console.log("22222222222")
        const workExpertiseInput = element.firstElementChild.children[0].childNodes[1];

        if (workExpertiseInput && workExpertiseInput.value.trim() !== "") {
            // console.log('hello brother:  ', workExpertiseInput.value);
            expertise.push(workExpertiseInput.value);
        }
    }); 
    // console.log("333333333333333")

  
    // console.log("5555555555555555555555")

    try {
        Array.from(document.querySelectorAll('.btn-close')).forEach((btn) => btn.click());
    } catch (error) {
        console.error(error);
    }

    try {
        loading_shimmer();
    } catch (error) {
        console.error(error);
    }

    const formData = new FormData();
    formData.append('vendorName', document.getElementById('vendor_name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('mobile', document.getElementById('mobile').value);
    formData.append('aadharNumber', document.getElementById('aadharNumber').value);
    formData.append('panNumber', document.getElementById('panNumber').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('GST', document.getElementById('gstNumber').value);
    formData.append('gender', document.getElementById('gender').value);
    formData.append('vendorExpertise', document.getElementById('contractor-expertise').value);
    expertise.forEach((item, index) => {
        formData.append('expertise[]', item);
    });

   
    // Append file uploads
    const files = document.getElementById('contractor-file').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
    }

    try {
        const response = await fetch(`${vendor_API}/post`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const success = response.ok;
        status_popup(success ? 'Vendor Created <br> Successfully!' : 'Failed to add vendor.', success);

        if (success) {
         
            document.getElementById('add_Vendor_form').reset()
       all_data_load_dashboard();
             }
         } catch (error) {
             console.error('Error adding vendor:', error);
             status_popup("Please try <br> again later", false);
         }
         // ----------------------------------------------------------------------------------------------------
         try {
             remove_loading_shimmer();
         } catch (error) { console.log(error) }
     });


 // ===========================================================================================================
// Load employee details for editing
let _id; // Global variable to store the vendor ID

window.handleClickOnEditEmployee = async function (vendorId) {
  _id = vendorId; // Set the ID of the selected vendor
  try {
    const response = await fetch(`${vendor_API}/get?id=${vendorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const vendor = await response.json();
    document.getElementById('updateContractor-expertise').value = null;
        // document.getElementById('updateContractor-expertise').value = contractor.expertise[0]
        let editWorkingElements;
        let ex = vendor.expertise
        let isConditon = true;
        if (isConditon) {
            try{
                document.querySelector('.editExpertiseContainer').innerHTML = null;
            } catch (error){console.log(error)}
            for (let i = 0; i < ex.length; i++) {
                addEditExpertiseRow()
                editWorkingElements = document.querySelectorAll('.myEditWorking')

                let workExpertiseInput = editWorkingElements[i].firstElementChild.children[0].firstElementChild
                if (workExpertiseInput) {  
                    workExpertiseInput.value = ex[i]
                    console.log('hello bhaiya:  ', workExpertiseInput.value); 
                    
                }
            }
            
            isConditon = false
        }


      // Populate the form with vendor details
      document.getElementById('update-name').value = vendor.vendorName || '';
      document.getElementById('update-email').value = vendor.email || '';
      document.getElementById('update-mobile').value = vendor.mobile || '';
      document.getElementById('updateaadharNumber').value = vendor.aadharNumber || '';
      document.getElementById('updatepanNumber').value = vendor.panNumber || '';
      document.getElementById('updateaddress').value = vendor.address || '';
      document.getElementById('updategender').value = vendor.gender || '';
      document.getElementById('updategstNumber').value = vendor.GST || '';
      document.getElementById('update-remark').value = vendor.remark || '';
      document.getElementById('updateContractor-expertise').value = vendor.vendorExpertise || '';
    
    
    } catch (error) {
        console.error('Error loading vendor details:', error);
    }
};


// ----------------------------------------------------------------------------
// Update Vendor Details
document.getElementById('update_Vendor_form').addEventListener('submit', async function (event) {
    event.preventDefault();
    if(!validatorEditvendor()){
        return
    }
     let expertise = [];

     document.querySelectorAll('.myEditWorking').forEach(element => {
        const workExpertiseInput = element.firstElementChild.children[0].firstElementChild;
        if (workExpertiseInput && workExpertiseInput.value.trim() !== "") {
            expertise.push(workExpertiseInput.value.trim());
        }
    });

    // if (!validatorEditvendor()) {
    //        return;
    //   }
       
      try {
        Array.from(document.querySelectorAll(".btn-close")).map(e => e.click());
    } catch (error) {
        console.log("Error closing modals:", error);
    }

    try {
        loading_shimmer();
    } catch (error) {
        console.log("Error showing loading shimmer:", error);
    }
      // ----------------------------------------------------------------------------------------------------
     // Prepare form data
     let id = _id;
     const formData = new FormData();
     formData.append('id', id);
     formData.append('vendorName', document.getElementById('update-name').value.trim());
     formData.append('email', document.getElementById('update-email').value.trim());
     formData.append('mobile', document.getElementById('update-mobile').value.trim());
     formData.append('aadharNumber', document.getElementById('updateaadharNumber').value.trim());
     formData.append('panNumber', document.getElementById('updatepanNumber').value.trim());
     formData.append('address', document.getElementById('updateaddress').value.trim());
      formData.append('gender', document.getElementById('updategender').value.trim());
      formData.append('GST', document.getElementById('updategstNumber').value.trim());
    formData.append('remark',document.getElementById('update-remark').value.trim());
    formData.append('vendorExpertise',document.getElementById('updateContractor-expertise').value.trim());

    expertise.forEach(item => {
            formData.append('expertise[]', item);
        });
    
        const files = document.getElementById('update-contractor-file').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }
    
  
    try {
      const response = await fetch(`${vendor_API}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
         },
        body: formData
      });
  
      const res = await response.json();
      const success = response.ok;

      status_popup(success ? "Vendor Updated <br> Successfully!" : "Please try <br> again later", success);

      if (success) {
          setTimeout(() => {
              window.location.reload(); // Reload page after success
          }, 3000);
      }
  } catch (error) {
      console.error("Error updating vendor:", error);
      status_popup("Please try <br> again later", false);
  } finally {
      try {
          remove_loading_shimmer();
      } catch (error) {
          console.log("Error hiding loading shimmer:", error);
      }
  }
});


// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);



// ==================================================================================================
// ADD FORM VALIDATION
function validatorNewVendor() {
    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Get all field elements
    const vendorName = document.getElementById('vendor_name');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');
    const aadharNumber = document.getElementById('aadharNumber');
    const panNumber = document.getElementById('panNumber');
    const address = document.getElementById('address');
    // const GST = document.getElementById('gstNumber');
     const gender = document.getElementById('gender');

    // Validation logic
    // Validate Vendor Name
    if (!vendorName.value.trim() || /\d/.test(vendorName.value)) {
        showError(vendorName, 'Enter a valid name without numbers');
        isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailPattern.test(email.value)) {
        showError(email, 'Enter a valid email address');
        isValid = false;
    }

    // if (!GST.value.trim() || /\d/.test(gstNumber.value)) {
    //     showError(gstNumber, 'Enter a valid GST numbers');
    //     isValid = false;
    // }

    // Validate Mobile
    const mobileValue = mobile.value.trim();
    if (!mobileValue || mobileValue.length < 10 || mobileValue.length > 13 || !/^\d+$/.test(mobileValue)) {
        showError(mobile, 'Enter a valid phone number');
        isValid = false;
    }

    // Validate Aadhar Number
    const aadharPattern = /^\d{12}$/; // Aadhar number should be exactly 12 digits
    if (!aadharNumber.value.trim() || !aadharPattern.test(aadharNumber.value)) {
        showError(aadharNumber, 'Enter a valid 12-digit Aadhar number');
        isValid = false;
    }

    // Validate PAN Number
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/; // PAN format: 5 letters, 4 digits, 1 letter
    if (!panNumber.value.trim() || !panPattern.test(panNumber.value)) {
        showError(panNumber, 'Enter a valid PAN number');
        isValid = false;
    }

    // Validate Address
    if (!address.value.trim() || address.value.length < 5) {
        showError(address, 'Address must be at least 5 characters long');
        isValid = false;
    }

    // Validate Gender
    if (!gender.value.trim() || !['male', 'female', 'other'].includes(gender.value.toLowerCase())) {
        showError(gender, 'Select a valid gender');
        isValid = false;
    }

    return isValid;
}
window.populateExpertiseFields = function (expertiseArray = []) {
    let expertiseContainer = document.querySelector('.contractor-expertise');

    // Create expertise container dynamically if not found
    if (!expertiseContainer) {
        console.error('Expertise container not found. Creating a new container.');

        const parentElement = document.getElementById('update-contractor-expertise').closest('.col-sm-5').parentElement;
        if (parentElement) {
            expertiseContainer = document.createElement('div');
            expertiseContainer.classList.add('contractor-expertise');
            parentElement.appendChild(expertiseContainer);
        } else {
            console.error('Parent element for expertise not found.');
            return;
        }
    }

    // Clear existing rows
    expertiseContainer.innerHTML = '';

    // Populate expertise rows
    expertiseArray.forEach((expertise, index) => {
        const newRow = document.createElement('div');
        newRow.classList.add('row', 'mb-3');
        newRow.setAttribute('id', `update-contractor-expertise-row-${index + 1}`);
        newRow.innerHTML = `
            <div class="col-sm-11">
                <input class="form-control" type="text" id="update-contractor-expertise-${index + 1}" value="${expertise}" placeholder="Enter Expertise" />
            </div>
            <div class="col-sm-1">
                <button type="button"   onclick="removeExpertiseRow(${index + 1})">
        <i class="fa-regular fa-trash-can m-r-6"></i>
                </button>
            </div>
        `;
        expertiseContainer.appendChild(newRow);
    });
};

// Add Expertise Row
window.addExpertiseRow = function () {
    let expertiseContainer = document.querySelector('.expertiseContainer');
  
    if (!expertiseContainer) {
      console.warn('Expertise container not found. Creating one dynamically.');
  
      const parentContainer = document.querySelector('#update-contractor-expertise').closest('.row');
      if (parentContainer) {
          expertiseContainer = document.createElement('div');
          expertiseContainer.classList.add('expertiseContainer');
          parentContainer.appendChild(expertiseContainer);
      }
       else {
        console.error('Parent container for expertise rows not found.');
        return;
      }
    }
  
    // Calculate the new row index
    const rowIndex = expertiseContainer.children.length + 1;
  
    const newRow = document.createElement('div');
    newRow.classList.add('row', 'mb-3', 'myWorking');
    newRow.setAttribute('id', `expertise-row-${rowIndex}`);
    newRow.innerHTML = `<div class="row mb-3" id="expertise-row-1">
      <div class="col-sm-11">
        <input class="form-control" type="text" id="contractor-expertise-${rowIndex}" placeholder="Enter Expertise" />
      </div>
      <div class="col-sm-1 d-flex align-item-center">
        <button type="button" class="dropdown-item">
        <i class="fa-regular fa-trash-can m-r-5"></i>
        </button>
      </div>
      </div>
    `;
  
    expertiseContainer.appendChild(newRow);
  };
  
  // Remove Expertise Row
  window.removeExpertiseRow = function (rowIndex) {
    const rowToRemove = document.getElementById(`expertise-row-${rowIndex}`);
    if (rowToRemove) {
      rowToRemove.remove();
    } else {
      console.error(`Expertise row with ID "expertise-row-${rowIndex}" not found.`);
    }
  };

//   Edit Row Genrated and delete 
window.addEditExpertiseRow = function addEditExpertiseRow(){
    const editExpertiseContainer = document.querySelector('.editExpertiseContainer')
    const row = document.createElement('div');
    row.innerHTML=`<div class="row mb-3" id="expertise-row-1">
      <div class="col-sm-11">
        <input class="form-control" type="text" id="contractor-expertise-1" placeholder="Enter Expertise">
      </div>
       <div class="col-sm-1 d-flex align-item-center">
        <button type="button" class="dropdown-item">
        <i class="fa-regular fa-trash-can m-r-5"></i>
        </button>
      </div>
    </div>`
    row.classList.add('row','mb-3','myEditWorking');
    editExpertiseContainer.appendChild(row);
    let appendingIdToRow =  document.querySelectorAll('.myEditWorking')
    appendingIdToRow.forEach((element,i)=>{
        element.setAttribute('id',`workEditDetailing${i}`)

        const deleteLink = element.querySelector('button');
        deleteLink.setAttribute('onclick', `removeEditExpertiseRow(${i})`);
    })
}

window.removeEditExpertiseRow = function removeEditExpertiseRow(index){
    let deleteRow = document.getElementById(`workEditDetailing${index}`)
    deleteRow.remove();
}
  

  
  
// =======================================================================================
// =======================================================================================
 
// --------------------------------------------------------------------------------------------------


 


  
  
  


// ===========================================================================================================
 

// =======================================================================================
// =======================================================================================

// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);

// EDIT FORM VALIDATION
function validatorEditvendor() {
    clearErrors();

    let isValid = true;

    // Get all field elements
    const vendorName = document.getElementById('update-name');
    const email = document.getElementById('update-email');
    const mobile = document.getElementById('update-mobile');
    const aadharNumber = document.getElementById('updateaadharNumber');
    const panNumber = document.getElementById('updatepanNumber');
    const address = document.getElementById('updateaddress');
    const gender = document.getElementById('updategender');
    // const GST = document.getElementById('updategstNumber');

    // Validation logic
    // Validate vendor Name
    if (!vendorName.value.trim() || /\d/.test(vendorName.value)) {
        showError(vendorName, 'Enter a valid name without numbers');
        isValid = false;
    }
    // if (!GST.value.trim() || /\d/.test(updategstNumber.value)) {
    //     showError(updategstNumber, 'Enter a valid GST numbers');
    //     isValid = false;
    // }
    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailPattern.test(email.value)) {
        showError(email, 'Enter a valid email address');
        isValid = false;
    }

    // Validate Mobile
    const mobileValue = mobile.value.trim();
    if (!mobileValue || mobileValue.length < 10 || mobileValue.length > 13 || !/^\d+$/.test(mobileValue)) {
        showError(mobile, 'Enter a valid phone number');
        isValid = false;
    }

    // Validate Aadhar Number
    const aadharPattern = /^\d{12}$/; // Aadhar number should be exactly 12 digits
    if (!aadharNumber.value.trim() || !aadharPattern.test(aadharNumber.value)) {
        showError(aadharNumber, 'Enter a valid 12-digit Aadhar number');
        isValid = false;
    }

    // Validate PAN Number
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/; // PAN format: 5 letters, 4 digits, 1 letter
    if (!panNumber.value.trim() || !panPattern.test(panNumber.value)) {
        showError(panNumber, 'Enter a valid PAN number');
        isValid = false;
    }

    // Validate GST Number
const gstPattern = /^[0-9]{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/; // GST format
if (!gstNumber.value.trim() || !gstPattern.test(gstNumber.value)) {
    showError(gstNumber, 'Enter a valid GST number');
    isValid = false;
}

    // Validate Address
    if (!address.value.trim() || address.value.length < 5) {
        showError(address, 'Address must be at least 5 characters long');
        isValid = false;
    }

    // Validate Gender
    if (!gender.value.trim() || !['male', 'female', 'other'].includes(gender.value.toLowerCase())) {
        showError(gender, 'Select a valid gender');
        isValid = false;
    }

    return isValid;
}

// ==================================================================================================
// ==================================================================================================
// ==================================================================================================
// ====================================----VALIDATION---=============================================
// ====================================----VALIDATION---=============================================
// ====================================----VALIDATION---=============================================
// ====================================----VALIDATION---=============================================
// ====================================----VALIDATION---=============================================
// ====================================----VALIDATION---=============================================
// ==================================================================================================

// --------------------------------------------------------------------------------------------------
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

// Remove data from employee list 
document.addEventListener('removeDataFromEmployee',()=>{
    let User_role = localStorage.getItem("User_role");

    let addEmployeeButton = document.getElementById('add-employee-btn')
    let employeeAction = document.getElementById('employee-action');
    let employeeTable = document.getElementById('tableData').children
    let downloadExcelFile = document.getElementById('download_excel_multiple_file');
    let deleteButton = document.getElementById('delete_btn_multiple_file')
    if(User_role == "Manager"){
        addEmployeeButton.remove();
        employeeAction.remove();
        downloadExcelFile.remove();
        deleteButton.remove();
        for(let i=0; i<employeeTable.length; i++){
            if (employeeTable[i] && employeeTable[i].cells && employeeTable[i].cells[7]) {
                employeeTable[i].cells[8].remove();
            } 
        }
    }
})






  
  
  
  
    // a = Array.from(document.getElementsByClassName("addProduct"));
  