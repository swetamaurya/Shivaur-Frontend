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


import {enquiry_API, companyDetails_API} from './apis.js';
import {status_popup , loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { capitalizeFirstLetter } from './globalFunctions2.js';

const token = localStorage.getItem('token');
// getting the Lead id 
let enquiryId = new URLSearchParams(window.location.search).get('_id')

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

window.editLoadData = async function editLoadData(){
    const enquiryDate = document.getElementById("enquiryDate")
    const PIC = document.getElementById("PIC")
    const detailOfEnquiry = document.getElementById("detailOfEnquiry")
    const enquiryTitle = document.getElementById("enquiryTitle")

    const phone = document.getElementById('phone')
      const email = document.getElementById('email')
      const company = document.getElementById('customerCompany')
      const department = document.getElementById('department')
      const designation = document.getElementById('designation')
      const status = document.getElementById('status')
      console.log('My id: ',enquiryId);

      const response = await fetch(`${enquiry_API}/get?_id=${enquiryId}`,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        }
      })
      const res = await response.json();
      let enquiry = res.enquiry || '';
      enquiryDate.value = enquiry.enquiryDate || '';
      phone.value = enquiry.phone || ''
      email.value = enquiry.email || ''
      PIC.value = enquiry.PIC || '';
      company.value = enquiry.company._id || '';
      department.value = enquiry.department || '';
      designation.value = enquiry.designation || '';
      detailOfEnquiry.value = enquiry.detailOfEnquiry || '';
    //   offerDate.value = enquiry.offerDate || '';
    //   offerReferenceNumber.value = enquiry.offerReferenceNumber || '';
      enquiryTitle.value = enquiry.enquiryTitle || '';
      status.value = enquiry.status || '';
}
editLoadData();

let edit_enquiry_form = document.getElementById('edit_enquiry_form')
edit_enquiry_form.addEventListener('submit',async(event)=>{
    event.preventDefault();

    if(!validatorEditEnquiry()){
      return
    }
    try {
        loading_shimmer();
        const enquiryDate = document.getElementById("enquiryDate").value.trim()
    const PIC = document.getElementById("PIC").value.trim()
    const detailOfEnquiry = document.getElementById("detailOfEnquiry").value.trim()
    const enquiryTitle = document.getElementById("enquiryTitle").value.trim()

    const phone = document.getElementById('phone').value.trim()
      const email = document.getElementById('email').value.trim()
      const company = document.getElementById('customerCompany').value.trim()
      const department = document.getElementById('department').value.trim()
      const designation = document.getElementById('designation').value.trim()
      const status = document.getElementById('status').value.trim();
        const id = enquiryId;
  
        const response = await fetch(`${enquiry_API}/update`,{
          method:'POST',
          headers:{
              'Content-Type':'application/json',
              'Authorization':`Bearer ${token}`
          },
          body:JSON.stringify({id,enquiryDate,PIC,detailOfEnquiry,enquiryTitle,phone,email,company,department,designation,status})
        })
        const res = await response.json();
        console.log(res);
        const c1=response.ok
        try{
            status_popup( ((c1) ? "Enquiry Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
            setTimeout(function(){
                window.location.href = 'enquiry-list.html';
            },(Number(document.getElementById("b1b1").innerText)*1000));
        } catch (error){
          status_popup( ("Please try <br> again later"), (false) );
        }
    } catch (error) {
        console.log('The error is ',error);
    }
    finally{
        remove_loading_shimmer()
    }
})


function validatorEditEnquiry() {
  // Clear previous errors
  clearErrors();

  let isValid = true;

  // Get all field elements
  const phone = document.getElementById('phone')
      const email = document.getElementById('email')
      const company = document.getElementById('customerCompany')
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
// if (enquiryDate.value < Date) {
//   showError(enquiryDate, 'Enquiry date must be above the current date');
//   isValid = false;
// }

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


