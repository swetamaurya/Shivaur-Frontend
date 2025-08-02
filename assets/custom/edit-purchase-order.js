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
  product_API,
  vendor_API,
  project_API,
  user_API
} from "./apis.js";

// Global variables
const token = localStorage.getItem("token");
let productData = [];
let vendorData = [];

//=================================================================================
// getting the Id and showing the data in the fields
let purchaseOrderId = new URLSearchParams(window.location.search).get('id')

window.editLoadData = async function editLoadData(){
    const status =  document.getElementById('purchaseStatus')
    const material = document.getElementById('itemDetails')
    const purchaseVendor = document.getElementById('purchaseFromVendor')
    const purchasePurpose = document.getElementById('purchasePurpose')
    const purchaseOrderDate = document.getElementById('purchaseOrderDate') 
    const poAmount = document.getElementById('poAmount')
    const quantity = document.getElementById('qty')
    const unit = document.getElementById('unitCost')
    const dispatchDate = document.getElementById('dispatchDate')
    const deliveredDate = document.getElementById('delieveryDate')
    const netAmount = document.getElementById('netPayableAmount')
    const duesAmount = document.getElementById('duesAmount')
    const stock = document.getElementById('inStock')

    const siteOptions = document.getElementById("siteOptions");
    const dynamicList = document.getElementById("dynamicList");

    const orderedBy = document.getElementById('orderBy')
    const transporterDetails = document.getElementById('transporterDetails')
    const totalFreightChargesAmount = document.getElementById('frieghtCharges')
    const totalDeductionAmount = document.getElementById('totalDeductionAmount')
    const totalReceivedAmount = document.getElementById('totalRecievedAmount')
    const remarks = document.getElementById('remarks')
    const selectPrjClnt = document.getElementById('selectProjectNdCLient')
    const prj = document.getElementById('prj')
    const clnt = document.getElementById('clnt')

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

 
   status.value = purchase.status || '';
   material.value = purchase.material._id || '';
   purchaseVendor.value = purchase.purchaseVendor._id || '';
   purchasePurpose.value = purchase.purchasePurpose || '';
   purchaseOrderDate.value = purchase.purchaseOrderDate || '';
   poAmount.value = purchase.poAmount || '';
   quantity.value = purchase.quantity || '';
   unit.value = purchase.unit || '';
   dispatchDate.value = purchase.dispatchDate || '';
   deliveredDate.value = purchase.deliveredDate || '';
   netAmount.value = purchase.netAmount || '';
   duesAmount.value = purchase.duesAmount || '';
   stock.value = purchase.stock || '';
   orderedBy.value = purchase.orderedBy || '';
   transporterDetails.value = purchase.transporterDetails || '';
   totalFreightChargesAmount.value = purchase.totalFreightChargesAmount || '';
   totalDeductionAmount.value = purchase.totalDeductionAmount || '';
   totalReceivedAmount.value = purchase.totalReceivedAmount || '';
   remarks.value = purchase.remarks || '';
   selectPrjClnt.value = purchase.selectPrjClnt || '';
   if(selectPrjClnt.value === 'Project'){
       prj.style.display = 'block'
       clnt.style.display = 'none'
    document.getElementById('selectProject').value = purchase.project._id;
   }
   else{
    prj.style.display = 'none'
    clnt.style.display = 'block'
    document.getElementById('selectClient').value = purchase.user._id;
   }
//==== if else to show & hide elements ====// 
   if(stock.value === 'Site'){
    siteOptions.style.display = 'block'
    dynamicList.style.display = 'none'
   }
   else{
    dynamicList.style.display = 'block'
    siteOptions.style.display = 'none'
   }
   for(let i=0; i<purchase.paymentDetails.length; i++){
       let paymentArr = purchase.paymentDetails[i]
       let row = document.querySelectorAll('.tbodyonepayment tr')
       console.log('index: ',i,' Rows: ',row)
       let elements = row[i].querySelectorAll('td')
       console.log('index: ',i,' Elements: ',elements)
       try {
           let element1Input = elements[1]?.querySelector("input");
           if (element1Input) element1Input.value = paymentArr?.date;
           
          let element2Input = elements[2]?.querySelector("select");
          if (element2Input) element2Input.value = paymentArr?.terms;
          
          let element3Input = elements[3]?.querySelector("input");
          if (element3Input) element3Input.value = paymentArr?.amountDetails;
          
          let element4Input = elements[4]?.querySelector("select");
          if (element4Input) element4Input.value = paymentArr?.status;
          
          let element5Input = elements[5]?.querySelector("select");
          if (element5Input) element5Input.value = paymentArr?.transactionType;
          
          let element6Input = elements[6]?.querySelector("input");
          if (element6Input) element6Input.value = paymentArr?.amount;
          
          let element7Input = elements[7]?.querySelector("input");
          if (element7Input) element7Input.value = paymentArr?.paymentDate;
          
        //   addPurchaseOrderPaymentTableRow();
    } catch (error) {
        console.log(error);
    }
    if (purchase.paymentDetails.length-1 != i) {
        addPurchaseOrderPaymentTableRow()
      }
   }

 } catch (error) {
  console.log(error);
 }
 finally{
  remove_loading_shimmer();
 }
}
editLoadData();

