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

import {lead_API} from './apis.js';
import {status_popup , loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';

const token = localStorage.getItem('token');

// getting the Lead id 
let leadId = new URLSearchParams(window.location.search).get('id')
let callInfoId;

window.editLoadData = async function editLoadData(){
      const leadName = document.getElementById("leadName")
      const email = document.getElementById("email")
      const mobile = document.getElementById("mobile")
      const department = document.getElementById("department")
      const designation = document.getElementById("designation")
      const company = document.getElementById("company_organization")
      const address = document.getElementById("address")
      const date = document.getElementById("date")
      const status = document.getElementById("status")
      const description = document.getElementById("description")
      const userName = document.getElementById("createdBy")

      const createdByFollowUp = document.getElementById('createdByFollowUp');
      const date1 = document.getElementById('follow-up-date');
      const remark = document.getElementById('follow-up-remark');
      const status1 = document.getElementById('follow-up-status');
      const nextFollowUpdate = document.getElementById('follow-up-next-date');
      const zipCode = document.getElementById("zipCode")

      const response = await fetch(`${lead_API}/get?id=${leadId}`,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        }
      })
      const res = await response.json();
      let lead = res.lead;
      console.log('My Lead Data is ',lead);
      leadName.value = lead.leadName
      email.value = lead.email.join(" ,")
      mobile.value = lead.mobile.join(" ,")
      department.value = lead.department;
      designation.value = lead.designation;
      company.value = lead.company;
      address.value = lead.address;
      date.value = lead.date;
      status.value = lead.status;
      description.value = lead.description;
      userName.value = lead.createdBy;
      zipCode.value = lead.zipCode;

    if(lead.callInfo !== null && lead.callInfo.length > 0){
        let editFollowBtn = document.getElementById('addEditFollowUpBtn');
        editFollowBtn.innerHTML = `
        <a href="#" style="min-width:60px;" data-bs-toggle="modal" data-bs-target="#addFollowups" class="btn rounded add-btn hr_restriction employee_restriction">
           Edit Follow Up
        </a>
        `
        createdByFollowUp.value = lead.callInfo[lead.callInfo.length-1].createdByFollowUp
        date1.value = lead.callInfo[lead.callInfo.length-1].date
        remark.value = lead.callInfo[lead.callInfo.length-1].remark
        status1.value = lead.callInfo[lead.callInfo.length-1].status
        nextFollowUpdate.value = lead.callInfo[lead.callInfo.length-1].nextFollowUpdate
        callInfoId = lead.callInfo[lead.callInfo.length-1]._id
    }

}
editLoadData();

