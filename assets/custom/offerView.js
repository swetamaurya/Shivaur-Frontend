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
  
  import {
    status_popup,
    loading_shimmer,
    remove_loading_shimmer,
  } from "./globalFunctions1.js";

import {offer_API} from './apis.js';
const token = localStorage.getItem("token");

// let offerId = new URLSearchParams(window.location.search).get('id')
// const token = localStorage.getItem("token")
// window.editLoadData = async function editLoadData() {
//     const offerReferenceNumber = document.getElementById("referenceNo");
//     const PIC = document.getElementById("customerDetails");
//     // const email = document.getElementById("customerEmail");
//     // const phone = document.getElementById("customerPhone");
//     // const department = document.getElementById("customerDepartment");
//     const policy = document.getElementById("policy");
//     const enquiryDetails = document.getElementById("enquiryDetails");
//     const otherInfo = document.getElementById("otherInfo");
//     const offerDate = document.getElementById("createDate");
//     const price = document.getElementById("price");
//     // const additionalInfo = document.getElementById("description");

//     try {
//         const response = await fetch(`${offer_API}/get?id=${offerId}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//         });

//         const res = await response.json();
//         console.log('API Response: ', res);

//         const offer = res.offer || '';
//         // console.log('this is my offer response: ',offer);
//         offerReferenceNumber.innerText = offer.offerReferenceNumber || '';
//         PIC.innerText = offer.PIC || '';
//         price.innerText = offer.price || '';
//         offerDate.innerText = offer.offerDate || '';
//         enquiryDetails.innerText = offer.enquiry.detailOfEnquiry || '';
//         otherInfo.innerText = offer.additionalInfo || '';
//         policy.innerText = offer.policy || '';
// }catch(error){
//     console.log('the error is ',error);
// }
// }
// editLoadData();

// window.handleClickToDownloadPdf = function handleClickToDownloadPdf(){
//     const generatePdfFile = document.getElementById('generatePdfFile')
//     html2pdf(generatePdfFile,{
        
//         margin: [0, 0, 0, 0], 
//         filename:     'offer.pdf',
//         image:        { type: 'jpeg', quality: 1 },  
//         html2canvas:  { 
//             scale: 2, 
//             scrollY: 0,
//             useCORS: true, 
//             logging: false  
//         },
//         jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        
//     })
// }

 
let offerId = new URLSearchParams(window.location.search).get("id");

let isSendingEmail = false; // Flag to prevent duplicate calls

