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
 import { vendor_API ,product_API} from './apis.js';
 import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate } from './globalFunctions2.js';

// -------------------------------------------------------------------------
 // -------------------------------------------------------------------------
//  import {rtnPaginationParameters } from './globalFunctionPagination.js';
// =================================================================================
const token = localStorage.getItem('token');
let id_param = new URLSearchParams(window.location.search).get("id");

// =================================================================================
// Function to handle search and update the same table

let _id;
let resp;

async function all_data_load_dashboard() {
    let projectDetails = document.getElementById('project-details');
    let bankDetailsContainer = document.getElementById("bank-info");
    let uploadContracterFiles = document.getElementById('upload-contracter-files')

    let x = '';
    _id = new URLSearchParams(window.location.search).get("id");

    try {
        const response = await fetch(`${vendor_API}/get?id=${_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        resp = await response.json()
        console.log('My Contrater Data is ',resp)
        resp.files?.map((e,i)=>{
            uploadContracterFiles.innerHTML+= `<tr id="contracterDeletionFile${i}">
              <td>${i+1}</td>
  
        <td><a href="${e}" target="_blank">File ${i+1}</a></td>
        <td class="text-center">
          <div class="dropdown dropdown-action">
                                          <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"  aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                          <div class="dropdown-menu dropdown-menu-right">
                                              <a href="${e}" class="dropdown-item" target="_blank"><i class="fa-regular fa-eye"></i> View</a>
                                              <a onclick="deleteContractorFile('${e}',${i})" href="#" class="dropdown-item"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                          </div>
                                          
                                          
                                      </div>
        </td>
      </tr>`
        })

        let vendorExpertise = document.getElementById('expertise')
    let span = document.createElement('span')
    
    let expertiseText = resp.vendorExpertise;
    if(resp.expertise.length > 0){
        expertiseText+= ','+ resp.expertise?.join(',')
    }

        // Populate vendor details
        document.getElementById('name').innerText = resp.vendorName || '-';
        document.getElementById('mobile').innerText = resp.mobile || '-';
        document.getElementById('email').innerText = resp.email || '-';
        document.getElementById('address').innerText = resp.address || '-';
        document.getElementById('gender').innerText = resp.gender || '-';
        document.getElementById('remark').innerText = resp.remark || '-';
        span.innerText = expertiseText;
        vendorExpertise.appendChild(span)


        // Populate Bank Details
        console.log("bro res :- ",resp);
        console.log("r.ba :- ",resp.bankDetails)
        if (resp.bankDetails) {
            document.getElementById("view-holderName").innerText = resp.bankDetails.accountHolder || "-";
            document.getElementById("view-bankName").innerText = resp.bankDetails.bankName || "-";
            document.getElementById("view-branchName").innerText = resp.bankDetails.branchName || "-";
            document.getElementById("view-accountType").innerText = resp.bankDetails.accountType || "-";
            document.getElementById("view-accountNumber").innerText = resp.bankDetails.accountNumber || "-";
            document.getElementById("view-IFSCCode").innerText = resp.bankDetails.IFSCCode || "-";
        } else {
            console.warn("No bank details found for the vendor.");
            // bankDetailsContainer.style.display = "none";
        }

        // Populate material Details
        if (resp.material?.length) {
            resp.material.forEach((material) => {
                x += `
                    <div id="${material._id}" class="col-lg-4 col-sm-6 col-md-4 col-xl-3">  
                        <div class="card">
                            <div class="card-body">
                                <div class="dropdown profile-action">
                                    <a aria-expanded="false" data-bs-toggle="dropdown" class="action-icon dropdown-toggle" href="#"><i class="material-icons">more_vert</i></a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <a onclick="getIdByAddBlockDistrict('${material._id}')" data-bs-target="#Add_block" data-bs-toggle="modal" href="#" class="dropdown-item">
                                            <i class="fa-solid fa-plus m-r-5"></i> Add District
                                        </a>
                                        <a onclick="getIdByEditBlockDistrict('${material._id}')" data-bs-target="#Edit_block" data-bs-toggle="modal" href="#" class="dropdown-item">
                                            <i class="fa-solid fa-pencil m-r-5"></i> Edit District
                                        </a>
                                        <a data-bs-target="#delete_block" data-bs-toggle="modal" href="#" class="dropdown-item">
                                            <i class="fa-regular fa-trash-can m-r-5"></i> Delete Project
                                        </a>
                                    </div>
                                </div> 
                                <h4 class="project-title"><a href="project-view.html">${material.material}</a></h4>
                                <small class="block text-ellipsis m-b-15">
                                    ${material.block && material.district ?
                                        `<div><span>${material.block}</span> <span>${material.district}</span></div>` :
                                        `<div style="display: none;"></div>`
                                    }
                                 </small>
                                <p class="text-muted">${material.description || 'No description available'}</p>
                                <div class="pro-deadline m-b-15">
                                    <div class="sub-title">Purchase Date:</div>
                                    <div class="text-muted">${formatDate(material.purchaseDate || '-')}</div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
        }
        projectDetails.innerHTML = x;
    } catch (error) {
        console.error("Error fetching vendor details:", error);
    }
};

