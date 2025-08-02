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

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
const token = localStorage.getItem('token');
// =================================================================================
// =================================================================================
// =================================================================================
let cachedProject = [];
let cachedUser = [];
let cachedProduct = [];
async function loadAllList(){
  try{
    loading_shimmer();
  } catch(error){console.log(error)}
  // -------------------------------------------------------------------------------
  try {
    const ddd1 = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    // ----------------------------------------------
    const api1 = fetch(`${project_API}/get`, ddd1 );
    const api3 = fetch(`${product_API}/get`, ddd1);
    const api2 = fetch(`${user_API}/data/get`, ddd1);
    // -------------------------------------------------------------------------------

    // Await all fetch calls and parse JSON
    const responses = await Promise.all([api1, api2, api3]);

    const [data1, data2, data3] = await Promise.all(
      responses.map((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
    );
    // -------------------------------------------------------------------------------
    cachedProject = data1?.data;
    cachedUser = data2?.users?.clients;
    cachedProduct = data3?.data;
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
  // -------------------------------------------------------------------------------
  try{
    const aa1 = document.getElementById("projSelectOption");
    aa1.innerHTML += cachedProject.map((e,i)=>{
      return `<option value="${e?._id}" >${e?.projectName} (${e?.projectId})</option>`;
    }).join("");
  } catch (error) {console.error("Error occurred while fetching data:", error);}
  // -------------------------------------------------------------------------------
  try{
    const aa1 = document.getElementById("clintSelectOption");
    const aa2 = document.getElementById("saleClintSelectOption");

    let ddd1= cachedUser.map((e,i)=>{
      return `<option value="${e?._id}" >${e?.name} (${e?.userId})</option>`;
    }).join("");

    aa1.innerHTML += ddd1;
    aa2.innerHTML += ddd1;
  } catch (error) {console.error("Error occurred while fetching data:", error);}
  // -------------------------------------------------------------------------------
  try{
    const aa1 = document.getElementById("prodMaterialSelectOption");
    aa1.innerHTML += cachedProduct.map((e,i)=>{
      return `<option value="${e?._id}" >${e?.material} (${e?.productId})</option>`;
    }).join("");
  } catch (error) {console.error("Error occurred while fetching data:", error);}
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}
}
loadAllList();
//==========================================================================================
//==========================================================================================
let formSale = document.getElementById("add_saleOrder_form");
formSale.addEventListener("submit", async function(event){
  event.preventDefault();
  try{
    loading_shimmer();
  } catch(error){console.log(error)}
  // ----------------------------------------------------------------------------------------
  try{
    let API = `${saleOrder_API}/post`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(rtnObjDataForm())
    });

    const c1 = (response.ok);
    try{
      status_popup( ((c1) ? "Sale Created <br> Successfully!" : "Please try <br> again later"), (c1) );
      setTimeout(function(){
        window.location.href = 'sale-order-list.html';  
      },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error){
      status_popup("Please try <br> again later", false);
    }

  } catch(error){console.log(error)}

  // ----------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}
})

function rtnObjDataForm(){
  let objects = {};
  objects.orderCategory = document.getElementById("orderCategorySelectOption").value;
  if(objects.orderCategory=="Client"){
    objects.client = document.getElementById("clintSelectOption").value;
  } else {
    objects.project = document.getElementById("projSelectOption").value;
  }
  objects.status = document.getElementById("status").value;
  objects.saleTo = document.getElementById("saleClintSelectOption").value;
  objects.customerOrderRef = document.getElementById("customerOrderRef").value;
  objects.orderRef = document.getElementById("orderRef").value;
  objects.orderDate = document.getElementById("orderDate").value;
  objects.complitionDate = document.getElementById("complicationDate").value;
  objects.material = document.getElementById("prodMaterialSelectOption").value;
  objects.quantity = document.getElementById("qty").value;
  objects.unit = document.getElementById("unitCost").value;
  objects.deliveryDateToCustomer = document.getElementById("delieveryDateToConsumer").value;
  objects.price = document.getElementById("price").value;
  objects.dues = document.getElementById("dues").value;
  objects.netAmount = document.getElementById("netPayable").value;
  objects.totalReceivedAmount = document.getElementById("ttlRcvdAmt").value;
  objects.totalDeductionAmount = document.getElementById("ttlDdcnAmt").value;
  objects.description = document.getElementById("description").value;

  objects.paymentDetails = [];
  let paymentRows = document.querySelectorAll(".tbodyonepayment .paymentData");
  paymentRows.forEach((row) => {
    let paymentDateElement = row.querySelector("#paymentSecDate");
    let termsElement = row.querySelector("#terms");
    let amountDetailsElement = row.querySelector("#detailOfAmount");
    let statusElement = row.querySelector("#paymentStatus");
    let transactionTypeElement = row.querySelector("#transactiontype");
    let amountElement = row.querySelector("#paymentAmount");
    let dateElement = row.querySelector("#completionPaymentDate");

    // Safely retrieve values, defaulting to empty string if null
    let paymentDate = paymentDateElement ? paymentDateElement.value : "";
    let terms = termsElement ? termsElement.value : "";
    let amountDetails = amountDetailsElement ? amountDetailsElement.value : "";
    let status = statusElement ? statusElement.value : "";
    let transactionType = transactionTypeElement ? transactionTypeElement.value : "";
    let amount = amountElement ? amountElement.value : "";
    let date = dateElement ? dateElement.value : "";

    objects.paymentDetails.push({
      paymentDate,
      terms,
      amountDetails,
      status,
      transactionType,
      amount,
      date,
    });
  });

  return objects;
}



//==========================================================================================
//==========================================================================================
//==========================================================================================

function removeCalculation(){
  let ps1 = document.querySelectorAll(".paymentAmount");
  ps1.forEach(e=>{
    e.removeEventListener("input", mainCalc)
  });
  
  let ps2 = document.querySelectorAll(".transactionTypeClass");
  ps2.forEach(e=>{
    e.removeEventListener("change", mainCalc)
  })

  let ps3 = document.querySelectorAll(".paymentStatus");
  ps3.forEach(e=>{
    e.removeEventListener("change", paymentStatusHandler)
  });

}
function addCalculation(){
  let ps1 = document.querySelectorAll(".paymentAmount");
  ps1.forEach(e=>{
    e.addEventListener("input", mainCalc)
  });
  
  let ps2 = document.querySelectorAll(".transactionTypeClass");
  ps2.forEach(e=>{
    e.addEventListener("change", mainCalc)
  })

  let ps3 = document.querySelectorAll(".paymentStatus");
  ps3.forEach(e=>{
    e.addEventListener("change", paymentStatusHandler)
  });

}
addCalculation();

// ----------------------------------------------------------------------------------------
document.getElementById("price").addEventListener("input", mainCalc);

let qqt1 = document.getElementById("qty");
qqt1.addEventListener("input", qtyMaxTrack);
function qtyMaxTrack () {
  const maxValue = Number(qqt1.getAttribute("max") || 0);
  const currentValue = Number(qqt1.value);

  if (currentValue > maxValue) {
    qqt1.value = maxValue;
  }
}
// ----------------------------------------------------------------------------------------
function mainCalc(){
  let receivedVar = 0;
  let deductionVar = 0;
  let pss1 = document.querySelectorAll(".paymentAmount");
  pss1.forEach(e=>{

    let abz1 = e.closest("tr");
    
    let abz2 = abz1.querySelector(".transactionTypeClass");
    let abz3 = abz1.querySelector(".paymentAmount");
    
    if(abz2.value){
      if(abz2.value=="Received"){
        receivedVar+=Number(abz3.value);
      } else if(abz2.value=="Deduction"){
        deductionVar+=Number(abz3.value);
      }
    }

  })

  let abc1 = document.getElementById("price");
  let abc2 = document.getElementById("dues");
  let abc3 = document.getElementById("netPayable");

  abc3.value = Number(abc1.value)-deductionVar;
  abc2.value = Number(abc3.value)-receivedVar;

  let abc4 = document.getElementById("ttlRcvdAmt");
  let abc5 = document.getElementById("ttlDdcnAmt");
  abc4.value = receivedVar;
  abc5.value = deductionVar;

}
// ----------------------------------------------------------------------------------------
function paymentStatusHandler (event){
  let az1 = event.target;
  let az2 = az1.closest("tr");
  
  let az3 = az2.querySelector(".transactionTypeClass");
  let az4 = az2.querySelector(".completionPaymentDate");

  if(az1.value=="Paid"){
    az3.removeAttribute("disabled");
    az4.removeAttribute("disabled");
  } else {
    az3.value="";
    az4.value="";
    az3.setAttribute("disabled","");
    az4.setAttribute("disabled","");
  }
}
//==========================================================================================
//==========================================================================================
//==========================================================================================
function getMaterialSelectedObject(material__id){
  const material = cachedProduct.find(d=> d._id == material__id);
  return material;
}
document.getElementById("prodMaterialSelectOption").addEventListener("change", function(event){
  let a1 = event.target.value;
  let ooo1 = getMaterialSelectedObject(a1)
  
  document.getElementById("qtySpan").innerText = ooo1?.quantity;
  document.getElementById("qty").setAttribute("max",ooo1?.quantity);
  document.getElementById("unitCost").value = ooo1?.unit;
  document.getElementById("price").value = ooo1?.totalPrice;
  document.getElementById("dues").value = ooo1?.totalPrice;
  document.getElementById("netPayable").value = ooo1?.totalPrice;
  
  qtyMaxTrack();
  mainCalc();
});

//==========================================================================================
document.getElementById("orderCategorySelectOption").addEventListener("change", function(event){
  let aa1 = event.target;
  let aa2 = aa1.selectedOptions[0].getAttribute("divider").split("-");

  aa1.parentElement.classList.replace("col-sm-6","col-sm-3");

  document.getElementById(aa2[0]).classList.remove("d-none");
  document.getElementById(aa2[1]).classList.add("d-none");

  document.getElementById("projSelectOption").value="";
  document.getElementById("clintSelectOption").value="";
});

//==========================================================================================
//==========================================================================================
//==========================================================================================

//Adding the row and remove the row function

// Adding the row for the payment section
window.addSaleOrderPaymentTableRow = function addSaleOrderPaymentTableRow() {
  let tbodyOnePayment = document.getElementsByClassName('tbodyonepayment')[0]
  let varTableConst = document.querySelector('.tbodyonepayment').children
  const i =
    Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
  let tableRow = document.createElement('tr')
  tableRow.setAttribute('class', 'paymentData')
  tableRow.setAttribute('key', `${i}`)
  tableRow.innerHTML = `<td>${i}</td>
                        <td>
                           <input class="form-control date" type="date" id="paymentSecDate" >
                        </td>
                        <td>
                          <select class="form-control terms" id="terms">
                            <option value="" selected disabled>Select Terms</option>
                            <option value="Payment">Payment</option>
                            <option value="Advance Payment">Advance Payment</option>
                          </select>
                        </td>
                        <td>
                          <input class="form-control detailOfAmount" type="text" id="detailOfAmount" placeholder="Details of Amount">
                        </td>
                        <td>
                          <select class="form-control paymentStatus" id="paymentStatus">
                            <option value="" selected="" disabled>Select Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                        <td>
                          <select class="form-control transactionTypeClass" id="transactiontype" disabled >
                            <option value="" selected=""  disabled >Select Status</option>
                            <option value="Received">Received</option>
                            <option value="Deduction">Deduction</option>
                          </select>
                        </td>                        
                        <td>
                          <input class="form-control paymentAmount" type="number" id="paymentAmount" placeholder="Amount">
                        </td>
                        <td>
                          <input class="form-control completionPaymentDate" type="date" id="completionPaymentDate" disabled >
                        </td>
                        <td class="text-center">
                          <a onclick="removeSaleOrderPaymentTableRow(${i})" href="javascript:void(0)" class="text-danger font-18 addProduct" title="Add">
                            <i class="fa-regular fa-trash-can"></i>
                          </a>
                        </td>`;

  tbodyOnePayment.appendChild(tableRow);

  removeCalculation();
  addCalculation();
}

// Adding the row for the payment section
window.removeSaleOrderPaymentTableRow = function removeSaleOrderPaymentTableRow(index) {
  document.querySelector('.tbodyonepayment').children[index - 1].remove();
  Array.from(document.querySelector('.tbodyonepayment').children).map(
    (e, i) => {
      var dummyNo1 = i + 1;
      if (dummyNo1 != 1) {
        e.cells[0].innerText = dummyNo1;
        e.cells[
          e.cells.length - 1
        ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeSaleOrderPaymentTableRow(${dummyNo1})" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
      }
    }
  );
  mainCalc();
}