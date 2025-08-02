// import {status_popup} from './globalFunctions1.js';
// import {user_API ,project_API ,estimate_API} from './apis.js';

// const token = localStorage.getItem("token");
// var id;

// try {
//   const response = await fetch(`${user_API}/data/get`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const res = await response.json();

//   const client_select_option = document.getElementById("client_select_option");
//   res.users.clients.forEach((client) => {
//     const option = document.createElement("option");
//     option.value = client._id;
//     option.text = `${client?.name} (${client?.userId})`;
//     client_select_option.appendChild(option);
//   });
// }
// catch(error){
//   console.error('Error fetching data:', error);
// alert('Failed to load client and employee data.');
// }
// async function showProjectDropdown(){
//   const r1 = await fetch(`${project_API}/get`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`
//       },
//     });
//     const r2 = await r1.json();
    
//     console.log("brlrla :- ",r2)
//     const project_select_option = document.getElementById("project_select_option");
//     r2?.data.map((e) => {
//       let a1 = document.createElement("option");
//       a1.value = e?._id || '-';
//       a1.text = `${e?.projectName} (${e?.projectId})` || '-' ;
//       project_select_option.appendChild(a1);
//     });
// }
// showProjectDropdown();
// window.onload = async () => {
//   // const token = localStorage.getItem('authToken');
//   id = new URLSearchParams(window.location.search).get("id");
//   const URL = `${estimate_API}/get/${id}`;
//   const responseData = await fetch(URL, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const res = await responseData.json()
//   console.log("alsjdfal :- ",res)
//       let taxPerc = document.getElementById("taxPerc");
//       let detailsData;

//       document.getElementById("email").value = res.email;
//       document.getElementById("taxType").value = res.taxType;
//       document.getElementById("clientAddress").value = res.clientAddress;
//       document.getElementById("billingAddress").value = res.billingAddress;
//       document.getElementById("estimateDate").value = res.estimateDate;
//       document.getElementById("expiryDate").value = res.expiryDate;
//       document.getElementById("client_select_option").value = res.client._id;
//       document.getElementById("tax").value = res.tax;
//       document.getElementById("project_select_option").value = res.project._id;
//       document.getElementById("totalAmount").innerText = res.total;
//       document.getElementById("discount").value = res.discount;
//       document.getElementById("grandTotal").innerText = res.GrandTotal;
//       let taxPercentage = Math.ceil(
//         (parseInt(res.tax) / parseInt(res.total)) * 100
//       );
//       taxPerc.innerText = taxPercentage + "%";

//       detailsData = res.details;

//       let cond = true;
//       detailsData.map((e) => {
//         addInvoiceTableRow(
//           "editTable",
//           e.item,
//           e.description,
//           e.unitCost,
//           e.qty,
//           e.amount,
//           cond
//         );
//         cond = false;
//       });
// };
// // update estimate API start

// const updateEstimateForm = document.getElementById("update-estimate-form");
// updateEstimateForm.addEventListener("submit", async (event) => {
//   event.preventDefault();
//   try {
//     const _id = id;
//   const email = document.getElementById("email").value;
//   const clientAddress = document.getElementById("clientAddress").value;
//   const billingAddress = document.getElementById("billingAddress").value;
//   const estimateDate = document.getElementById("estimateDate").value;
//   const expiryDate = document.getElementById("expiryDate").value;
//   const tax = document.getElementById("tax").value;
//   const client = document.getElementById("client_select_option").value;
//   const project = document.getElementById("project_select_option").value;
//   const taxType = document.getElementById("taxType").value;
//   const discount = document.getElementById("discount").value
//   var totalAmount = document.getElementById("totalAmount");
//   var grandTotalAmount = document.getElementById("grandTotal");
//   const total = totalAmount.innerText;
//   const GrandTotal = grandTotalAmount.innerText;

//   let details = [];
//   const items = document.getElementsByClassName("item");
//   const descriptions = document.getElementsByClassName("description");
//   const unitCosts = document.getElementsByClassName("unitCost");
//   const quantities = document.getElementsByClassName("quantity");
//   const amounts = document.getElementsByClassName("invoiceAmount");

//   for (let i = 0; i < items.length; i++) {
//     details.push({
//       item: items[i].value,
//       description: descriptions[i].value,
//       unitCost: unitCosts[i].value,
//       qty: quantities[i].value,
//       amount: amounts[i].value,
//     });
//   }

//   // const token = localStorage.getItem('authToken')
//   const response = await fetch(`${estimate_API}/update`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       email,
//       clientAddress,
//       billingAddress,
//       estimateDate,
//       expiryDate,
//       details,
//       tax,
//       total,
//       GrandTotal,
//       client,
//       project,
//       taxType,
//       discount,
//       _id,
//     }),
//   });
//   const res = await response.json();
//   console.log(res);
//   const c1 = (response.ok==true);
//     try{
//         status_popup( ((c1) ? "Estimated Updated <br> Successfully" : "Please try again later"), (c1) );
//         setTimeout(function(){
//             window.location.href = 'estimates.html'; // Adjust this path if needed
//         },(Number(document.getElementById("b1b1").innerText)*1000));
//     } catch (error){
//       status_popup( ("Please try again later"), (false) );
//     }
//   } catch (error) {
//     status_popup( ("Please try again later"), (false) );
//     console.log(error)
//   }
// });
// // update estimate API end

