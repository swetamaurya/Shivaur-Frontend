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
// --------------------------------------------------------------------------------
import { checkbox_function } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { companyDetails_API } from './apis.js';
import { capitalizeFirstLetter } from './globalFunctions2.js';
import { rtnPaginationParameters, setTotalDataCount } from './globalFunctionPagination.js';
// --------------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
// --------------------------------------------------------------------------------
const token = localStorage.getItem('token');
// =======================================================


// -------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------
// Load all employee data for the dashboard table
async function all_data_load_dashboard() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    
    let tableData = document.getElementById('enquiryData');
    tableData.innerHTML = '';
    let rows;
    // -----------------------------------------------------------------------------------
    try {
        const response = await fetch(`${companyDetails_API}/getAll${rtnPaginationParameters()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();

        console.log(res)

        // return;
        setTotalDataCount(res?.totalCompanys);

        // return;
        const users = res?.data;

        if (users && users.length>0) {
            rows = users.map((user) => {
                return `
                    <tr data-id="${user?._id || '-'}">
                        <td><input type="checkbox" class="checkbox_child" value="${user?._id || '-'}"></td>
                        <td>${capitalizeFirstLetter(user?.companyName) || '-'}</td>
                        <td>${user?.phoneNumber || '-'}</td>
                        <td class="">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" onclick="handleClickOnEditEmployee('${user?._id || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                                    <a class="dropdown-item" data-bs-toggle="modal" onclick="individual_delete('${user?._id || '-'}')" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tableData.innerHTML = rows.join('');
            checkbox_function();
        } else {
            rows = `
                <tr>
                    <td  colspan="4" class='text-center'><i class="fa-solid fa-times"></i> Data is not available, please insert the data</td>
                </tr>`;

            tableData.innerHTML = rows;
        }
    } catch (error) {
        rows = `
            <tr>
                <td  colspan="9" class='text-center'><i class="fa-solid fa-times"></i> Data is not available, please insert the data</td>
            </tr>`;

        tableData.innerHTML = rows;
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
}
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);
// =======================================================
// =======================================================
document.getElementById("add_Contractor_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    if(!validatorAddCompanyDetails()){
        return
    }
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    try{
        let a1 = document.getElementById("company_name").value;
        let a2 = document.getElementById("company_phone_no").value;
        let a3 = document.getElementById("company_pincode").value;
        let a4 = document.getElementById("company_address").value;

        let a5 = [];
        let aar1 = Array.from(document.querySelector(".tbodyone").children);

        aar1.forEach(e=>{
            let arr2 = e.children;
            let aa1 = arr2[1].querySelector("input")?.value || "";
            let aa2 = arr2[2].querySelector("input")?.value || "";
            let aa3 = arr2[3].querySelector("input")?.value || "";

            let a6 = {
                "POSName": aa1,
                "POSEmail": aa2,
                "POSNumber": aa3
            };
            a5.push(a6)
        });

        const response = await fetch(`${companyDetails_API}/post`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                "companyName": a1,
                "phoneNumber": a2,
                "pinCode": a3,
                "address": a4,
                "POSDetails":a5
            })
        })

        const r1 = await response.json();
        const c1 = (response.ok);

        try{
            status_popup( ((c1) ? `${r1.message}` : "Please try <br> again later"), (c1) );
            if(c1){
                all_data_load_dashboard();
            }
        } catch (error){
            status_popup( ("Please try <br> again later"), (false) );
        }
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})

