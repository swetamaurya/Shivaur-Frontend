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
  import {status_popup , loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
  import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
   import { saleInvoice_API , saleOrder_API } from './apis.js';
   
  
  // =================================================================================
  const token = localStorage.getItem('token');
  
  // =========================================================================================
  // Dropdown sale to
  let saleOrder=[];
  async function dropdownSaleToData(){
    let client = document.getElementById('client')
    const response = await fetch(`${saleOrder_API}/getAll`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      let res = await response.json();
      let sales = res.sales
      saleOrder = sales;

      saleOrder.forEach((data) => {
        const option = document.createElement("option");
        option.value = data._id;
        option.text = `${data?.client}`;
        client.appendChild(option);
      });
  }
  dropdownSaleToData();


  // =========================================================================================
  // Putting the values to the fields by selecting sale To
  document.getElementById('client').addEventListener('change',()=>{
    let client = document.getElementById('client');
    let saleData = saleOrder.filter(e=>e._id == client.value)
    console.log('this is my sale data ',saleData)
    console.log('this is my sale to id',client.value)
    // document.getElementById("material").value = saleData[0].material._id
    document.getElementById("material").value = saleData[0].material.material
    document.getElementById("customerOrderRef").value = saleData[0].customerOrderRef
    document.getElementById("orderDate").value = saleData[0].orderDate
    document.getElementById("advancePaymentRecord").value = saleData[0].advancePaymentRecord
    document.getElementById("advancePaymentDate").value = saleData[0].advancePaymentDate
    // document.getElementById("invoiceDate").value = saleData[0].invoiceDate
    // document.getElementById("invoiceNo").value = saleData[0].invoiceNo
    // document.getElementById("totalInvoiceAmount").value = saleData[0].totalInvoiceAmount
   document.getElementById("amountRecieved").value = saleData[0].amountReceived
    document.getElementById("amountRecievedtDate").value = saleData[0].amountReceivedDate
    document.getElementById("dues").value = saleData[0].dues
    document.getElementById("orderRef").value = saleData[0].orderRef
    document.getElementById("delieveryDateToConsumer").value = saleData[0].deliveryDateToCustomer
    // document.getElementById("salesInvoice").value = saleData[0].salesInvoice
    document.getElementById("startDate").value = saleData[0].startDate
    document.getElementById("completionDate").value = saleData[0].complitionDate
    document.getElementById("unitCost").value = saleData[0].unitCost
    document.getElementById("qty").value = saleData[0].quantity
    document.getElementById("hide").value = saleData[0].material._id
  })
 
  // =========================================================================================
  
  // Form submission handler
  document.getElementById("add_saleInvoice_form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // if (!validatorLead()) {
    //   return;
    // }
  
    try {
      loading_shimmer(); // Show loading shimmer
  
      // Extract input values
      const saleId = document.getElementById("client").value.trim();
      const material = document.getElementById("material").value.trim();
      const customerOrderRef = document.getElementById("customerOrderRef").value.trim();
      const orderDate = document.getElementById("orderDate").value.trim();
      const advancePaymentRecord = document.getElementById("advancePaymentRecord").value.trim();
      const advancePaymentDate = document.getElementById("advancePaymentDate").value.trim();
      // const invoiceDate = document.getElementById("invoiceDate").value.trim();
      // const invoiceNo = document.getElementById("invoiceNo").value.trim();
      const totalInvoiceAmount = document.getElementById("totalInvoiceAmount").value;
      const amountReceived = document.getElementById("amountRecieved").value.trim();
      const amountReceivedDate = document.getElementById("amountRecievedtDate").value.trim()
      const dues = document.getElementById("dues").value.trim()
      const orderRef = document.getElementById("orderRef").value.trim()
      const deliveryDateToCustomer = document.getElementById("delieveryDateToConsumer").value.trim()
      const unitCost = document.getElementById("hide").value.trim();
      const quantity = document.getElementById("qty").value.trim();
      const salesInvoice = document.getElementById("salesInvoice").value.trim()
      const startDate = document.getElementById("startDate").value.trim()
      const complitionDate = document.getElementById("completionDate").value.trim()
      
  

      // Prepare data object
      const sales = {
        saleId,
        salesInvoice,
        totalInvoiceAmount
      };
      console.log('this is my sale ',saleId)
  
      // Submit data to the server
      const response = await fetch(`${saleInvoice_API}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sales),
      }); 
      const res = await response.json()
      console.log('THIS IS MY DATA: ',res)
  
      // Check if the request was successful
      if (!response.ok) throw new Error("Failed to add lead");
  
      status_popup("Sale Invoice Created <br> Successfully!", true);  
      setTimeout(function(){
        window.location.href = 'sale-invoice-list.html';
    },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error) {
      console.error("Error adding lead:", error);
      status_popup("Error adding Lead. Please try again.", false);
    } finally {
      remove_loading_shimmer(); // Hide loading shimmer
    }
  });

  // Validate Lead 

  function validatorLead() {
    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Get all field elements
    const leadName = document.getElementById("leadName")
    const email = document.getElementById("email")
    const mobile = document.getElementById('mobile');
    const department = document.getElementById("department")
    const designation = document.getElementById("designation")
    const company = document.getElementById("company_organization")
    const address = document.getElementById('address');
    const date = document.getElementById("date")
    const status = document.getElementById("status")

    const emailArray = email.value.trim().split(",").map((email) => email.trim()).filter((email) => email);
    const mobileArray = mobile.value.trim().split(",").map((mobile) => mobile.trim()).filter((mobile) => mobile);

    // Validation logic
    // Validate Contractor Name
    if (!leadName.value.trim() || /\d/.test(leadName.value)) {
        showError(leadName, 'Enter a valid name without numbers');
        isValid = false;
    }

    if(!email.value){
      showError(email, 'Enter email address');
      isValid = false;
    }
    if(!mobile.value){
      showError(mobile, 'Enter mobile');
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailArray.forEach((emailItem) => {
        if (!emailItem || !emailPattern.test(emailItem)) {
            showError(email, 'Enter a valid email address');
            isValid = false;
        }
    });

    // Validate each mobile in the array
    mobileArray.forEach((mobileItem) => {
        if (!mobileItem || mobileItem.length < 10 || mobileItem.length > 13 || !/^\d+$/.test(mobileItem)) {
            showError(mobile, 'Enter a valid phone number (10 to 13 digits)');
            isValid = false;
        }
    });


    // Validate Department
    if (!department.value.trim() || /\d/.test(department.value)) {
      showError(department, 'Enter a valid name without numbers');
      isValid = false;
    }

    // Validate Designation
    if (!designation.value.trim() || /\d/.test(designation.value)) {
      showError(designation, 'Enter a valid name without numbers');
      isValid = false;
    }

    // Validate Company
    if (!company.value.trim() || /\d/.test(company.value)) {
      showError(company, 'Enter a valid name without numbers');
      isValid = false;
    }

    // Validate Address
    if (!address.value.trim() || address.value.length < 5) {
        showError(address, 'Address must be at least 5 characters long');
        isValid = false;
    }

    // Validate Date
    if (!date.value.trim()) {
      showError(date, 'Joining date is required');
      isValid = false;
    }
    if (!status.value.trim()) {
      showError(status, 'Please select a status');
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