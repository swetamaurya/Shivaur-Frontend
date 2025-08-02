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
import { enquiry_API, lead_API, companyDetails_API } from './apis.js';
import { capitalizeFirstLetter } from './globalFunctions2.js';

// =================================================================================
const token = localStorage.getItem('token');

let leadId = new URLSearchParams(window.location.search).get('id')
//Company API =============================================================================
let companyArr = [];
async function all_data_load_dashboard() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    
    let tableData = document.getElementById('customerCompany');
    // -----------------------------------------------------------------------------------
    try {
        const response = await fetch(`${companyDetails_API}/getAll`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const res = await response.json();

        // return;
        const users = res?.data;
        companyArr = users;
        if (users && users.length>0) {
            const rows = users.map((user,i) => {
                return `
                  ${(i==0 ? `<option value="" disabled selected>Select Company</option>` :  `` )}
                    <option value="${user?._id || '-'}" >${capitalizeFirstLetter(user?.companyName) || '-'}</option>
                `;
            });

            tableData.innerHTML = rows.join('');
        }
    } catch (error) {
      console.log(error)
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
}
all_data_load_dashboard()
//========================================================================================
//Code to generate the data of POS while selecting company name
let company = document.getElementById('customerCompany');
company.addEventListener('change',()=>{
  let name = document.getElementById('PIC');
  let phone = document.getElementById('phone');
  let email = document.getElementById('email');
  let selectedCompany = companyArr.filter((e)=>e._id === company.value)
  console.log('this is my selected company: ',);
  name.value = selectedCompany[0].POSDetails[0].POSName;
  phone.value = selectedCompany[0].POSDetails[0].POSNumber;
  email.value = selectedCompany[0].POSDetails[0].POSEmail;
})
//=========================================================================================
// =========================================================================================
// Showing the lead data if the user is come from the lead view page 
window.showData = async function showData() { 
  if (leadId) {
    const response = await fetch(`${lead_API}/get?id=${leadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const res = await response.json();
    console.log('This is my data: ', res);
    const lead = res.lead;
    document.getElementById('')
    document.getElementById('phone').value = lead.mobile[0] || '';
    document.getElementById('email').value = lead.email[0] || '';
    document.getElementById('company').value = lead.company || '';
    document.getElementById('department').value = lead.department || '';
    document.getElementById('designation').value = lead.designation || '';
    document.getElementById('PIC').value = lead.leadName || '';
  }
}
showData();




// Form submission handler
document.getElementById("add_enquiry_form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission behavior

  if (!validatorEnquiry()) {
    return;
  }

  const isFromLead = !!leadId; // Check if enquiry is being created from Lead page

  try {
    loading_shimmer(); // Show loading shimmer

    // Extract input values
    const enquiryDate = document.getElementById("enquiryDate").value.trim();
    const detailOfEnquiry = document.getElementById("detailOfEnquiry").value.trim();
    const enquiryTitle = document.getElementById("enquiryTitle").value.trim();
    const status = document.getElementById("status").value.trim();

    // Prepare request body
    const requestBody = {
      enquiryDate,
      detailOfEnquiry,
      enquiryTitle,
      status,
    };

    // Include leadId if creating from lead page
    if (isFromLead) {
      if (!leadId) throw new Error("Lead ID is missing!");
      requestBody.id = leadId; // Include leadId
    } else {
      // Include additional fields for standalone enquiries
      requestBody.PIC = document.getElementById("PIC").value.trim();
      requestBody.phone = document.getElementById("phone").value.trim();
      requestBody.email = document.getElementById("email").value.trim();
      requestBody.company = document.getElementById("customerCompany").value.trim();
      requestBody.department = document.getElementById("department").value.trim();
      requestBody.designation = document.getElementById("designation").value.trim();
    }

    console.log("Request Body:", requestBody.PIC);

    // Submit data to the server
    const response = await fetch(`${enquiry_API}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const res = await response.json();

    // Check if the request was successful
    if (!response.ok) throw new Error(res.message || "Failed to add enquiry");

    status_popup("Enquiry Created <br> Successfully!", true);

    // Redirect based on the context
    setTimeout(() => {
      if (isFromLead) {
        window.location.href = `lead-view.html?id=${leadId}`; // Redirect to Lead view
      } else {
        window.location.href = "enquiry-list.html"; // Redirect to Enquiry list
      }
    }, (Number(document.getElementById("b1b1").innerText) * 1000));
  } catch (error) {
    console.error("Error adding enquiry:", error);
    status_popup("Error adding Enquiry. Please try again.", false);
  } finally {
    remove_loading_shimmer(); // Hide loading shimmer
  }
});



 // Current Date getting 
let currentDate = document.getElementById('enquiryDate');
const fullDate = new Date();

let date = String(fullDate.getDate()).padStart(2, '0');
let month = String(fullDate.getMonth() + 1).padStart(2, '0');
let year = fullDate.getFullYear();

let cDate = `${year}-${month}-${date}`;
currentDate.value = cDate;
function validatorEnquiry() {
  // Clear previous errors
  clearErrors();

  let isValid = true;

  // Get all field elements
  const phone = document.getElementById('phone')
      const email = document.getElementById('email')
      const company = document.getElementById('company')
      const department = document.getElementById('department')
      const designation = document.getElementById('designation')
      const enquiryDate = document.getElementById("enquiryDate")
      const PIC = document.getElementById("PIC")
      const detailOfEnquiry = document.getElementById("detailOfEnquiry")
      const enquiryTitle = document.getElementById("enquiryTitle")
      const status = document.getElementById('status')

  // Validation logic
  // Validate Contractor Name
  if (!PIC.value.trim() || /\d/.test(PIC.value)) {
      showError(PIC, 'Enter a valid name');
      isValid = false;
  }

  // Validate Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailPattern.test(email.value)) {
      showError(email, 'Enter a valid email address');
      isValid = false;
  }

  // Validate Mobile
  const phoneValue = phone.value.trim();
  if (!phoneValue || phoneValue.length < 10 || phoneValue.length > 13 || !/^\d+$/.test(phoneValue)) {
      showError(phone, 'Enter a valid phone number');
      isValid = false;
  }


  // Validate Department
  if (!department.value.trim() || /\d/.test(department.value)) {
    showError(department, 'Enter a valid department name');
    isValid = false;
  }

  // Validate Designation
  if (!designation.value.trim() || /\d/.test(designation.value)) {
    showError(designation, 'Enter a valid designation name');
    isValid = false;
  }

  // Validate Company
  // if (!company.value.trim() || /\d/.test(company.value)) {
  //   showError(company, 'Enter a valid company name');
  //   isValid = false;
  // }

  // Validate Date
  if (!enquiryDate.value.trim()) {
    showError(enquiryDate, 'Enquiry date is required');
    isValid = false;
  }

  // Date must be above or equal to current date 
  if (enquiryDate.value < cDate) {
    showError(enquiryDate, 'Enquiry date must be above the current date');
    isValid = false;
  }

  if (!status.value.trim()) {
    showError(status, 'Please select a status');
    isValid = false;
  } 
  if (!detailOfEnquiry.value.trim()) {
    showError(detailOfEnquiry, 'Please fill the Enquiry Details');
    isValid = false;
  }
  if (!enquiryTitle.value.trim()) {
    showError(enquiryTitle, 'Please fill the Enquiry Title');
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


