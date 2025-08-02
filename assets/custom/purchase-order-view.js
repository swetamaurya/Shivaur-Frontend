// Redirect if no token is found
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
  // Imports and API configurations
  import {
    status_popup,
    loading_shimmer,
    remove_loading_shimmer,
  } from "./globalFunctions1.js";
  import {
    purchaseOrder_API,
  } from "./apis.js";

  import { formatDate } from './globalFunctions2.js';
  
  // Global variables
  const token = localStorage.getItem("token");
//=============================================================================
let purchaseOrderId = new URLSearchParams(window.location.search).get('id')
document.getElementById('edit_PurchaseOrder_btn').href = `edit-purchase-order.html?id=${purchaseOrderId}`
//sending the id for the edit
// document.getElementById('edit_PurchaseOrder_btn').href = `edit-purchase-order.html?id=${purchaseOrderId}`

window.editLoadData = async function editLoadData(){
    const description =  document.getElementById('description')
    const projectCard = document.getElementById('projectCard')
    const clientCard = document.getElementById('clientCard')
    const projectTableData = document.getElementById('tbodyfive')
    const clientTableData = document.getElementById('tbodytwo')
    const purchaseOrderTableData = document.getElementById('tbodyone') 
    const materialTableData = document.getElementById('tbodythree')
    // const quantity = document.getElementById('qty')
    // const unit = document.getElementById('unitCost')
    // const dispatchDate = document.getElementById('dispatchDate')
    // const deliveredDate = document.getElementById('delieveryDate')
    // const netAmount = document.getElementById('netPayableAmount')
    // const duesAmount = document.getElementById('duesAmount')
    // const stock = document.getElementById('inStock')
    // const orderedBy = document.getElementById('orderBy')
    // const transporterDetails = document.getElementById('transporterDetails')
    // const totalFreightChargesAmount = document.getElementById('frieghtCharges')
    // const totalDeductionAmount = document.getElementById('totalDeductionAmount')
    // const totalReceivedAmount = document.getElementById('totalRecievedAmount')
    // const remarks = document.getElementById('remarks')
    // const selectPrjClnt = document.getElementById('selectProjectNdCLient')

 try {
  loading_shimmer()
   const response = await fetch(`${purchaseOrder_API}/get?_id=${purchaseOrderId}`,{
     method:'GET',
     headers:{
         'Content-Type':'application/json',
         'Authorization':`Bearer ${token}`
     }
   })
   const res = await response.json();
   let purchase = res.purchase;
   console.log(purchase);
      description.innerText = purchase.remarks;

      purchaseOrderTableData.innerHTML=`
        <tr>
          <td>Vendor Name: </td>
          <td class="text-end">${purchase.purchaseVendor.vendorName}</td>
        </tr>
        <tr>
          <td>Ordered By: </td>
          <td class="text-end">${purchase.orderedBy}</td>
        </tr>
        <tr>
          <td>Dispatched Date: </td>
          <td class="text-end">${purchase.dispatchDate}</td>
        </tr>
        <tr>
          <td>Delieverd Date: </td>
          <td class="text-end">${purchase.deliveredDate}</td>
        </tr>
        <tr>
          <td>Quantity: </td>
          <td class="text-end">${purchase.quantity}</td>
        </tr>
        <tr>
          <td>Unit: </td>
          <td class="text-end">${purchase.unit}</td>
        </tr>
        <tr>
          <td>P.O Amount: </td>
          <td class="text-end">${purchase.poAmount}</td>
        </tr>
        <tr>
          <td>Deduction Amount: </td>
          <td class="text-end">${purchase.totalDeductionAmount}</td>
        </tr>
        <tr>
          <td>Freight Amount: </td>
          <td class="text-end">${purchase.totalFreightChargesAmount}</td>
        </tr>
        <tr>
          <td>Recieved Amount: </td>
          <td class="text-end">${purchase.totalReceivedAmount}</td>
        </tr>
      `
      materialTableData.innerHTML=`
      <tr>
            <td>Product Id: </td>
              <td class="text-end">${purchase.material.productId}</td>
            </tr>
            <tr>
            <td>Product Name: </td>
              <td class="text-end">${purchase.material.material}</td>
            </tr>
      `

      if(purchase.project){
          projectCard.style.display = 'block'
          clientCard.style.display = 'none'
            projectTableData.innerHTML=`
            <tr>
            <td>Project Id: </td>
              <td class="text-end">${purchase.project.projectId}</td>
            </tr>
            <tr>
            <td>Project Name: </td>
              <td class="text-end">${purchase.project.projectName}</td>
            </tr>
            `
      }
      else if(purchase.project && purchase.user){
        projectCard.style.display = 'none'
          clientCard.style.display = 'block'
          clientTableData.innerHTML=`
          <tr>
          <td>User Id: </td>
            <td class="text-end">${purchase.user.userId}</td>
          </tr>
          <tr>
          <td>User Name: </td>
            <td class="text-end">${purchase.user.name}</td>
          </tr>
          `
      }

const z1 = document.getElementById("recieptDetailsId");

      purchase.paymentDetails.forEach((e,i)=>{
        const zz2 = document.createElement("div");
        zz2.classList.add("col-xl-6");
        zz2.innerHTML = `
            <div class="card">
              <div class="card-body rounded-top  ps-0 pe-0 pb-0 pt-3" style="background-color: #373737">
                <h6 class="card-title text-white mb-3 ps-2" >Recipt ${i+1}</h6>
                <table class="table table-striped table-border mb-0 ">
                  <tbody id="" class="">
                    <tr><td>Date :</td><td class="text-end">${formatDate(e?.date)}</td></tr>
                    <tr><td>Terms :</td><td class="text-end">${e?.terms}</td></tr>
                    <tr><td>Amount Details :</td><td class="text-end">${e?.amountDetails || 0}</td></tr>
                    <tr><td>Status :</td><td class="text-end">${e?.status || 0}</td></tr>
                    <tr><td>Transaction Type :</td><td class="text-end">${e?.transactionType || 0}</td></tr>
                    <tr><td>Amount :</td><td class="text-end">₹${e?.amount || 0}</td></tr>
                    <tr><td>Payment Date :</td><td class="text-end">${formatDate(e?.paymentDate) || 0}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
        `;
        z1.appendChild(zz2);
      });


 } catch (error) {
  console.log(error);
 }
 finally{
  remove_loading_shimmer();
 }
}
editLoadData();
//=================================================================