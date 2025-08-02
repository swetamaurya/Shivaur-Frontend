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





import { enquiry_API } from "./apis.js";
const token = localStorage.getItem("token");

import {  formatDate } from './globalFunctions2.js';


let enquiryId = new URLSearchParams(window.location.search).get('_id')

let editEnquiryBtn = document.getElementById('edit_enquiry_btn');
editEnquiryBtn.addEventListener('click',()=>{
    window.location.href = `edit-enquiry.html?_id=${enquiryId}`
})

window.editLoadData = async function editLoadData() {
  let offer_details = document.getElementById("offer_details");
  const enquiryDescription = document.getElementById("enquiryDescription");
  const enquiryDetailsTable = document.getElementById("enquiryDetailsTable");

  if (!enquiryId) return;

  try {
    const response = await fetch(`${enquiry_API}/get?_id=${enquiryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch enquiry details");
    }

    const res = await response.json();
    const enquiry = res.enquiry;

    console.log("THIS IS MY RESPONSE: ", enquiry);

    // Update enquiry description
    enquiryDescription.innerText = enquiry.detailOfEnquiry || "-";
    offer_details.innerHTML = enquiry.offers
    .map((enquiry, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${enquiry.offerTitle || "-"}</td>
        <td>${enquiry.offerDate || "-"}</td>
        <td>
          <a href="offer-view.html?id=${enquiry._id}" target="_blank" class="btn btn-primary">
          <i class="fa-regular fa-eye"></i></a>
        </td>
      </tr>
    `)
    .join("");
    // Populate enquiry details table
    enquiryDetailsTable.innerHTML = `
      <tr>
        <td>Enquiry Generated Date:</td>
        <td class="text-end">${formatDate(enquiry.enquiryDate) || "-"}</td>
      </tr>
      <tr>
        <td>Department:</td>
        <td class="text-end">${enquiry?.lead?.department || enquiry.department || "-"}</td>

      </tr>
        <tr>
        <td>Designation:</td>
        <td class="text-end">${enquiry?.lead?.designation || enquiry.designation || "-"}</td>
      </tr>
      <tr>
        <td>Company:</td>
        <td class="text-end">${enquiry?.lead?.company || enquiry.company.companyName || "-"}</td>
      </tr>
      <tr>
        <td>PIC:</td>
        <td class="text-end">${enquiry?.lead?.leadName || enquiry.PIC || "-"}</td>
      </tr>
      <tr>
        <td>Created By:</td>
        <td class="text-end">${enquiry?.lead?.createdBy || enquiry?.createdBy.name || "-"}</td>
      </tr>
      <tr>
        <td>Follow-Up Date:</td>
        <td class="text-end">
          ${formatDate
            (enquiry?.lead?.callInfo?.length > 0
              ? enquiry.lead.callInfo[enquiry.lead.callInfo.length - 1]?.nextFollowUpdate || "-"
              : "-")
          }
        </td>
      </tr>
      <tr>
        <td>Phone:</td>
        <td class="text-end">${enquiry?.lead?.mobile || enquiry.phone || "-"}</td>
      </tr>
      <tr>
        <td>Email:</td>
        <td class="text-end">${enquiry?.lead?.email ||enquiry.email || "-"}</td>
      </tr>
    `;
  } catch (error) {
    console.error("Error loading enquiry details:", error);
    enquiryDetailsTable.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-danger">Failed to load enquiry details. Please try again.</td>
      </tr>
    `;
  }
};

// Enquiry Generated Date:
editLoadData();

document.getElementById('offer_page').addEventListener('click',()=>{
  window.location.href = `add-offer.html?id=${enquiryId}`
})

    // <tr>
    //   <td>Customer Name:</td>
    //   <td class='text-end'>${enquiry?.lead.leadName || enquiry.leadName || '-'}</td>
    // </tr>

 





