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
// ============================================================================================
import { companyDetails_API, enquiry_API, offer_API } from './apis.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { capitalizeFirstLetter } from './globalFunctions2.js';
// ============================================================================================
const token = localStorage.getItem('token');
// ============================================================================================
// Getting the Enquiry ID from URL
let enquiryId = new URLSearchParams(window.location.search).get('id'); 
// ============================================================================================
// ============================================================================================
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
all_data_load_dashboard();
//Code to generate the data of POS while selecting company name
let company = document.getElementById('customerCompany');
company.addEventListener('change',()=>{
  let name = document.getElementById('customerName');
  let phone = document.getElementById('customerPhone');
  let email = document.getElementById('customerEmail');
  let selectedCompany = companyArr.filter((e)=>e._id === company.value)
  console.log('this is my selected company: ',);
  name.value = selectedCompany[0].POSDetails[0].POSName;
  phone.value = selectedCompany[0].POSDetails[0].POSNumber;
  email.value = selectedCompany[0].POSDetails[0].POSEmail;
})
//=========================================================================================

// ============================================================================================
// ============================================================================================
// ============================================================================================
// Load Data for Enquiry Linked Offer
window.editLoadData = async function editLoadData() {
  if (!enquiryId) return; // If no enquiryId, do nothing.

  // const offerReferenceNumber = document.getElementById("ref");
  const PIC = document.getElementById("customerName");
  const email = document.getElementById("customerEmail");
  const phone = document.getElementById("customerPhone");
  const department = document.getElementById("customerDepartment");
  const designation = document.getElementById("customerDesignation");

  const company = document.getElementById("customerCompany");
  const enquiryTitle = document.getElementById("enquiryTitle");

  try {
    const response = await fetch(`${enquiry_API}/get?_id=${enquiryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const res = await response.json();
    console.log('MY RESPONSE: ', res);

    let enquiry = res.enquiry || {};
    PIC.value = enquiry.lead?.leadName || enquiry.PIC || '';
    email.value = enquiry.lead?.email[0] || enquiry.email ||'';
    phone.value = enquiry.lead?.mobile[0] || enquiry.phone ||'';
    department.value = enquiry.lead?.department || enquiry.department ||'';
    designation.value = enquiry.lead?.designation || enquiry.designation ||'';
    company.value = enquiry.lead?.company || enquiry.company ||'';
    enquiryTitle.value = enquiry.enquiryTitle || enquiry.enquiryTitle ||'';
    // offerReferenceNumber.value = enquiry.offerReferenceNumber || '';
  } catch (error) {
    console.error('Error loading enquiry data: ', error.message);
  }
};
editLoadData();

// Set Current Date for Offer
let currentDate = document.getElementById('date');
const fullDate = new Date();
currentDate.value = fullDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

// Handle the visibility of EMD details based on EMD Status
const emdSelect = document.getElementById("emdSelect");
const emdDetails = document.getElementById("emdDetails");

emdSelect.addEventListener("change", function () {
  if (this.value === "Yes") {
    emdDetails.style.display = "block";
  } else {
    emdDetails.style.display = "none";
  }
});

// Handle Offer Submission
let add_offer_form = document.getElementById('add_offer_form');
add_offer_form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validatorOffer()) return;

  const isFromEnquiry = !!enquiryId; // Check if adding from enquiry
  const offerId = document.getElementById("offerId")?.value; // Get offerId from hidden field

  try {
    loading_shimmer();

    // const offerReferenceNumber = document.getElementById("ref").value.trim();
    const offerDate = document.getElementById("date").value.trim();
    const policy = document.querySelector('.note-editable').childNodes[0]?.textContent || '';
    const price = document.getElementById("offerPrice").value.trim();
    const additionalInfo = document.getElementById("description").value.trim();
    const offerTitle = document.getElementById("offerTitle").value.trim();
    const emd_Status = document.getElementById("emdSelect").value.trim();

    // Collect EMD details if EMD Status is "Yes"
    const emdDetails = emd_Status === "Yes" ? {
      emdAmount: document.getElementById("emdAmount").value.trim(),
      emdDate: document.getElementById("emdDate").value.trim(),
      // emdInstrumentNumber: document.getElementById("emdInstrumentNumber").value.trim(),
      emdRemark: document.getElementById("emdRemark").value.trim(),
    } : null;

    // Common Data
    const offerData = {
      // offerReferenceNumber,
      offerDate,
      policy,
      price,
      additionalInfo,
      offerTitle,
      emd_Status,
      EMD: emdDetails,
    };

    // Add enquiry-specific data
    if (isFromEnquiry) {
      offerData.enquiryId = enquiryId;
    } else {
      offerData.enquiryTitle = document.getElementById('enquiryTitle').value.trim();
      offerData.PIC = document.getElementById('customerName').value.trim();
      offerData.email = document.getElementById('customerEmail').value.trim();
      offerData.phone = document.getElementById('customerPhone').value.trim();
      offerData.department = document.getElementById('customerDepartment').value.trim();
      offerData.company = document.getElementById('customerCompany').value.trim();
      offerData.designation = document.getElementById('customerDesignation').value.trim();
    }

    // API selection based on offerId
    const apiUrl = offerId ? `${offer_API}/update` : `${offer_API}/post`;

    // Include offerId for updates
    if (offerId) {
      offerData.id = offerId;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(offerData),
    });

    const res = await response.json();
    console.log(res);

    const success = response.ok;
    status_popup(
      success ? "Offer Saved <br> Successfully!" : "Please try <br> again later",
      success
    );

    if (success) {
      setTimeout(() => {
        if (isFromEnquiry) {
          window.location.href = `enquiry-view.html?_id=${enquiryId}`;
        } else {
          window.location.href = 'offer-list.html';
        }
      }, (Number(document.getElementById("b1b1").innerText) * 1000));
    }
  } catch (error) {
    console.error('Error submitting offer:', error.message);
    status_popup("Error adding offer. Please try again.", false);
  } finally {
    remove_loading_shimmer();
  }
});


// validation 

function validatorOffer() {
  // Clear previous errors
  clearErrors();

  let isValid = true;

  // Get all field elements
  // const offerReferenceNumber = document.getElementById("ref")
  const offerDate = document.getElementById("date")
  // const policy = document.querySelector('.note-editable').childNodes[0]?.textContent || '';
  const price = document.getElementById("offerPrice")
  const additionalInfo = document.getElementById("description")
  const offerTitle = document.getElementById("offerTitle")
  const email = document.getElementById('customerEmail')
  const phone = document.getElementById('customerPhone')
  const department = document.getElementById('customerDepartment')
  const company = document.getElementById('customerCompany')
  const PIC = document.getElementById('customerName')
  const enquiryTitle = document.getElementById('enquiryTitle')
  // const termsCondition = document.getElementById('termsCondition')

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

  // Validate Company
  // if (!company.value.trim() || /\d/.test(company.value)) {
  //   showError(company, 'Enter a valid company name');
  //   isValid = false;
  // }

  // Validate Date
  // if (!offerReferenceNumber.value.trim()) {
  //   showError(offerReferenceNumber, 'Enter a valid reference number');
  //   isValid = false;
  // }

  if (!price.value.trim() || !/^\d+$/.test(price.value.trim())) {
    showError(price, 'Please enter a valid price');
    isValid = false;
  }
  // if (!additionalInfo.value.trim()) {
  //   showError(additionalInfo, 'Please fill the Information');
  //   isValid = false;
  // }
  if (!offerTitle.value.trim()) {
    showError(offerTitle, 'Please fill the Offer Title');
    isValid = false;
  }
  if (!enquiryTitle.value.trim()) {
    showError(enquiryTitle, 'Please fill the Enquiry Title');
    isValid = false;
  }
  // Date must be above or equal to current date 
  // if (offerDate.value < Date) {
  //   showError(offerDate, 'Offer date must be above or equals to current date');
  //   isValid = false;
  // }

  // let span;
  // if (!policy.trim()) {
  //   span = document.createElement('span');
  //   span.innerText = 'X  Please fill the terms and condition';
  //   span.style.color = '#fc133d';
  //   span.style.fontSize = '10px';
  //   span.setAttribute('id','showError')
  //   termsCondition.appendChild(span);
  //   isValid = false;
  // } 
  // else{
  //   try {
  //     let showError = document.getElementById('showError')
  //     showError.remove();
  // } catch (error) {
  //     console.log(error);
  // }
  //   // span = null;
  // }
  

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