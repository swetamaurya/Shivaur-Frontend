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
  
import {offer_API,companyDetails_API} from './apis.js';
import {status_popup , loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { capitalizeFirstLetter } from './globalFunctions2.js';

const token = localStorage.getItem('token');

// getting the Lead id 
let offerId = new URLSearchParams(window.location.search).get('id')

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

window.editLoadData = async function editLoadData() {
    // const offerReferenceNumber = document.getElementById("ref");
    const PIC = document.getElementById("customerName");
    const email = document.getElementById("customerEmail");
    const phone = document.getElementById("customerPhone");
    const department = document.getElementById("customerDepartment");
    const designation = document.getElementById("customerDesignation");
    const company = document.getElementById("customerCompany");
    const enquiryTitle = document.getElementById("enquiryTitle");
    const offerTitle = document.getElementById("offerTitle");
    const offerDate = document.getElementById("date");
    const price = document.getElementById("offerPrice");
    const additionalInfo = document.getElementById("description");
    const emdSelectStatus1 = document.getElementById("emdSelectStatus");
    const emdDetails1 = document.getElementById("emdDetails");
    const emdAmount = document.getElementById("emdAmount");
    const emdDate = document.getElementById("emdDate");
    const offerConvertStatus = document.getElementById("offerStatus");
    const emdInstrumentNumber = document.getElementById("emdInstrumentNumber");
    const emdRemark = document.getElementById("emdRemark");
    const lostOrderReason = document.getElementById('emdSelect')
        const remark = document.getElementById('addRemark')
        const addRemark = document.getElementById('add-remark')
        const lostOfOrderReason = document.getElementById('lostOrderReason')


    try {
        const response = await fetch(`${offer_API}/get?id=${offerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }, 
        });

        const res = await response.json();
        console.log('API Response: ', res);

        const offer = res.offer || '';

        // Populate fields
        PIC.value = offer.enquiry?.PIC || offer.PIC || '';
        email.value = offer.enquiry?.email || offer.email || '';
        phone.value = offer.enquiry?.phone || offer.phone || '';
        department.value = offer.enquiry?.department || offer.department || '';
        designation.value = offer.enquiry?.designation || offer.designation || '';
        company.value = offer.enquiry?.company._id || offer.company._id || '';
        enquiryTitle.value = offer.enquiry?.enquiryTitle || offer.enquiryTitle || '';
        offerTitle.value = offer.offerTitle || '';
        offerDate.value = offer.offerDate || '';
        price.value = offer.price || '';
        additionalInfo.value = offer.additionalInfo || '';
        // offerReferenceNumber.value = offer.offerReferenceNumber || '';
        emdSelectStatus1.value = offer.emd_Status || '';
        offerConvertStatus.value = offer.offerConvertStatus || '';

        if(offer.emd_Status && offer.emd_Status == 'Yes'){
            emdDetails1.style.display = 'block'
            emdAmount.value = offer.EMD.emdAmount || '-';
            emdDate.value = offer.EMD.emdDate || '-';
            // emdInstrumentNumber.value = offer.EMD.emdInstumentNumber || '-';
            emdRemark.value = offer.EMD.emdRemark || '-';
        }
        else{
            emdDetails1.style.display = 'none'
        }

        if(offer.offerConvertStatus && offer.offerConvertStatus == 'Lost'){
            lostOfOrderReason.style.display = 'block';
            lostOrderReason.value = offer.lostOrderReason
        }
        else{
            lostOfOrderReason.style.display = 'none';
        }

        if(lostOrderReason.value == 'Custom Reasons'){
            addRemark.style.display = 'block'
            remark.value = offer.remark;
        }
        else{
            addRemark.style.display = 'none'
        }


        // Wait for policy editor initialization
        const waitForPolicyEditor = () => {
            return new Promise((resolve) => {
                const checkEditor = setInterval(() => {
                    const policyEditor = document.querySelector('.note-editable');
                    if (policyEditor) {
                        clearInterval(checkEditor);
                        resolve(policyEditor);
                    }
                }, 100); // Check every 100ms
            });
        };

        const policyEditor = await waitForPolicyEditor();
        console.log('Policy Content: ', offer.policy);
        policyEditor.innerHTML = offer.policy || '<p>-</p>'; // Populate the editor
    } catch (error) {
        console.error('Error loading offer data:', error);
    }
};



editLoadData();

let edit_offer_form = document.getElementById('edit_offer_form')
edit_offer_form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if(!validatorEditOffer()){
        return
    }

    try {
        loading_shimmer();
        const offerDate = document.getElementById("date").value.trim();
        const policyElement = document.querySelector('.note-editable');
        const policy = policyElement ? policyElement.innerHTML.trim() : '';         
        const price = document.getElementById("offerPrice").value.trim();
        const additionalInfo = document.getElementById("description").value.trim();
        const PIC = document.getElementById("customerName").value.trim();
        const email = document.getElementById("customerEmail").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const department = document.getElementById("customerDepartment").value.trim();
        const company = document.getElementById("customerCompany").value.trim();
        const enquiryTitle = document.getElementById("enquiryTitle").value.trim();
        const offerTitle = document.getElementById("offerTitle").value.trim();
        const offerConvertStatus = document.getElementById("offerStatus").value.trim();
        const lostOrderReason = document.getElementById('emdSelect').value.trim();
        const emd_Status = document.getElementById('emdSelectStatus').value.trim();
        const remark = document.getElementById('addRemark').value.trim();

        const id = offerId;
        // const offerReferenceNumber = document.getElementById("ref").value.trim();

        const response = await fetch(`${offer_API}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                id, PIC, phone, department, company,offerTitle,enquiryTitle, email, policy, price, additionalInfo, offerDate,offerConvertStatus,lostOrderReason,remark,emd_Status
            }),
        });

        const res = await response.json();
        console.log(res);

        if (response.ok) {
            status_popup('Offer Updated <br> Successfully!', true);
            setTimeout(function(){
                window.location.href = 'offer-list.html';
            },(Number(document.getElementById("b1b1").innerText)*1000));
        } else {
            status_popup('Error Updating Offer', false);
        }
    } catch (error) {
        console.error('Error:', error);
        status_popup('Error Updating Offer', false);
    } finally {
        remove_loading_shimmer();
    }
});