document.addEventListener("DOMContentLoaded", () => {
     // Show modal when "Send Offer With Email" button is clicked
  const submitOfferButton = document.getElementById("submitOffer");
  if (submitOfferButton) {
    submitOfferButton.addEventListener("click", () => {
      const emailModal = new bootstrap.Modal(
        document.getElementById("emailModal")
      );
      emailModal.show();
    });
  }
    const ccField = document.getElementById("ccEmail");
  
    if (ccField) {
      ccField.addEventListener("input", () => {
        const value = ccField.value;
        // Automatically add a comma when the user types a space
        ccField.value = value.replace(/\s+/g, ', ').replace(/,+/g, ', ');
      });
    }
  
    const sendEmailButton = document.getElementById("sendEmailModal");
    if (sendEmailButton) {
      sendEmailButton.addEventListener("click", async (event) => {
        event.preventDefault();
  
        if (isSendingEmail) {
          console.warn("Email is already being sent.");
          return;
        }
  
        isSendingEmail = true;
  
        const emailForm = document.getElementById("emailForm");
        const ccEmails = ccField.value.split(',').map(email => email.trim()).filter(Boolean);
  
        const emailData = new FormData(emailForm);
        emailData.set("cc", ccEmails.join(',')); // Combine CC emails back as a single string
  
        const emailModal = bootstrap.Modal.getInstance(
          document.getElementById("emailModal")
        );
        emailModal.hide();
  
        loading_shimmer();
  
        try {
          const generatePdfFile = document.getElementById("generatePdfFile");
          if (!generatePdfFile || generatePdfFile.innerHTML.trim() === "") {
            console.error("PDF generation element not found or empty!");
            isSendingEmail = false;
            return;
          }
  
          console.log("Starting PDF generation...");
  
          const pdfBlob = await html2pdf()
            .set({
              margin: [0.5, 0.5, 0.5, 0.5],
              filename: "Offer.pdf",
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: {
                scale: 2,
                scrollY: 0,
                useCORS: true,
                logging: true,
              },
              jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            })
            .from(generatePdfFile)
            .outputPdf("blob");
  
          await sendEmailWithAttachment(emailData, pdfBlob);
        } catch (err) {
          console.error("Error generating PDF:", err);
          status_popup("Error generating Offer. Please try again.", false);
        } finally {
          remove_loading_shimmer();
          isSendingEmail = false;
        }
      });
    }
  });
  
  async function sendEmailWithAttachment(emailData, pdfBlob) {
    const formData = new FormData();
    formData.append("to", emailData.get("to"));
    formData.append("cc", emailData.get("cc"));
    formData.append("subject", emailData.get("subject"));
    formData.append("message", emailData.get("message"));
    formData.append("Offer", pdfBlob, `Offer_${Date.now()}.pdf`);
  
    loading_shimmer();
  
    try {
      const response = await fetch(`${offer_API}/send-email`, {
        method: "POST",
        body: formData,
      });
  
      console.log("API Response:", response);
  
      if (response.ok) {
        status_popup("Offer Sent <br> Successfully!", true);
        setTimeout(() => {
          window.location.href = "offer-list.html";
        }, 2000);
      } else {
        console.error("Failed response:", await response.text());
        status_popup("Failed to send Offer. Please try again.", false);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      status_popup(
        "An error occurred while sending the email. Please try again.",
        false
      );
    } finally {
      remove_loading_shimmer();
    }
  }
  
  


// Load offer data into HTML elements
async function editLoadData() {
  const offerReferenceNumber = document.getElementById("referenceNo");
  const PIC = document.getElementById("customerDetails");
  const policy = document.getElementById("policy");
  const enquiryDetails = document.getElementById("enquiryDetails");
  const otherInfo = document.getElementById("otherInfo");
  const offerDate = document.getElementById("createDate");
  const price = document.getElementById("price");
  const addRemark = document.querySelector('#add-remark');

  // Show shimmer

   loading_shimmer();

  try {
    const response = await fetch(`${offer_API}/get?id=${offerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await response.json();
    console.log("API Response: ", res);

    const offer = res.offer || "";
    offerReferenceNumber.innerText = offer.offerReferenceNumber || "";
    PIC.innerText = offer.PIC || "";
    price.innerText = offer.price || "";
    offerDate.innerText = offer.offerDate || "";
    enquiryDetails.innerText = offer.enquiry?.detailOfEnquiry || "";
    otherInfo.innerText = offer.additionalInfo || "";
    policy.innerText = offer.policy || "";
    
      let p = document.createElement('p');
      let span = document.createElement('span');
      if(offer.offerConvertStatus === 'Lost'){
        span.innerText = offer.lostOrderReason;
        addRemark.setAttribute('class','alert alert-danger')
        addRemark.setAttribute('role','alert')
        addRemark.appendChild(span);
      if(offer.lostOrderReason === 'Custom Reasons'){
        span.innerText = ''
        p.innerText = offer.remark;
        addRemark.appendChild(p);
        // addRemark.setAttribute('class','alert-danger')
      }
    }

  } catch (error) {
    console.error("Error loading offer data: ", error);
  } finally {
    // Ensure shimmer is removed even on error
    // if (typeof remove_loading_shimmer === "function")
      remove_loading_shimmer();
  }
}
 editLoadData();
// Function to download the offer as a PDF
window.handleClickToDownloadPdf = function handleClickToDownloadPdf() {
  const generatePdfFile = document.getElementById("generatePdfFile");
  html2pdf()
    .set({
      margin: [0, 0, 0, 0],
      filename: "offer.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        scrollY: 0,
        useCORS: true,
        logging: false,
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    })
    .from(generatePdfFile)
    .save();
};