// =================================================================================
//Showing Totals for the Freight Charges, Recieved, Deduction
let totalFreight;
let totalRecieved;
let totalDeduction;
let total;
let freightCharges = document.getElementById('frieghtCharges');
let totalDeductionAmount = document.getElementById('totalDeductionAmount');
let totalRecievedAmount = document.getElementById('totalRecievedAmount');
document.querySelector('.tbodyonepayment').addEventListener('change',(e)=>{
  if(e.target.classList.contains('paymentStatus2')){
    handleChangePaymentStatus(e)
  }
  if(e.target.classList.contains('paymentAmount')){
    handleChangepaymentAmount(e)
  }
  if(e.target.classList.contains('paymentStatus')){
    handleChangepaymentStatus(e)
  }
})
function handleChangePaymentStatus(event){
  recalculateSum()
}
function handleChangepaymentAmount(event){
  recalculateSum()
}
function handleChangepaymentStatus(event){
  recalculateSum()
}

function recalculateSum() {
  totalFreight = 0;
  totalRecieved = 0;
  totalDeduction = 0;
  total = 0;

  let rows = document.querySelectorAll('.paymentData');
  rows.forEach(row => {
    let paymentAmount = Number(row.querySelector('.paymentAmount').value);
    let paymentStatus = row.querySelector('.paymentStatus2').value;
    let PaymentStatus = row.querySelector('.paymentStatus').value;

    if(PaymentStatus === 'Paid'){
    if (paymentStatus === 'Frieght Charges') {
      totalFreight += paymentAmount;
    }
    else if(paymentStatus === 'Received'){
      totalRecieved += paymentAmount;
    }
    else if(paymentStatus === 'Deduction'){
      totalDeduction += paymentAmount;
    }
  }
  });
  total = totalFreight+totalRecieved+totalDeduction
  duesAmount(total);
  freightCharges.value = totalFreight;
  totalRecievedAmount.value = totalRecieved;
  totalDeductionAmount.value =totalDeduction;
  netPayableAmount(totalRecieved);
}
//=================================================================================
//Net Payable Amount Functionality
function netPayableAmount(deduct){
  // console.log('this is my total deduct amount: ',typeof(deduct))
  let NetPayableAmount = document.getElementById('netPayableAmount');
  let poAmount = document.getElementById('poAmount').value;
  let poAmt = Number(poAmount);
  if(deduct!=0 && poAmt > deduct){
    // if(poAmt === )
  NetPayableAmount.value = poAmt-deduct;
  }
  else{
    NetPayableAmount.value = 0;
  }
}
document.getElementById('poAmount').addEventListener('change',()=>{
  let totalDeductionAmount = document.getElementById('totalDeductionAmount').value;
  let totalRecievedAmount = document.getElementById('totalRecievedAmount').value;
  let frieghtCharges = document.getElementById('frieghtCharges').value;
  let deductedAmount = Number(totalDeductionAmount);
  let recievedAmt = Number(totalRecievedAmount);
  let frieghtedCharges = Number(frieghtCharges)
  let ttl=0;
    if(recievedAmt!=0){
      netPayableAmount(recievedAmt);
    }
    if(frieghtedCharges!=0 || deductedAmount!=0 || recievedAmt!=0){
      ttl = frieghtedCharges+deductedAmount+recievedAmt
      duesAmount(ttl);
    }
})