// Validation 
function validatorEditOffer() {
    // Clear previous errors
    clearErrors();
  
    let isValid = true;
  
    // Get all field elements
    // const offerReferenceNumber = document.getElementById("ref")
    const offerDate = document.getElementById("date")
    const policy = document.querySelector('.note-editable').childNodes[0]?.textContent || '';
    const price = document.getElementById("offerPrice")
    const additionalInfo = document.getElementById("description")
    const offerTitle = document.getElementById("offerTitle")
    const email = document.getElementById('customerEmail')
    const phone = document.getElementById('customerPhone')
    const department = document.getElementById('customerDepartment')
    const company = document.getElementById('customerCompany')
    const PIC = document.getElementById('customerName')
    const enquiryTitle = document.getElementById('enquiryTitle')
    const termsCondition = document.getElementById('termsCondition')
  
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
  
    // // Date must be above or equal to current date 
    // if (offerDate.value < cDate) {
    //   showError(offerDate, 'Offer date must be above or equals to current date');
    //   isValid = false;
    // }
    if (!price.value.trim() || !/^\d+$/.test(price.value.trim())) {
        showError(price, 'Please enter a valid price');
        isValid = false;
      }
    //   if (!additionalInfo.value.trim()) {
    //     showError(additionalInfo, 'Please fill the Information');
    //     isValid = false;
    //   }
      if (!offerTitle.value.trim()) {
        showError(offerTitle, 'Please fill the Offer Title');
        isValid = false;
      }
      if (!enquiryTitle.value.trim()) {
        showError(enquiryTitle, 'Please fill the Enquiry Title');
        isValid = false;
      }
  
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
    //     try {
    //         let showError = document.getElementById('showError')
    //         showError.remove();
    //     } catch (error) {
    //         console.log(error);
    //     }
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

//  Showing the Lost order field when the status lost

let addRemark = document.getElementById('add-remark');
let emdSelect = document.getElementById('emdSelect');
let offerStatus = document.getElementById('offerStatus') 
offerStatus.addEventListener('change',()=>{
    let lostOrderReason = document.getElementById('lostOrderReason') 
    let offerStatus1 = document.getElementById('offerStatus')
    if(offerStatus1.value == 'Lost'){
        lostOrderReason.style.display = 'block';
    } 
    else{
        if(addRemark.style.display!='none'){
            addRemark.style.display='none'
        }
        lostOrderReason.style.display = 'none';
    }
})

emdSelect.addEventListener('change',()=>{
    if(emdSelect.value == 'Custom Reasons'){
        addRemark.style.display = 'block';
    }
    else{
        addRemark.style.display = 'none';
    }
})

const emdSelectStatus = document.getElementById("emdSelectStatus");
      const emdDetails = document.getElementById("emdDetails");

      // Add event listener to the dropdown
      emdSelectStatus.addEventListener("change", function () {
        if (emdSelectStatus.value === "Yes") {
          emdDetails.style.display = "block"; // Show EMD section
        } else {
          emdDetails.style.display = "none"; // Hide EMD section
        }
      });