let edit_lead_form = document.getElementById('edit_lead_form')
edit_lead_form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    if (!validatorEditLead()) {
      return;
    }
    try {
        loading_shimmer();
        const leadName = document.getElementById("leadName").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const department = document.getElementById("department").value.trim();
        const designation = document.getElementById("designation").value.trim();
        const company = document.getElementById("company_organization").value.trim();
        const address = document.getElementById("address").value.trim();
        const date = document.getElementById("date").value.trim();
        const status = document.getElementById("status").value;
        const description = document.getElementById("description").value.trim();
        const zipCode = document.getElementById("zipCode").value.trim()
        const id = leadId;
  
        const response = await fetch(`${lead_API}/update`,{
          method:'POST',
          headers:{
              'Content-Type':'application/json',
              'Authorization':`Bearer ${token}`
          },
          body:JSON.stringify({id,leadName,email,mobile,department,designation,company,address,date,description,zipCode,status})
        })
        const res = await response.json();
        console.log(res);
        const c1=response.ok
        try{
            status_popup( ((c1) ? "Data Added <br> Successfully" : "Please try <br> again later"), (c1) );
            setTimeout(function(){
                window.location.href = 'lead-list.html';
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
let ID = leadId;
const edit_FollowUp_form = document.getElementById('edit_FollowUp_form');
edit_FollowUp_form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    if (!validatorEditFollowUp()) {
      return;
    }
    try{
      document.querySelectorAll(".btn-close").forEach(e=>e.click());
    } catch(error){console.log(error)}
        try {
          loading_shimmer();
          let leadId = ID;
          let callId = callInfoId
          
        //    const createdByFollowUp=document.getElementById('createdByFollowUp').value
           const date= document.getElementById('follow-up-date').value
           const nextFollowUpdate= document.getElementById('follow-up-next-date').value
           const remark= document.getElementById('follow-up-remark').value
           const status= document.getElementById('follow-up-status').value
          
          const response = await fetch(`${lead_API}/update-call`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({leadId,callId,date,nextFollowUpdate,remark,status}),
          });
          const res = await response.json()
          console.log('my response: ',res)
          const c1=response.ok
              try{
                  status_popup( ((c1) ? "Call Info Updated <br> Successfully" : "Please try <br> again later"), (c1) );
                  setTimeout(function(){
                    window.location.href = 'lead-list.html';
                  },(Number(document.getElementById("b1b1").innerText)*1000));
              } catch (error){
                status_popup( ("Please try <br> again later"), (false) );
              }
        } catch (error) {
          console.log('Error is ',error);
        }
        finally{
          remove_loading_shimmer();
        }
})

//  Validate Edit Lead 

  function validatorEditLead() {
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
    const zipCode = document.getElementById("zipCode")

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
        if (!emailItem && !emailPattern.test(emailItem)) {
            showError(email, 'Enter a valid email address');
            isValid = false;
        }
    });

    // Validate each mobile in the array
    mobileArray.forEach((mobileItem) => {
        if (!mobileItem && mobileItem.length < 10 || mobileItem.length > 13 || !/^\d+$/.test(mobileItem)) {
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
    if (!zipCode.value.trim() || zipCode.value.length < 6 ) {
      showError(zipCode, 'Enter a valid zip code numbers');
      isValid = false;
    }

    return isValid;
}

function validatorEditFollowUp() {
  // Clear previous errors
  clearErrors();

  let isValid = true;

  const date= document.getElementById('follow-up-date').value
           const nextFollowUpdate= document.getElementById('follow-up-next-date').value
           const remark= document.getElementById('follow-up-remark').value
           const status= document.getElementById('follow-up-status').value

  // Validate Follow-Up Date
  if (!date) {
      showError(document.getElementById('follow-up-date'), 'Follow-up date is required');
      isValid = false;
  }

  // Validate Next Follow-Up Date
  if (!nextFollowUpdate) {
      showError(document.getElementById('follow-up-next-date'), 'Next follow-up date is required');
      isValid = false;
  }

      if (nextFollowUpdate < date) {
          showError(document.getElementById('follow-up-next-date'), 'Next follow-up date cannot less than date');
          isValid = false;
      }
  

  // Validate Follow-Up Remark
  if (!remark) {
      showError(document.getElementById('follow-up-remark'), 'Remark is required');
      isValid = false;
  }

  // Validate Follow-Up Status
  if (!status) {
      showError(document.getElementById('follow-up-status'), 'Please select a follow-up status');
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

// window.addFollowUpDetailsTable = function addFollowUpDetailsTable(){
//     let addFollowUpDetails= document.getElementById('addFollowUpDetails').childNodes[3]
//     let is = document.getElementById('addFollowUpDetails').children[1].children
//     let newRow = document.createElement('tr');
//     let i = Number(is[is.length-1].cells[0].innerText) + 1;
//     newRow.innerHTML = `<td>${i}</td>
//                         <td>
//                           <input
//                             class="form-control followupDate"
//                             type="date"
                            
//                           />
//                         </td>
//                         <td>
//                           <textarea name="" class="followupRemark"></textarea>
//                         </td>
                        
//                         <td>
//                           <input
//                             class="form-control followupNextDate"
                            
//                             type="date"
//                           />
//                         </td>
//                         <td>
//                           <!-- <input class="form-control description" type="text"> -->
//                           <select class="form-control followupStatus">
//                             <option value="" disabled selected>Select Status</option>
//                             <option value="In-Progress">In-Progress</option>
//                             <option value="Active">Active</option>
//                             <option value="Accepted">Accepted</option>
//                             <option value="Interested">Interested</option>
        
//                             <option value=" Not Interested">Not Interested</option>
//                             <option value="Rejected">Rejected</option>
//                             <option value="Pending">Pending</option>
        
//                             <option value="Closed">Closed</option>
//                           </select>
//                         </td>

//                         <td class="text-center lm"><a href="javascript:void(0)" class="text-danger font-18 addProduct" 
//             onclick="removeFollowUpDetailsTable('${i}')" title="Remove">
//             <i class="fa-regular fa-trash-can"></i></a>
//             </td>`
//             newRow.classList.add('followUpDetailsRow')
//             addFollowUpDetails.appendChild(newRow);
//             newRow.setAttribute('id',`followUpDetailsRowNo${i}`)
// }
// window.removeFollowUpDetailsTable = function removeFollowUpDetailsTable(index){
//     let removeRow = document.getElementById(`followUpDetailsRowNo${index}`);
//     removeRow.remove();
//     let changingCellIndex = document.getElementById('addFollowUpDetails').children[1].children
//     for(let i=0; i<changingCellIndex.length; i++){
//         changingCellIndex[i].cells[0].innerText = i+1;
//     }
// }