// Fetch and Populate Bank Details for Editing
window.editBankInfo = function () {
    const holderName = document.getElementById("view-holderName").innerText;
    const bankName = document.getElementById("view-bankName").innerText;
    const branchName = document.getElementById("view-branchName").innerText;
    const accountType = document.getElementById("view-accountType").innerText;
    const accountNumber = document.getElementById("view-accountNumber").innerText;
    const ifscCode = document.getElementById("view-IFSCCode").innerText;

    document.getElementById("holderName").value = holderName || '-';
    document.getElementById("bankName").value = bankName || '-';
    document.getElementById("branchName").value = branchName || '-';
    document.getElementById("accountType").value = accountType || '-';
    document.getElementById("accountNumber").value = accountNumber || '-';
    document.getElementById("IFSCCode").value = ifscCode || '-';
};

// Submit Edited Bank Details
document.getElementById("editBankDetailsForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const bankDetails = {
        bankName: document.getElementById("bankName").value.trim(),
        accountNumber: document.getElementById("accountNumber").value.trim(),
        IFSCCode: document.getElementById("IFSCCode").value.trim(),
        accountType: document.getElementById("accountType").value.trim(),
        accountHolder: document.getElementById("holderName").value.trim(),
        branchName: document.getElementById("branchName").value.trim(),
    };

    try {
        const response = await fetch(`${vendor_API}/update-bank-details`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ _id, bankDetails }),
        });

        const result = await response.json();
        if (response.ok) {
            status_popup(result ? "Bank Details Updated <br> Successfully!" : "Please try again later", result);

            console.log("Bank details updated successfully:", result);

            // Update the UI
            document.getElementById("view-holderName").innerText = bankDetails.accountHolder || "-";
            document.getElementById("view-bankName").innerText = bankDetails.bankName || "-";
            document.getElementById("view-branchName").innerText = bankDetails.branchName || "-";
            document.getElementById("view-accountType").innerText = bankDetails.accountType || "-";
            document.getElementById("view-accountNumber").innerText = bankDetails.accountNumber || "-";
            document.getElementById("view-IFSCCode").innerText = bankDetails.IFSCCode || "-";

            // Close Modal
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById("editBankInfoModal"));
            modalInstance.hide();
        } else {
            console.error("Failed to update bank details:", result.message);
        }
    } catch (error) {
        console.error("Error updating bank details:", error.message);
    }
})
all_data_load_dashboard();

  
// Edit Vendor Profile API 
let editVendorProfileForm = document.getElementById('edit-vendor-profile-form');
editVendorProfileForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    let vendorName = document.getElementById('vendor-name').value
    let mobile = document.getElementById('vendor-mobile').value
    let email = document.getElementById('vendor-email').value
    let gender = document.getElementById('vendor-gender').value
    let address = document.getElementById('vendor-address').value
    let id = _id;
    try {
        const response = await fetch(`${vendor_API}/update`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body:JSON.stringify({vendorName,mobile,email,gender,address,id})
        })
        const res = await response.json();
        const success = response.ok;
        status_popup(success ? "Vendor Profile Updated <br> Successfully!" : "Please try again later", success);
        if (success){
            all_data_load_dashboard();
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        status_popup("Please try <br> again later", false);
    }
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})

