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

import { lead_API } from "./apis.js";
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
const token = localStorage.getItem("token");

// getting the Lead id
let leadId = new URLSearchParams(window.location.search).get("id");

async function viewLoadData() {
  let offerTable = document.getElementById("offerTable"); 
  let enquiryTable = document.getElementById("enquiryTable");
  let invoiceTable = document.getElementById("invoiceTable");
  let leadDetailsTable = document.getElementById("leadDetailsTable");
  let call_details_tbody = document.getElementById('call_details_tbody')
  let leadGeneratedName = document.getElementById('leadGeneratedName');

  try {
  const response = await fetch(`${lead_API}/get?id=${leadId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  console.log("API Response:", res);

  const lead = res.lead;
  if (!lead) {
    console.error("No lead data available.");
    return;
  }

  document.getElementById("taskName").innerText = `${lead.leadName || "-"}`;
  document.getElementById("viewDescription").innerText = lead.description || "-";

  leadDetailsTable.innerHTML = `
      <tr>
        <td>Lead Name:</td>
        <td class='text-end'>${lead.leadName || "-"}</td>
      </tr>
      <tr>
        <td>Department:</td>
        <td class='text-end'>${lead.department || "-"}</td>
      </tr>
      <tr>
        <td>Designation:</td>
        <td class='text-end'>${lead.designation || "-"}</td>
      </tr>
      <tr>
        <td>Company:</td>
        <td class='text-end'>${lead.company || "-"}</td>
      </tr>
      <tr>
        <td>Address:</td>
        <td class='text-end'>${lead.address || "-"}</td>
      </tr>
      <tr>
        <td>Mobile:</td>
        <td class='text-end'>${lead.mobile?.join(", ") || "-"}</td>
      </tr>
      <tr>
        <td>Email:</td>
        <td class='text-end'>${lead.email?.join(", ") || "-"}</td>
      </tr>
      <tr>
        <td>Lead Created By:</td>
        <td class='text-end'>${lead.createdBy || "-"}</td>
      </tr>
    `;

    enquiryTable.innerHTML = lead.enquiry
    .map((enquiry, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${enquiry.enquiryTitle || "-"}</td>
        <td>${enquiry.enquiryDate || "-"}</td>
      </tr>
    `)
    .join("");

  call_details_tbody.innerHTML = lead.callInfo
    .map((call, index) => `
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <p style="font-size: 13px; color: #00000082; margin-bottom: 0;">
                <span style="color: #fe8145;">Last call date:</span> ${call.date || "-"}
              </p>
              <p style="font-size: 13px; color: #000000d9; margin-bottom: 0;">
                <span style="color: #fe8145;">Follow up date:</span> ${call.nextFollowUpdate || "-"}
              </p>
            </div>
            <hr>
            <div>
              <p class="text-muted-foreground my-4" style="font-size: 14px;">${call.remark || "-"}</p>
            </div>
            <hr>
            <div id="badgeId${index}" class="d-flex align-items-center justify-content-between">
              <span style="font-size: 13px; color: #fe8145;">Call Updated By: <span style="color: black;">${call.createdByFollowUp || "-"}</span></span>
              <span class="badge" style="background-color: gray; color: white;">${call.status || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    `)
    .join("");

  lead.callInfo.forEach((call, index) => { 
    const badge = document.getElementById(`badgeId${index}`).querySelector(".badge");
    switch (call.status) {
      case "Accepted":
        badge.style.backgroundColor = "blue";
        badge.style.color = "white";
        break;
      case "In-Progress":
        badge.style.backgroundColor = "orange";
        badge.style.color = "white";
        break;
      case "Active":
        badge.style.backgroundColor = "green";
        badge.style.color = "white";
        break;
      case "Interested":
        badge.style.backgroundColor = "cyan";
        badge.style.color = "white";
        break;
      case "Not Interested":
      case "Rejected":
        badge.style.backgroundColor = "red";
        badge.style.color = "white";
        break;
      case "Pending":
        badge.style.backgroundColor = "yellow";
        badge.style.color = "black";
        break;
      case "Closed":
        badge.style.backgroundColor = "gray";
        badge.style.color = "white";
        break;
      default:
        badge.style.backgroundColor = "gray";
        badge.style.color = "white";
    }
  });
} catch (error) {
  console.error("Error loading lead data:", error);
}
}

viewLoadData();


// sending the Id to the Edit Lead Page 
document.getElementById('edit_lead_btn').addEventListener('click',()=>{
  window.location.href = `edit-leads.html?id=${leadId}`
})

//=======================================================================================
//Enquiry Yes No Updation
async function generateEnquiryDetails(event){
  const enquiryStatus = event.target.id === 'yes_button' ? 'Yes' : 'No'
  const id = leadId
  try{
    loading_shimmer();
} catch(error){console.log(error)}
  try {
    const response = await fetch(`${lead_API}/update`,{
              method:'POST',
              headers:{
                  'Content-Type':'application/json',
                  'Authorization':`Bearer ${token}`
              },
              body:JSON.stringify({enquiryStatus,id})
            })
            const res = await response.json();
            console.log(res);
            const c1 = (response.ok);
                    try{
                        status_popup( ((c1) ? `Enquiry  has been updated to <br> ${enquiryStatus} !`: "Please try <br> again later"), (c1) );
                        setTimeout(function(){
                          if(enquiryStatus === 'Yes'){
                            window.location.href = 'add-enquiry.html';
                          }
                          else{
                            window.location.href = 'lead-list.html';
                          }
                        },(Number(document.getElementById("b1b1").innerText)*1000));
                    } catch (error){
                        status_popup( ("Please try <br> again later"), (false) );
                    }
  } catch (error) {
    console.log(error)
  }
  //------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
} catch(error){console.log(error)}
}
document.getElementById('yes_button').addEventListener('click',generateEnquiryDetails)
document.getElementById('no_button').addEventListener('click',generateEnquiryDetails)







