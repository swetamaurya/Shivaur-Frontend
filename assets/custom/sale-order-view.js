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
  // -------------------------------------------------------------------------------
  import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
  import { saleOrder_API, product_API, project_API, user_API } from './apis.js';
import { formatDate } from './globalFunctions2.js';
  
  // -------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------
  const token = localStorage.getItem('token');
  // =================================================================================
  let id_param = new URLSearchParams(window.location.search).get("id");
  // =================================================================================
  // =================================================================================
  async function editDateLoad() {
    try{
      loading_shimmer();
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------
    try{
        const response = await fetch(`${saleOrder_API}/get?_id=${id_param}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });
        if(!response.ok){
            throw new Error();
        }
        let r1 = (await response.json())?.sale;

      
        try{
            const ttt1 = document.getElementById("saleOrderDescription");
            ttt1.innerText = r1?.description;
        } catch(error){
            console.log(error);
        }
      
        try{
            const tableData = document.getElementById("tbodyone");
            tableData.innerHTML = `
                <tr><td>Order's Category :</td><td class="text-end">${r1?.orderCategory}</td></tr>
                <tr><td>${r1?.orderCategory} :</td><td class="text-end">${r1?.client?.name || r1?.project.projectName} (${r1?.client?.userId || r1?.project.projectId})</td></tr>
                <tr><td>Status :</td><td class="text-end">${r1?.status}</td></tr>
                <tr><td>Sale To :</td><td class="text-end">${r1?.saleTo?.name} (${r1?.saleTo?.userId})</td></tr>
                <tr><td>Customer Order Ref :</td><td class="text-end">${r1?.customerOrderRef}</td></tr>
                <tr><td>Order Date :</td><td class="text-end">${formatDate(r1?.orderDate)}</td></tr>
                <tr><td>Complication Date :</td><td class="text-end">${formatDate(r1?.complitionDate)}</td></tr>
                <tr><td>Order Ref :</td><td class="text-end">${r1?.orderRef}</td></tr>
                <tr><td>Material :</td><td class="text-end">${r1?.material?.material} (${r1?.material?.productId})</td></tr>
                <tr><td>Quantity :</td><td class="text-end">${r1?.quantity}</td></tr>
                <tr><td>Unit :</td><td class="text-end">${r1?.unit}</td></tr>
                <tr><td>Delievery Date To Customer :</td><td class="text-end">${r1?.deliveryDateToCustomer}</td></tr>
            `;
        } catch(error){
            console.log(error);
        }
        try{
            const tableData = document.getElementById("tbodytwo");
            tableData.innerHTML = `
                <tr><td>Total Amount :</td><td class="text-end">₹${r1?.price}</td></tr>
                <tr><td>Total Deduction Amount :</td><td class="text-end">₹${r1?.totalDeductionAmount}</td></tr>
                <tr><td>Net Payable Amount :</td><td class="text-end">₹${r1?.netAmount}</td></tr>
                <tr><td>Total Received Amount :</td><td class="text-end">₹${r1?.totalReceivedAmount}</td></tr>
                <tr><td>Dues Amount :</td><td class="text-end">₹${r1?.dues}</td></tr>
            `;
        } catch(error){
            console.log(error);
        }
        try{
          const loop = r1?.paymentDetails;
    
          const z1 = document.getElementById("recieptDetailsId");
    
          loop.forEach((e,i)=>{
            const zz2 = document.createElement("div");
            zz2.classList.add("col-xl-6");
            zz2.innerHTML = `
                <div class="card">
                  <div class="card-body rounded-top  ps-0 pe-0 pb-0 pt-3" style="background-color: #373737">
                    <h6 class="card-title text-white mb-3 ps-2" >Recipt ${i+1}</h6>
                    <table class="table table-striped table-border mb-0 ">
                      <tbody id="" class="">
                        <tr><td>Payment Date :</td><td class="text-end">${formatDate(e?.paymentDate)}</td></tr>
                        <tr><td>Term :</td><td class="text-end">${e?.terms || 0}</td></tr>
                        <tr><td>Details of Amount :</td><td class="text-end">${e?.amountDetails || 0}</td></tr>
                        <tr><td>Status :</td><td class="text-end">${e?.status || 0}</td></tr>
                        <tr><td>Transaction Type :</td><td class="text-end">${e?.transactionType || 0}</td></tr>
                        <tr><td>Amount :</td><td class="text-end">₹${e?.amount || 0}</td></tr>
                        <tr><td>Payment Date :</td><td class="text-end">${formatDate(e?.paymentDate)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
            `;
            z1.appendChild(zz2);
          });
        } catch(error){
          console.log(error)
        }
    
  
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------
    try{
      remove_loading_shimmer();
    } catch(error){console.log(error)}
  }
  editDateLoad();
  //==========================================================================================
  