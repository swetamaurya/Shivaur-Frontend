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

import {user_API , resignation_API} from './apis.js'
import {formatDate} from './globalFunctions2.js'
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';

const token = localStorage.getItem('token');
const id = localStorage.getItem('User_id')
let empName;
let empEmail;
async function showDataInProfile(){
    const response = await fetch(`${user_API}/get/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    const res = await response.json();
    console.log('The employee data is ---->>> ',res);
try {
    empName = res.name
    empEmail = res.email
    document.getElementById("view-name").innerText = res?.name || '-';
    document.getElementById("view-joining-date").innerText = formatDate(res?.joiningDate) || '-';
    document.getElementById("view-mobile").innerText = res?.mobile || '-';
    document.getElementById("view-email-id").innerText = res?.email || '-';
    document.getElementById("view-dob").innerText = formatDate(res?.DOB) || '-';
    // document.getElementById("view-gender").innerText = res?.gender || '-';
                    
    document.getElementById("view-user-id").innerText = res?.userId || '-';
    document.getElementById("view-status").innerText = res?.status || '-';
    document.getElementById("view-roles").innerText = res?.roles || '-';
    document.getElementById("view-department").innerText = res?.departments?.departments || '-';
    document.getElementById("view-designation").innerText = res?.designations?.designations || '-';
    // document.getElementById("view-address").innerText = res?.address || '-';
} catch (error) {
    console.log(error)
}
    
    if(res.bankDetails){
        console.log(res.bankDetails)
        document.getElementById("view-holderName").innerText = res.bankDetails?.accountHolder || '-';
        document.getElementById("view-bankName").innerText = res.bankDetails?.bankName || '-';
        document.getElementById("view-branchName").innerText = res.bankDetails?.branchName || '-';
        document.getElementById("view-accountType").innerText = res.bankDetails?.accountType || '-';
        document.getElementById("view-accountNumber").innerText = res.bankDetails?.accountNumber || '-';
        document.getElementById("view-IFSCCode").innerText = res.bankDetails?.IFSCCode || '-';
        document.getElementById("view-panNumber").innerText = res.bankDetails?.PANNumber || '-';
    }
    else{
        console.log('bank details not found')
    }
    if(res.primaryContact){
        document.getElementById("view-primaryName").innerText = res.primaryContact?.name || '-';
                    document.getElementById("view-primaryRelationship").innerText = res.primaryContact?.relationship || '-';
                    document.getElementById("view-primaryPhone").innerText = res.primaryContact?.phone || '-';
                    document.getElementById("view-primaryAddress").innerText = res.primaryContact?.address || '-';
                try {
                    let secondaryContact = res.secondaryContact
                    document.getElementById("view-secondaryName").innerText = secondaryContact?.name || '-';
                    document.getElementById("view-secondaryRelationship").innerText = secondaryContact?.relationship || '-';
                    document.getElementById("view-secondaryPhone").innerText = secondaryContact?.phone || '-';
                    document.getElementById("view-secondaryAddress").innerText = secondaryContact?.address || '-';
                } catch (error) {
                    console.log(error)
                }
    }
}
window.onload = showDataInProfile

document.getElementById('emergency-contact-update-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    let _id=id;
    try{
        Array.from(document.querySelectorAll(".btn-close")).map(e=> e.click());
    } catch(error){console.log(error)}
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------
    let z1 = document.getElementById("edit-primaryName").value;
    let z2 = document.getElementById("edit-primaryRelationship").value;
    let z3 = document.getElementById("edit-primaryPhone").value;
    let z4 = document.getElementById("edit-primaryAddress").value;

    let z5 = document.getElementById("edit-secondaryName").value;
    let z6 = document.getElementById("edit-secondaryRelationship").value;
    let z7 = document.getElementById("edit-secondaryPhone").value;
    let z8 = document.getElementById("edit-secondaryAddress").value;

    let zz1 = {
        'name': z1,
        'relationship': z2,
        'phone': z3,
        'address': z4
    };
    let zz2 = {
        'name': z5,
        'relationship': z6,
        'phone': z7,
        'address': z8
    };


    try{
        let r = await fetch(`${user_API}/update`, {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                // '_id':_id_not_use_again,
                _id,
                'primaryContact': zz1,
                'secondaryContact': zz2,
            }),
        });

        let c1 = (r.ok);           
        status_popup( ((c1) ? "Emergency Contact Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
    } catch (error){
        console.log(error);
        status_popup("Please try <br> again later", false);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
});

let employeeName = document.getElementById('add_employee_name')  
let addEmail = document.getElementById('add_email');
// const addResignation = document.getElementById('#add_resignation');
window.showData = function showData(){
    console.log('The name of the employee is ',empName)
    employeeName.value = empName
    addEmail.value = empEmail
}
// var resp;
// Resign 
document.getElementById('add-resignation-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission
    const submitButton = event.target.querySelector("button[type='submit']");
    submitButton.disabled = true; // Disable the submit button to prevent multiple submissions

    try {
        // Close modal (if any) and show loading shimmer
        document.querySelectorAll(".btn-close").forEach(e => e.click());
        loading_shimmer();

        // Gather input values
        // const employeeId = document.getElementById('add_employee_id').value.trim();
        const  email = addEmail.value;
        const noticeDate = document.getElementById('add_noticeDate').value;
        const resignationDate = document.getElementById('add_resignationDate').value;
        const reason = document.getElementById('add_reason').value.trim();
        const name = employeeName.value


        // Validate required fields
        if ( !email || !noticeDate || !resignationDate || !reason) {
            throw new Error("Please fill in all the required fields.");
        }

        // Make API call to submit the resignation
        const response = await fetch(`${resignation_API}/post`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({  name , email, noticeDate, resignationDate, reason }),
        });
        const resp = await response.json()
        var resignationId;
        console.log('Resignation Response::: -->> ',resp);

        // Handle success or failure
        const success = response.ok;
        status_popup(success ? "Resignation Created <br> Successfully!" : "Please try again later", success);
    } catch (error) {
        // Log and display error to the user
        console.error('Error adding resignation:', error);
        status_popup(error.message || "Please try <br> again later", false);
    } finally {
        // Re-enable submit button and remove shimmer
        submitButton.disabled = false;
        remove_loading_shimmer();
    }
});

// const viewResignationForm = document.getElementById('view-resignation-form');
window.fetchResignationData = async function fetchResignationData(){
    // console.log('Resignation Id: ',resp.resignation._id)
    const response = await fetch(`${resignation_API}/getAll`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    const res = await response.json();
    console.log(res.data);
    // document.getElementById('view-employee-name').value = res.employee.name
    // document.getElementById('view-email').value = res.email
    // document.getElementById('view-noticeDate').value = res.noticeDate
    // document.getElementById('view-resignationDate').value = res.resignationDate
    // document.getElementById('view-reason').value = res.reason
}