// ===========================================================================================================
// ===========================================================================================================
// Load employee details for editing
window.handleClickOnEditEmployee = async function (id) {
    const formDocument = document.getElementById("edit_Contractor_form");
    try {
        const response = await fetch(`${companyDetails_API}/get?_id=${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        // ------------------------------------------------------------------
        const r2= await response.json();
        const r = r2?.data;
        // ------------------------------------------------------------------
        try{
            formDocument.querySelector("#hidden_edit_company_id").value = r?._id;
            formDocument.querySelector("#edit_company_name").value = r?.companyName;
            formDocument.querySelector("#edit_company_phone_no").value = r?.phoneNumber;
            formDocument.querySelector("#edit_company_pincode").value = r?.pinCode;
            formDocument.querySelector("#edit_company_address").value = r?.address;
        } catch (error){
            console.log(error);
        }
        try{
            try{
                Array.from(document.querySelector(".tbodytwo").children).forEach((e,i)=>{
                    if(i!=0){
                        e.remove();
                    }
                });
            } catch (error){console.log(error)}

            const arr1 = r?.POSDetails;
            for(let i = 0; i<arr1.length; i++) {

                let arr2 = Array.from(document.querySelector(".tbodytwo").children)[i].children;
                arr2[1].querySelector("input").value = arr1[i].POSName;
                arr2[2].querySelector("input").value = arr1[i].POSEmail;
                arr2[3].querySelector("input").value = arr1[i].POSNumber;

                if (arr1.length- 1 != i) {
                    addInvoiceTableRow("editTable");
                }
            }
            
        } catch (error){
            console.log(error)
        }
    } catch (error) {
        console.error('Error loading employee details:', error);
    }
};
// ----------------------------------------------------------------------------

document.getElementById("edit_Contractor_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    if(!validatorEditCompanyDetails()){
        return
    }
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    try{
        let a0 = document.getElementById("hidden_edit_company_id").value;
        let a1 = document.getElementById("edit_company_name").value;
        let a2 = document.getElementById("edit_company_phone_no").value;
        let a3 = document.getElementById("edit_company_pincode").value;
        let a4 = document.getElementById("edit_company_address").value;

        let a5 = [];
        let aar1 = Array.from(document.querySelector(".tbodytwo").children);

        aar1.forEach(e=>{
            let arr2 = e.children;
            let aa1 = arr2[1].querySelector("input")?.value || "";
            let aa2 = arr2[2].querySelector("input")?.value || "";
            let aa3 = arr2[3].querySelector("input")?.value || "";

            let a6 = {
                "POSName": aa1,
                "POSEmail": aa2,
                "POSNumber": aa3
            };
            a5.push(a6)
        });

        const response = await fetch(`${companyDetails_API}/update`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                "_id": a0,
                "companyName": a1,
                "phoneNumber": a2,
                "pinCode": a3,
                "address": a4,
                "POSDetails":a5
            })
        })

        const c1 = (response.ok);

        try{
            status_popup( ((c1) ? "Company Updated <br> Successfully" : "Please try <br> again later"), (c1) );
            if(c1){
                all_data_load_dashboard();
            }
        } catch (error){
            status_popup( ("Please try <br> again later"), (false) );
        }
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})
// =======================================================================================================================
// =======================================================================================================================

window.removeInvoiceTableRow = function removeInvoiceTableRow(i, tag_id) {
    document.getElementById(tag_id).children[1].children[i-1].remove();
    Array.from(document.getElementById(tag_id).children[1].children).map(
        (e, i) => {
            var dummyNo1 = i + 1;
            if (dummyNo1 != 1) {
                e.cells[0].innerText = dummyNo1;
                e.cells[
                    e.cells.length - 1
                ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeInvoiceTableRow(${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
            }
        }
    );
}
  // Add Table Row function globally declared for reuse
window.addInvoiceTableRow = function addInvoiceTableRow(tag_id) {
    const varTableConst = document.getElementById(tag_id).children[1].children;
    const i = Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
    var tableBody = document.createElement("tr");
    tableBody.setAttribute("key",i);
    tableBody.innerHTML = `
                            <td class=""> ${i}</td>
                            <td>
                                <input class="form-control" type="text">
                            </td>
                            <td>
                                <input class="form-control" type="email">
                            </td>
                            <td>
                                <input class="form-control" type="text">
                            </td>
                            <td class="text-center">
                                <a href="javascript:void(0)" class="text-danger font-18 " onclick="removeInvoiceTableRow(${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>
                            </td>
    `;
    if(tag_id.includes("editTable")){
        document.querySelector(".tbodytwo").appendChild(tableBody);
    } else {
        document.querySelector(".tbodyone").appendChild(tableBody);
    }
}

// Add Validation
function validatorAddCompanyDetails() {
    clearErrors();

    let isValid = true;

    // Get all field elements
    const companyName = document.getElementById('company_name');
    const companyMobile = document.getElementById('company_phone_no');
    const companyPincode = document.getElementById('company_pincode');
    const companyAddress = document.getElementById('company_address');

    // Validation logic
    // Validate vendor Name
    if (!companyName.value.trim() || /\d/.test(companyName.value)) {
        showError(companyName, 'Enter a valid Company name without numbers');
        isValid = false;
    }

    // Validate Mobile
    const mobileValue = companyMobile.value.trim();
    if (!mobileValue || mobileValue.length < 10 || mobileValue.length > 13 || !/^\d+$/.test(mobileValue)) {
        showError(companyMobile, 'Enter a valid phone number');
        isValid = false;
    }

    const companyPincodeValue = companyPincode.value.trim();
if (!companyPincodeValue) {
  showError(companyPincode, 'Company Pincode is required');
  isValid = false;
} else if (!/^\d{6}$/.test(companyPincodeValue)) {
  showError(companyPincode, 'Enter a valid 6-digit Pincode');
  isValid = false;
}


    // Validate Address
    if (!companyAddress.value.trim() || companyAddress.value.length < 5) {
        showError(companyAddress, 'Address must be at least 5 characters long');
        isValid = false;
    }

    return isValid;
}

// ==================================================================================================
// EDIT FORM VALIDATION
function validatorEditCompanyDetails() {
    clearErrors();

    let isValid = true;

    // Get all field elements
    const companyName = document.getElementById('edit_company_name');
    const companyMobile = document.getElementById('edit_company_phone_no');
    const companyPincode = document.getElementById('edit_company_pincode');
    const companyAddress = document.getElementById('edit_company_address');

    // Validation logic
    // Validate vendor Name
    if (!companyName.value.trim() || /\d/.test(companyName.value)) {
        showError(companyName, 'Enter a valid Company name without numbers');
        isValid = false;
    }

    // Validate Mobile
    const mobileValue = companyMobile.value.trim();
    if (!mobileValue || mobileValue.length < 10 || mobileValue.length > 13 || !/^\d+$/.test(mobileValue)) {
        showError(companyMobile, 'Enter a valid phone number');
        isValid = false;
    }

    const companyPincodeValue = companyPincode.value.trim();
if (!companyPincodeValue) {
  showError(companyPincode, 'Company Pincode is required');
  isValid = false;
} else if (!/^\d{6}$/.test(companyPincodeValue)) {
  showError(companyPincode, 'Enter a valid 6-digit Pincode');
  isValid = false;
}


    // Validate Address
    if (!companyAddress.value.trim() || companyAddress.value.length < 5) {
        showError(companyAddress, 'Address must be at least 5 characters long');
        isValid = false;
    }

    return isValid;
}
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

  