// // Remove Table row function globally declared for reuse
// window.removeInvoiceTableRow = function removeInvoiceTableRow(i, tag_id) {
//   console.log("this is made by me, REMOVE INVOICE TABLE ROW");

//   document.getElementById(tag_id).children[1].children[i - 1].remove();

//   Array.from(document.getElementById(tag_id).children[1].children).map(
//     (e, i) => {
//       var dummyNo1 = i + 1;
//       if (dummyNo1 != 1) {
//         e.cells[0].innerText = dummyNo1;
//         e.cells[
//           e.cells.length - 1
//         ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeInvoiceTableRow(${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
//       }
//     }
//   );
// }
// // Add Table Row function globally declared for reuse
// function addInvoiceTableRow(
//   tag_id,
//   item,
//   description,
//   unitCost,
//   qty,
//   amount,
//   cond
// ) {
//   console.log("brother, i am working here, and this is a demo. so, relax");

//   item = item == undefined ? "" : item;
//   description = description == undefined ? "" : description;
//   unitCost = unitCost == undefined ? "" : unitCost;
//   qty = qty == undefined ? "" : qty;
//   amount = amount == undefined ? "" : amount;
//   cond = cond == undefined ? false : cond;

//   if (cond) {
//     document.querySelector(".item").value = item;
//     document.querySelector(".description").value = description;
//     document.querySelector(".unitCost").value = unitCost;
//     document.querySelector(".quantity").value = qty;
//     document.querySelector(".invoiceAmount").value = amount;
//     cond = false;
//     return;
//   }

//   // console.log("this is made by me, ADD INVOICE TABLE ROW")
//   const varTableConst = document.getElementById(tag_id).children[1].children;
//   const i =
//     Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;

//   var tableBody = document.createElement("tr");
//   tableBody.innerHTML = `
//                                 <td>${i}</td> <td><input value="${item}" class="form-control item" type="text"></td> <td><input class="form-control description" value="${description}" type="text"></td> <td><input class="form-control unitCost" value="${unitCost}" type="text"></td> <td><input oninput="handleToGenerateAmount()" class="form-control quantity" value="${qty}" type="text"></td> <td><input class="form-control invoiceAmount" value="${amount}" type="text"></td> <td>
//                                 <a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeInvoiceTableRow(${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a></td>
//                             `;
//   document.querySelector(".tbodyone").appendChild(tableBody);
//   a = Array.from(document.getElementsByClassName("addProduct"));
// }

// // let totalAmount;
// // function handleToGenerateAmount(){
// //     totalAmount=0;
// //     const unitCosts = document.querySelectorAll('.unitCost');
// //     const quantities = document.querySelectorAll('.quantity');
// //     const amounts = document.querySelectorAll('.invoiceAmount');
// //     const total = document.getElementById('totalAmount');
// //     const grandTotal = document.getElementById('grandTotal');

// //     for (let i = 0; i < unitCosts.length; i++) {
// //         const unitCosting = parseFloat(unitCosts[i].value) || 0;
// //         const qty = parseFloat(quantities[i].value) || 0;
// //         amounts[i].value = (unitCosting * qty).toFixed(2); 
// //         totalAmount+=parseFloat(amounts[i].value) || 0;
// //     }
// //     total.innerText = totalAmount;
// //     grandTotal.innerText = totalAmount;
// // }
// // let grandTotalAmount;
// // function handleTaxAmountOnChange(){ 
// //     const tax = document.getElementById('tax')
// //         const total = document.getElementById('totalAmount');
// //         const grandTotal = document.getElementById('grandTotal');
// //         const discount = document.getElementById('discount');
// //         discount.setAttribute('disabled','disabled');
// //         const taxPerc = parseFloat(tax.value);
// //     let responseGrandTotal = parseFloat(estimateData.GrandTotal);
// //     let innerTextGrandTotal = document.getElementById('grandTotal').innerText;
// //     if(responseGrandTotal == innerTextGrandTotal){
// //       totalAmount = parseFloat(innerTextGrandTotal);
// //         if(taxPerc != 0){
// //             grandTotal.innerText = (parseFloat(totalAmount+ (totalAmount * (taxPerc/100)))).toFixed(2);
// //             grandTotalAmount = (parseFloat(totalAmount+ (totalAmount * (taxPerc/100)))).toFixed(2);
// //         }
// //     }
// //     else{
// //       grandTotal.innerText = (parseFloat(totalAmount+ (totalAmount * (taxPerc/100)))).toFixed(2);
// //       grandTotalAmount = (parseFloat(totalAmount+ (totalAmount * (taxPerc/100)))).toFixed(2);
// //     }
// // }

// // function handleDiscountAmountOnChange(){
// //     const discount = document.getElementById('discount');
// //     const tax = document.getElementById('tax')
// //     const grandTotal = document.getElementById('grandTotal');
// //     let discountedAmount;
// //     const discountVal = parseFloat(discount.value);
// //     if(discountVal != 0 ){
// //         discountedAmount = (grandTotalAmount * parseFloat(discountVal/100)).toFixed(2);
// //         grandTotal.innerText = grandTotalAmount - discountedAmount;
// //     }
// // }
// // const tax = document.getElementById('tax');
// // tax.addEventListener('blur',()=>{
// //     const discount = document.getElementById('discount');
// //     const tax = document.getElementById('tax')
// //     discount.removeAttribute('disabled');
// //     tax.setAttribute('disabled','disabled');
// // })
