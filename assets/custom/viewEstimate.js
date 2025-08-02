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
import { loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
import { estimate_API, user_API, project_API } from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
// =========================================================================================
// =========================================================================================
// =========================================================================================
// =========================================================================================

// var resp;
async function load_data() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    
    let id = new URLSearchParams(window.location.search).get("id");
    const URL = `${estimate_API}/get/${id}`;
    const responseData = await fetch(URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    let resp = await responseData.json();

    console.log("bro :- ",resp)


    const tableData = document.getElementById('tableData')
    var x = '';
    resp?.details.map((e,i)=>{
        x += `<tr>
            <td>${i + 1}</td>
            <td>${e.item}</td>
            <td>${e.description}</td>
            <td>${e.unitCost}</td>
            <td>${e.qty}</td>
            <td>₹ ${e.amount}</td>
            </tr>`;
    });
    tableData.innerHTML = x;


    try{
        document.getElementById("estId").innerText = resp?.estimatesId;
        document.getElementById("createDate").innerText = formatDate(resp?.createdAt);
        document.getElementById("expiryDate").innerText = formatDate(resp?.expiryDate);
        document.getElementById("clientAddr").innerText = resp?.billingAddress;

        document.getElementById("subTotal").innerText = `₹ ${resp?.total}`;
        document.getElementById("taxType").innerText = resp?.taxType;
        document.getElementById("taxAmt").innerText = `${resp?.tax}%`;
        document.getElementById("discountAmt").innerText = `${resp?.discount}%`
        document.getElementById("grandTotal").innerText = `₹ ${resp?.GrandTotal}`;

        document.getElementById("otherInfo").innerText = resp?.otherInfo;

    } catch(error){
        console.log(error);
    }
    try{
        document.getElementById("clientName").innerText = resp?.client?.name;
        document.getElementById("clientph").innerText = resp?.client?.mobile;
        document.getElementById("clientMail").innerText = resp?.client?.email;
    } catch(error){
        console.log(error);
    }
    try{
        document.getElementById("proNm").innerHTML = `${resp?.project?.projectName} (${resp?.project?.projectId})`;   
    } catch(error){
        console.log(error);
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
}
load_data();

window.handleClickToDownloadPdf = function handleClickToDownloadPdf(){
    const generatePdfFile = document.getElementById('generatePdfFile');
    html2pdf(generatePdfFile);
}