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
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { user_API, project_API, estimate_API } from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================

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
  
    const client_select_option = document.getElementById("client_select_option");
    res.users.clients.forEach((client) => {
        const option = document.createElement("option");
        option.value = client._id;
        option.text = `${client?.name} (${client?.userId})`;
        client_select_option.appendChild(option);
    });
}
catch(error){
    console.error('Error fetching data:', error);
}
// ----------------------------------------------------------------------------------
let cachedProject = [];
async function showProjectDropdown(){
    const r1 = await fetch(`${project_API}/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
    const r2 = await r1.json();
    cachedProject = r2?.data;

    console.log("bro :- ",cachedProject)
    
    const project_select_option = document.getElementById("project_select_option");
    console.log(r2?.projects);
    cachedProject.map((e) => {
        let a1 = document.createElement("option");
        a1.value = e?._id || '-';
        a1.text = `${e?.projectName} (${e?.projectId})` || '-' ;
        project_select_option.appendChild(a1);
    });
}
showProjectDropdown();
// ----------------------------------------------------------------------------------



function rtnProj(e){
    let data = cachedProject.find(d=> d._id == e);
    return data?.clientName;
};
// ----------------------------------------------------------------------------------
document.getElementById("project_select_option").addEventListener("change", function(event){
    let a1 = rtnProj(event.target.value);
    console.log(a1);
    document.getElementById("client_select_option").value = a1?._id;


    
    let data = cachedClients.find(d=> d._id == a1?._id);

    document.getElementById("email").value = data?.email;
    document.getElementById("clientAddress").value = data?.address;
    document.getElementById("billingAddress").value = data?.address;

})
// ----------------------------------------------------------------------------------

// Create Estimate API start
const createEstimateForm = document.getElementById('create-estimate-form');
createEstimateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    try {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const clientAddress = document.getElementById('clientAddress').value;
        const billingAddress = document.getElementById('billingAddress').value;
        const estimateDate = document.getElementById('estimateDate').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const tax = document.getElementById('tax').value;
        const client = document.getElementById('client_select_option').value;
        const project = document.getElementById('project_select_option').value
        const taxType = document.getElementById('taxType').value
        var total = document.getElementById('totalAmount').value;
        var discount = document.getElementById('discount').value;
        var GrandTotal = document.getElementById('grandTotal').value;
        let otherInfo = document.getElementById("otherInfo").value;

        let details = [];
        const items = document.getElementsByClassName('item');
        const descriptions = document.getElementsByClassName('description');
        const unitCosts = document.getElementsByClassName('unitCost');
        const quantities = document.getElementsByClassName('quantity');
        const amounts = document.getElementsByClassName('invoiceAmount');


        for (let i = 0; i < items.length; i++) {
            details.push({
                item: items[i].value,
                description: descriptions[i].value,
                unitCost: unitCosts[i].value,
                qty: quantities[i].value,
                amount: amounts[i].value
            });
        }

        const response = await fetch(`${estimate_API}/post`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email, clientAddress, billingAddress, estimateDate, expiryDate, details, tax, total, GrandTotal, client, project, taxType, discount, otherInfo
            })
        })
        
        const c1 = (response.ok);
        try{
            status_popup( ((c1) ? "Estimate Created <br> Successfully" : "Please try <br> again later"), (c1) );
            setTimeout(function(){
                window.location.href = 'estimates.html';
            },(Number(document.getElementById("b1b1").innerText)*1000));
        } catch (error){
            status_popup( ("Please try <br> again later"), (false) );
        }
    } catch (error) {
        status_popup( ("Please try <br> again later"), (false) );
        console.error('Error updating employee:', error);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})

// Remove Table row function globally declared for reuse
window.removeInvoiceTableRow = function removeInvoiceTableRow(i, tag_id) {
    document.getElementById(tag_id).children[1].children[i - 1].remove();
    Array.from(document.getElementById(tag_id).children[1].children).map(
        (e, i) => {
            var dummyNo1 = i + 1;
            if (dummyNo1 != 1) {
                e.cells[0].innerText = dummyNo1;
                e.cells[(e.cells.length) - 1].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeInvoiceTableRow(${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
            }
        }
    );
}

// Add Table Row function globally declared for reuse
window.addInvoiceTableRow = function addInvoiceTableRow(tag_id) {
    const varTableConst = document.getElementById(tag_id).children[1].children;
    const i = Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
    var tableBody = document.createElement("tr");
    tableBody.innerHTML = `
                        <td>${i}</td> 
                        <td>
                            <input class="form-control item" type="text">
                        </td>
                        <td>
                            <input class="form-control description" type="text">
                        </td>
                        <td>
                            <input class="form-control unitCost" value="0" type="number"  onkeypress="return ((event.charCode == 46) || (event.charCode >= 48 && event.charCode <= 57))">
                        </td>
                        <td>
                            <input class="form-control quantity" value="0" type="number"  onkeypress="return ((event.charCode >= 48 && event.charCode <= 57))">
                        </td> 
                        <td>
                            <input class="form-control invoiceAmount" disabled value="0" type="number">
                        </td>
                        <td> 
                            <a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeInvoiceTableRow(${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>
                        </td>
                        `;
    // tableBody.classList.add("installmentData");
    document.querySelector("#esitmate_table_dym_row").appendChild(tableBody);
    f();
}
// ======================================================================================================
// ======================================================================================================
// ======================================================================================================
// ======================================================================================================
function cccc(){
    // Function to calculate the invoice amount for a given row
    function calculateInvoiceAmount(row) {
        const unitCost = parseFloat(row.querySelector('.unitCost').value) || 0; // Default to 0 if not a number
        const quantity = parseFloat(row.querySelector('.quantity').value) || 0; // Default to 0 if not a number
        const totalAmount = unitCost * quantity;
        row.querySelector('.invoiceAmount').value = totalAmount.toFixed(2); // Format as two decimal places

        t_amt();
    }
    // Attach event listeners to existing rows
    const rows = document.querySelectorAll('.tbodyone tr');
    rows.forEach(row => {
        const unitCostInput = row.querySelector('.unitCost');
        const quantityInput = row.querySelector('.quantity');

        // Event listener for unitCost change
        unitCostInput.addEventListener('input', function() {
            calculateInvoiceAmount(row);
        });

        // Event listener for quantity change
        quantityInput.addEventListener('input', function() {
            calculateInvoiceAmount(row);
        });
    });
}
function f(){
    Array.from(document.querySelectorAll(".unitCost")).map(e=>{
        e.removeEventListener("input", cccc);
        e.addEventListener("input", cccc);
    })
    Array.from(document.querySelectorAll(".quantity")).map(e=>{
        e.removeEventListener("input", cccc);
        e.addEventListener("input", cccc);
    })
}
f();
document.getElementById("discount").addEventListener("input",all)
document.getElementById("tax").addEventListener("input",all);
function t_amt(){
    let a1 = 0;
    Array.from(document.querySelectorAll(".invoiceAmount")).map(e=> a1+=Number(e.value));
    document.getElementById("totalAmount").value = a1;
    all();
}
function all(){
    let discount = Number(document.getElementById("discount").value);
    let tax = Number(document.getElementById("tax").value);
    let totalAmount = Number(document.getElementById("totalAmount").value);

    let a1 = (totalAmount*discount)/100;
    let a2 = (totalAmount-a1);
    let a3 = (a2*tax)/100;
    let a4 = a2+a3;

    document.getElementById("grandTotal").value = a4.toFixed(2);;
}
// ======================================================================================================
// ======================================================================================================
// ======================================================================================================
// ======================================================================================================


// Validation Function
function validateForm() {
    clearErrors(); // Clear previous error messages
  
    let isValid = true;
  
    // Get all form elements
    const projectSelect = document.getElementById("project_select_option");
    const clientSelect = document.getElementById("client_select_option");
    const estimateDate = document.getElementById("estimateDate");
    const expiryDate = document.getElementById("expiryDate");
    const taxType = document.getElementById("taxType");
    const billingAddress = document.getElementById("billingAddress");
  
    // Assign Project Validation
    if (!projectSelect.value.trim()) {
      showError(projectSelect, "Please select an assigned project");
      isValid = false;
    }
  
    // Client Name Validation
    if (!clientSelect.value.trim()) {
      showError(clientSelect, "Please select a client");
      isValid = false;
    }
  
    // Estimate Date Validation
    if (!estimateDate.value.trim()) {
      showError(estimateDate, "Please select an estimate date");
      isValid = false;
    }
  
    // Expiry Date Validation
    if (!expiryDate.value.trim()) {
      showError(expiryDate, "Please select an expiry date");
      isValid = false;
    }
  
    // Tax Type Validation
    if (!taxType.value.trim()) {
      showError(taxType, "Please select a tax type");
      isValid = false;
    }
  
    // Billing Address Validation
    if (!billingAddress.value.trim()) {
      showError(billingAddress, "Billing address is required");
      isValid = false;
    }
  
    return isValid;
  }
  
// --------------------------------------------------------------------------------------------------
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
