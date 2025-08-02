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
import { invoice_API, user_API, project_API ,product_API} from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
// =========================================================================================
// =========================================================================================
// =========================================================================================
// =========================================================================================
async function clientsDetails(_id_param) {
    try {
        let r = await fetch(`${user_API}/get/${_id_param}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        let r2 = await r.json();

        document.getElementById("clientName").innerText = r2?.name;
        document.getElementById("clientph").innerText = r2?.mobile;
        document.getElementById("clientMail").innerText = r2?.email;
    } catch (error) {
        console.error('Error updating client:', error);
    }
}
async function projDetails(_id_param) {
    const response = await fetch(`${project_API}/get/${_id_param}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });

    let r2 = await response.json();

    document.getElementById("proNm").innerHTML = `${r2?.projectName} (${r2?.projectId})`;    
}

async function prodDetails(_id_param) {
    const response = await fetch(`${product_API}/get/${_id_param}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });

    let r2 = await response.json();

    document.getElementById("prodNm").innerHTML = `${r2?.material} (${r2?.productId})`;    
}
// =========================================================================================

// var resp;
async function load_data() {
    try {
        loading_shimmer();
    } catch (error) {
        console.log(error);
    }

    let id = new URLSearchParams(window.location.search).get("id");
    const URL = `${invoice_API}/get/${id}`;

    try {
        const responseData = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        let resp = await responseData.json();
        console.log("Invoice API Response:", resp); // Debugging API Response

        const tableData = document.getElementById('tableData');
        let x = '';

        if (resp?.details?.length > 0) {
            resp.details.forEach((e, i) => {
                x += `<tr>
                    <td>${i + 1}</td>
                    <td>${e.item || '-'}</td>
                    <td>${e.description || '-'}</td>
                    <td>${e.unitCost || '-'}</td>
                    <td>${e.qty || '-'}</td>
                    <td>₹ ${e.amount || '0.00'}</td>
                </tr>`;
            });
        } else {
            x = `<tr><td colspan="6" class="text-center">No items found</td></tr>`;
        }

        tableData.innerHTML = x;

        // ** Safely assign values, fallback to "-" if undefined **
        document.getElementById("estId").innerText = resp?.invoiceId || "N/A";
        document.getElementById("createDate").innerText = resp?.invoiceDate ? formatDate(resp.invoiceDate) : "-";
        document.getElementById("expiryDate").innerText = resp?.dueDate ? formatDate(resp.dueDate) : "-";
        document.getElementById("clientAddr").innerText = resp?.billingAddress || "-";

        document.getElementById("subTotal").innerText = `₹ ${resp?.total || '0.00'}`;
        document.getElementById("taxType").innerText = resp?.taxType || "N/A";
        document.getElementById("taxAmt").innerText = `${resp?.tax || '0'}%`;
        document.getElementById("discountAmt").innerText = `${resp?.discount || '0'}%`;
        document.getElementById("grandTotal").innerText = `₹ ${resp?.GrandTotal || '0.00'}`;
        document.getElementById("otherInfo").innerText = resp?.otherInfo || "No additional information";

        // ** Handle client details safely **
        document.getElementById("clientName").innerText = resp?.client?.name || "-";
        document.getElementById("clientph").innerText = resp?.client?.mobile || "-";
        document.getElementById("clientMail").innerText = resp?.client?.email || "-";

        // ✅ **Show Only One: Product OR Project**
        if (resp?.product) {
            document.getElementById("prodNm").innerHTML = `${resp?.product?.material || '-'} (${resp?.product?.productId || 'N/A'})`;
            document.getElementById("proNm").innerHTML = ""; // Hide project if product exists
        } else if (resp?.project) {
            document.getElementById("proNm").innerHTML = `${resp?.project?.projectName || '-'} (${resp?.project?.projectId || 'N/A'})`;
            document.getElementById("prodNm").innerHTML = ""; // Hide product if project exists
        } else {
            document.getElementById("proNm").innerHTML = "N/A";
            document.getElementById("prodNm").innerHTML = "N/A";
        }

    } catch (error) {
        console.error("Error fetching invoice data:", error);
        document.getElementById('tableData').innerHTML = `<tr><td colspan="6" class="text-center">Error loading invoice data</td></tr>`;
    }

    try {
        remove_loading_shimmer();
    } catch (error) {
        console.log(error);
    }
}

load_data();


 

window.handleClickToDownloadPdf = function handleClickToDownloadPdf(){
    const generatePdfFile = document.getElementById('generatePdfFile');
    html2pdf(generatePdfFile);
}