// Functionality on Dues Amount
function duesAmount(total){
  let DuesAmount = document.getElementById('duesAmount');
  let poAmount = document.getElementById('poAmount').value;
  let poAmt = Number(poAmount);
  if(total!=0 && poAmt > total){
     DuesAmount.value = poAmt-total;
  }
  else{
    DuesAmount.value = 0;
  }
}
//=================================================================================
//Adding the row and removing the row
// Adding the row for the payment section
window.addPurchaseOrderPaymentTableRow = function addPurchaseOrderPaymentTableRow() {
  let tbodyOnePayment = document.getElementsByClassName('tbodyonepayment')[0]
  let varTableConst = document.querySelector('.tbodyonepayment').children
  const i =
    Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
  let tableRow = document.createElement('tr')
  tableRow.setAttribute('class', 'paymentData')
  tableRow.setAttribute('key', `${i}`)
  tableRow.innerHTML = `<td>${i}</td>
                        <td>
                           <input class="form-control date" type="date" id="normalDate" >
                        </td>
                        <td>
                          <select class="form-control terms" id="terms">
                            <option value="" selected="">Select Terms</option>
                            <option value="Payment">Payment</option>
                            <option value="Advance Payment">Advance Payment</option>
                          </select>
                        </td>
                        <td>
                          <input class="form-control detailOfAmount" type="text" id="detailOfAmount" placeholder="Details of Amount">
                        </td>
                        <td>
                          <select class="form-control paymentStatus" id="paymentStatus">
                            <option value="" selected="">Select Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                        <td>
                          <select class="form-control paymentStatus2" id="transactiontype">
                            <option value="" selected="">Select Status</option>
                            <option value="Received">Received</option>
                            <option value="Deduction">Deduction</option>
                            <option value="Frieght Charges">Frieght Charges</option>
                          </select>
                        </td>                        
                        <td>
                          <input class="form-control paymentAmount" type="number" id="paymentAmount" placeholder="Amount">
                        </td>
                        <td>
                          <input class="form-control completionPaymentDate" type="date" id="completionPaymentDate" >
                        </td>
                        <td class="text-center">
                          <a onclick="removePurchaseOrderPaymentTableRow(${i})" href="javascript:void(0)" class="text-danger font-18 addProduct" title="Add">
                            <i class="fa-regular fa-trash-can"></i>
                          </a>
                        </td>`

  tbodyOnePayment.appendChild(tableRow);
}
// removing the row for the payment section
window.removePurchaseOrderPaymentTableRow = function removePurchaseOrderPaymentTableRow(index) {
  let row = document.querySelector('.tbodyonepayment').children[index - 1];
  let paymentStatus = row.querySelector('.paymentStatus2');
  let paymentAmount = row.querySelector('.paymentAmount').value;
  let poAmount = document.getElementById('poAmount').value
  let poAmt = Number(poAmount)
  let pAmount = Number(paymentAmount);
  let removeFreightCharges = Number(freightCharges.value)
  let removetotalDeduction = Number(totalDeductionAmount.value)
  let removetotalRecieved = Number(totalRecievedAmount.value)
  let netPayableAmount = document.getElementById('netPayableAmount');
  let duesAmount = document.getElementById('duesAmount')
  let duesAmt = Number(duesAmount.value);
  let ntpayableAmt = Number(netPayableAmount.value);
  let ttl = 0;

  if(poAmt!=0){
    ttl = removeFreightCharges+removetotalDeduction+removetotalRecieved;
    duesAmount.value = pAmount+duesAmt;
    if(duesAmount.value == poAmt){
      duesAmount.value = 0;
    }
    }

if(paymentStatus.value === 'Received'){
  if(poAmt!=0){
    netPayableAmount.value = ntpayableAmt+pAmount;
    if(netPayableAmount.value == poAmt){
      netPayableAmount.value = 0;
    }
  }
  removetotalRecieved -= pAmount
  totalRecievedAmount.value = removetotalRecieved
}
else if(paymentStatus.value === 'Deduction'){
  removetotalDeduction -= pAmount
  totalDeductionAmount.value = removetotalDeduction;
}
 else if(paymentStatus.value === 'Frieght Charges'){
  removeFreightCharges -= pAmount;
  freightCharges.value = removeFreightCharges
}

  document.querySelector('.tbodyonepayment').children[index - 1].remove();
  Array.from(document.querySelector('.tbodyonepayment').children).map(
    (e, i) => {
      var dummyNo1 = i + 1;
      if (dummyNo1 != 1) {
        e.cells[0].innerText = dummyNo1;
        e.cells[
          e.cells.length - 1
        ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removePurchaseOrderPaymentTableRow(${dummyNo1})" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
      }
    }
  );
}




//==================================================================================
// If User selects the Project then hit the project API otherwise Client

let selection = document.getElementById('selectProjectNdCLient');
selection.addEventListener('change',()=>{
  let prj = document.getElementById('prj');
  if(selection.value=='Project'){
    prj.style.display = 'block'
    clnt.style.display = 'none'
  }
  else{
    clnt.style.display = 'block'
    prj.style.display = 'none'
  }
})
// Project Dropdown API
async function dropdownProject(){
  try {
    const r1 = await fetch(`${project_API}/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      const r2 = await r1.json();
      
      const selectProject = document.getElementById("selectProject");
      r2?.data.map((e) => {
        let a1 = document.createElement("option");
        a1.value = e?._id || '-';
        a1.text = `${e?.projectName} (${e?.projectId})` || '-' ;
        selectProject.appendChild(a1);
      })
  } catch (error) {
    console.log(error);
  }
}
dropdownProject()

//Customer Dropdown API
async function dropdownCustomer(){
  try {
    const r1 = await fetch(`${user_API}/data/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      const r2 = await r1.json();
      console.log('nvdkjnvdnv',r2);
      const customer = r2.users.clients
      
      const selectClient = document.getElementById("selectClient");
      customer.map((e) => {
        let a1 = document.createElement("option");
        a1.value = e?._id || '-';
        a1.text = e?.name  || '-';
        selectClient.appendChild(a1);
      })
  } catch (error) {
    console.log(error);
  }
}
dropdownCustomer()
//=================================================================================
// Fetch Product Data for Dropdown
async function dropdownItemData() {
  const itemDetails = document.getElementById("itemDetails");
  try {
    const response = await fetch(`${product_API}/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch product data");

    const res = await response.json();
    console.log("Products: ", res);
    productData = res.data || [];

    productData.forEach((data) => {
      const option = document.createElement("option");
      option.value = data._id;
      option.innerText = `${data.material}`;
      itemDetails.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}
dropdownItemData();

// =================================================================================
// Fetch Vendor Data for Dropdown
async function dropdownItemDataVendor() {
  const itemDetails = document.getElementById("purchaseFromVendor");
  try {
    const response = await fetch(`${vendor_API}/getAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch vendor data");
 
    const res = await response.json();
    console.log("Vendors: ", res);
    vendorData = res.data || [];

    vendorData.forEach((data) => {
      const option = document.createElement("option");
      option.value = data._id;
      option.innerText = `${data.vendorName}`;
      itemDetails.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching vendor data:", error);
  }
}
dropdownItemDataVendor();

// =================================================================================
// Update Fields Based on Selected Product
document.getElementById("itemDetails").addEventListener("change", () => {
  const itemDetails = document.getElementById("itemDetails");
  const matchedProduct = productData.find((e) => e._id === itemDetails.value);

  if (matchedProduct) {
    document.getElementById("unitCost").value = matchedProduct.unit || "";
    document.getElementById("qty").value = matchedProduct.quantity || "";
  }
});

// =================================================================================
 
// Handle Stock Change
function handleStockChange() {
  const stockDropdown = document.getElementById("inStock");
  const siteOptions = document.getElementById("siteOptions");
  const dynamicList = document.getElementById("dynamicList");

  // Reset visibility
  siteOptions.style.display = "none";
  dynamicList.style.display = "none";

  // Show site options if "Site" is selected
  if (stockDropdown.value === "Site") {
    siteOptions.style.display = "block";
  }
}
 
// Handle Site Option Change
async function handleSiteOptionChange() {
  const siteSelect = document.getElementById("siteSelect");
  const dynamicList = document.getElementById("dynamicList");
  const listTitle = document.getElementById("listTitle");
  const listItems = document.getElementById("listItems");

  // Reset the list
  listItems.innerHTML = "";

  // Determine the selected option and API endpoint
  let apiEndpoint = "";
  let listTitleText = "";

  if (siteSelect.value === "Project") {
    apiEndpoint = project_API;
    listTitleText = "Project List";
  } else if (siteSelect.value === "Client") {
    apiEndpoint = user_API;
    listTitleText = "Customer List";
  } else {
    return;
  }

  try {
    // Fetch data from the API
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();
    const items = data.data || []; // Adjust based on API structure

    // Populate the list
    listTitle.textContent = listTitleText;
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = item.name || item.title; // Adjust based on API structure
      listItems.appendChild(li);
    });

    // Show the list
    dynamicList.style.display = "block";
  } catch (error) {
    console.error(`Error fetching ${listTitleText.toLowerCase()}:`, error);
  }
}
// Expose functions to the global scope
window.handleStockChange = handleStockChange;
window.handleSiteOptionChange = handleSiteOptionChange;
// =================================================================================
// Form Submission Handler
document
  .getElementById("edit_purchaseOrder_form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      loading_shimmer(); // Show loading shimmer
      let inStock = document.getElementById('inStock')

      // Extract input values
      const purchase={}
      let paymentDetails=[];
      document.querySelectorAll('.paymentData').forEach((e, i) => {
        let rows = e.querySelectorAll('td');
        // rows.forEach((ee, ii) => {
          paymentDetails.push({
            paymentDate: rows[1].querySelector('input').value || '',
              terms: rows[2].querySelector('select').value || '',
              amountDetails: rows[3].querySelector('input').value || '',
              status: rows[4].querySelector('select').value || '',
              transactionType: rows[5].querySelector('select').value || '',
              amount: rows[6].querySelector('input').value || '',
              date: rows[7].querySelector('input').value || '',
          })
        // });
      });
      let selectProjectNdCLient = document.getElementById('selectProjectNdCLient')
      if(inStock.value = 'In Stock'){
        console.log('hi this is me');
      }
      else{
      if(selectProjectNdCLient.value === 'Project'){
        purchase.project = document.getElementById('selectProject').value.trim();
      }
      else{
        purchase.user = document.getElementById('selectClient').value.trim();
      }
    }
      Object.assign(purchase,{

            status : document.getElementById('purchaseStatus').value.trim(),
            material: document.getElementById('itemDetails').value.trim(),
            purchaseVendor: document.getElementById('purchaseFromVendor').value.trim(),
            purchasePurpose: document.getElementById('purchasePurpose').value.trim(),
            purchaseOrderDate: document.getElementById('purchaseOrderDate').value.trim(), 
            poAmount: document.getElementById('poAmount').value.trim(),
            quantity: document.getElementById('qty').value.trim(),
            unit: document.getElementById('unitCost').value.trim(),
            dispatchDate: document.getElementById('dispatchDate').value.trim(),
            deliveredDate: document.getElementById('delieveryDate').value.trim(),
            netAmount: document.getElementById('netPayableAmount').value.trim(),
            duesAmount: document.getElementById('duesAmount').value.trim(),
            stock: document.getElementById('inStock').value.trim(),
            orderedBy: document.getElementById('orderBy').value.trim(),
            transporterDetails: document.getElementById('transporterDetails').value.trim(),
            paymentDetails,
            totalFreightChargesAmount: document.getElementById('frieghtCharges').value.trim(),
            totalDeductionAmount: document.getElementById('totalDeductionAmount').value.trim(),
            totalReceivedAmount: document.getElementById('totalRecievedAmount').value.trim(),
            remarks: document.getElementById('remarks').value.trim(),
            selectPrjClnt: document.getElementById('selectProjectNdCLient').value.trim(),
            _id:purchaseOrderId
        
            // invoice: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseInvoice" },
      });

      // Submit data to the server
      const response = await fetch(`${purchaseOrder_API}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(purchase),
      });

      const res = await response.json();
      console.log("Purchase Order Response: ", res);

      if (!response.ok) throw new Error(res.message || "Failed to add purchase order");

      status_popup("Purchase Order Created Successfully!", true);
      setTimeout(() => {
        window.location.href = "purchase-order-list.html";
      }, Number(document.getElementById("b1b1").innerText) * 1000);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      status_popup("Error adding Purchase Order. Please try again.", false);
    } finally {
      remove_loading_shimmer(); // Hide loading shimmer
    }
  });

  
  // Validation

  function validatorPurchaseOrder() {
    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Get all field elements
    const qty = document.getElementById("qty").value.trim() 
    const q = document.getElementById("qty")
    
    // purchaseStatus
    const itemDetails = document.getElementById("itemDetails")
    const unitCost = document.getElementById("unitCost")
      const purchasePurpose = document.getElementById("purchasePurpose")
      const purchaseFromVendor = document.getElementById("purchaseFromVendor")
      const purchaseOrderDate = document.getElementById("purchaseOrderDate")
      const poAmount = document.getElementById("poAmount")
      const advancePayment = document.getElementById("advancePayment")
      const invoiceDate = document.getElementById("invoiceDate").value.trim();
      const invoiceValue = document.getElementById("invoiceValue")
      const invoiceNo = document.getElementById("invoiceNo").value.trim();
      // const totalInvoiceAmount = document.getElementById("totalInvoiceAmount").value;
      const duesAmount = document.getElementById("duesAmount")
      const finalAmountPaid = document.getElementById("finalAmountPaid")
      const paymentDate = document.getElementById("paymentDate")
      const dispatchDate = document.getElementById("dispatchDate")
      const transporterDetails = document.getElementById("transporterDetails")
      const frieghtCharges = document.getElementById("frieghtCharges")
      const delieveryDate = document.getElementById("delieveryDate")
      const inStock = document.getElementById("inStock")
      const orderBy = document.getElementById("orderBy")
      const remarks = document.getElementById("remarks")

      let domQuantity = Number(qty);
      let fetchedQuantity = Number(quantity)

    
    if(!itemDetails.value){
      showError(itemDetails, 'Enter itemDetails');
      isValid = false;
    }
    if (!unitCost.value.trim()) {
      showError(unitCost, 'Unit Cost is required');
      isValid = false;
    }
    if (!purchasePurpose.value.trim()) {
      showError(purchasePurpose, 'Purchase Purpose is required');
      isValid = false;
    }
    // Ensure both are valid numbers before comparison
    if (isNaN(domQuantity) || isNaN(fetchedQuantity)) {
        showError(q, 'Invalid quantity values');
        isValid = false;
    } else if (!qty || domQuantity > fetchedQuantity) {
        showError(q, 'Quantity must be less than or equal to actual Quantity');
        isValid = false;
    }
    
    if (!purchaseFromVendor.value.trim()) {
      showError(purchaseFromVendor, 'Enter a Purchase From Vendor ');
      isValid = false;
    }
    if(!purchaseOrderDate.value){
      showError(orderDate, 'Enter Purchase Order Date');
      isValid = false;
    }

    if(!poAmount.value){
      showError(poAmount, 'Enter PO Amount');
      isValid = false;
    }
    if(!advancePayment.value){
      showError(advancePayment, 'Enter Advanced Payment');
      isValid = false;
    }
    if(!invoiceDate.value){
      showError(invoiceDate, 'Enter Invoice Date');
      isValid = false;
    }
    if(!invoiceValue.value){
        showError(invoiceValue, 'Enter Invoice Value');
        isValid = false;
      }
    if(!invoiceNo.value){
      showError(invoiceNo, 'Enter Invoice No');
      isValid = false;
    }
    if(!duesAmount.value){
      showError(duesAmount, 'Enter Dues Amount');
      isValid = false;
    }
    if(!finalAmountPaid.value){
      showError(finalAmountPaid, 'Enter final Amount Paid');
      isValid = false;
    }
    if(!paymentDate.value){
      showError(amountReceived, 'Enter Payment Date');
      isValid = false;
    }
    if(!dispatchDate.value){
      showError(dues, 'Enter Dispatch Date');
      isValid = false;
    }
    if(!transporterDetails.value){
      showError(orderRef, 'Enter Transporter Details');
      isValid = false;
    }
    if(!frieghtCharges.value){
      showError(frieghtCharges, 'Enter Frieght Charges');
      isValid = false;
    }
    if(!delieveryDate.value){
      showError(description, 'Enter delieveryDate');
      isValid = false;
    }
    if(!inStock.value){
      showError(startDate, 'Enter In Stock');
      isValid = false;
    }
    if(!orderBy.value){
      showError(orderBy, 'Enter Order By');
      isValid = false;
    }
    if(!remarks.value){
        showError(remarks, 'Enter remarks By');
        isValid = false;
    }

    return isValid;
}
  
function showError(element, message) {
  const errorContainer = element.previousElementSibling; // Access the div with label
  let errorElement = errorContainer.querySelector('.text-danger.text-size');

  if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'text-danger text-size mohit_error_js_dynamic_validation';
      errorElement.style.fontSize = '10px';
      errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
      errorContainer.appendChild(errorElement);
  } else {
      errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
  }
}
// --------------------------------------------------------------------------------------------------
// Function to clear all error messages
// --------------------------------------------------------------------------------------------------
function clearErrors() {
  const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
  errorMessages.forEach((msg) => msg.remove());
}