// Getting the Id 
let addBlockDistrictId;
window.getIdByAddBlockDistrict = function getIdByAddBlockDistrict(id){
    let addForm = document.getElementById('add-block-district-form');
    addForm.reset();
    addBlockDistrictId = id;
}

// Add Block District API 
let addBlockDistrictForm = document.getElementById('add-block-district-form');
addBlockDistrictForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    let form = event.target;
    let block = form.querySelector('#addBlock').value; 
    let district = form.querySelector('#addDistrict').value;
    let _id = addBlockDistrictId;
    // let addId = document.getElementById('add-block-district-id')
    // addId.setAttribute('id',`${addBlockDistrictId}`)
    try {
        const response = await fetch(`${product_API}/update`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body:JSON.stringify({block,district,_id})
        })
        const res = await response.json();
        const success = response.ok;
        status_popup(success ? "Block & District Created <br> Successfully!" : "Please try again later", success);
        if (success){
            all_data_load_dashboard();
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        status_popup("Please try <br> again later", false);
    }
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})

// Putting the values in the edit form 
let editBlockDistrictId;
window.getIdByEditBlockDistrict = async function getIdByEditBlockDistrict(id){
    editBlockDistrictId = id;
    const response = await fetch(`${product_API}/get/${id}`,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        },
    })
    const res = await response.json()
    document.getElementById('editBlock').value = res.block ; 
    document.getElementById('editDistrict').value = res.district; 

} 

// Edit Block District API 
let editBlockDistrictForm = document.getElementById('edit-block-district-form');
editBlockDistrictForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    let form = event.target;
    let block = form.querySelector('#editBlock').value; 
    let district = form.querySelector('#editDistrict').value; 
    let _id = editBlockDistrictId;
    try {
        const response = await fetch(`${product_API}/update`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body:JSON.stringify({block,district,_id})
        })
        const res = await response.json()
        const success = response.ok;
        status_popup(success ? "Block & District Updated <br> Successfully!" : "Please try again later", success);
        if (success){
            all_data_load_dashboard();
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        status_popup("Please try <br> again later", false);
    }
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
})


 
window.deleteContractorFile = async function deleteContractorFile(fileName, index) {
    // Get the element for the file and the ID parameter
    let deleteFile = document.getElementById(`contracterDeletionFile${index}`);
    const _id = new URLSearchParams(window.location.search).get("id");

    // Check if _id is valid
    if (!_id || _id === "null") {
        console.error("Invalid or missing vendor ID.");
        status_popup("Error: Invalid vendor ID.", false);
        return;
    }

    console.log("vendor ID:", _id); // Debugging log

    // Show loading shimmer
    try {
        loading_shimmer();
    } catch (error) {
        console.log("Error while showing loading shimmer:", error);
    }

    // API call to delete the file
    const apiUrl = `${vendor_API}/deleteFile`;
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                _id,
                fileName,
            }),
        });

        const res = await response.json();

        // Handle API response
        if (response.ok) {
            deleteFile.remove(); // Remove the file from the DOM
            try {
                // Show success message
                status_popup("File Deleted <br> Successfully!", true);

                // Redirect after a delay
                const delay = Number(document.getElementById("b1b1").innerText) * 1000 || 6000; // Default to 3 seconds
                setTimeout(() => {
                    location.reload();
                }, delay);
            } catch (error) {
                console.log("Error while showing status popup:", error);
                status_popup("Please try <br> again later", false);
            }
        } else {
            console.error("API Error Response:", res);
            status_popup("Please try <br> again later", false);
        }
    } catch (error) {
        console.error("Error during API call:", error);
        status_popup("Please try <br> again later", false);
    } finally {
        // Always remove loading shimmer
        try {
            remove_loading_shimmer();
        } catch (error) {
            console.log("Error while removing loading shimmer:", error);
        }
    }
};