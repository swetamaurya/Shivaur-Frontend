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
// -------------------------------------------------------------------------
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate } from './globalFunctions2.js';
import { product_API, project_API, purchaseOrder_API } from './apis.js';
// -------------------------------------------------------------------------
const token = localStorage.getItem('token');
let _id_param = new URLSearchParams(window.location.search).get("id");
// =======================================================
// =======================================================
let cachePurchaseOrder = [];
async function purchaseOrderListFunction() {
    try{
        const response = await fetch(`${purchaseOrder_API}/getAll`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        let r2 = await response.json();
        cachePurchaseOrder = r2?.purchases;
    } catch (error){console.log(error)}
    // console.log("cachePurchaseOrder0000  :- ",cachePurchaseOrder)
}
// =======================================================
// =======================================================


async function all_data_load_dashboard(){
  try{
      loading_shimmer();
      document.getElementById("task_page").href = `project-add-task.html?id=${_id_param}`;
      document.getElementById("edit_project_btn").href = `edit-project.html?id=${_id_param}`;
      await purchaseOrderListFunction();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  try{
    
    let API = `${project_API}/get/${_id_param}`;
    const response = await fetch(API,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // -----------------------------------------------------------------------------------
    const r1 = await response.json();

    // console.log("r1 :0 ",r1);

    const r2 = r1?.projectDetails;
    const y2 = r1?.taskStatistics;

    try{
      updateTaskStatisticsUI(y2);
    } catch(error){
      console.log(error)
    }
    try{
      const assTo = r2?.assignedTo;
      const tableData = document.getElementById("tbodyone");
      tableData.innerHTML = `
        <tr><td>Assign To (${assTo?.roles || "" }) :</td><td class="text-end"><a href='userProfile.html?id=${assTo?._id || ""}'>${assTo?.name || ""}</a></td></tr>

        <tr><td>Start Date :</td><td class="text-end">${formatDate(r2?.startDate)}</td></tr>
        <tr><td>Deadline :</td><td class="text-end">${formatDate(r2?.deadline)}</td></tr>
        <tr><td>Complition Date :</td><td class="text-end">${formatDate(r2?.complitionDate)}</td></tr>
        <tr><td>Time Extension Date :</td><td class="text-end">${formatDate(r2?.timeExtensionDate)}</td></tr>
        <tr><td>Status :</td><td class="text-end">${r2?.status}</td></tr>
        <tr><td>Priority :</td><td class="text-end">${r2?.priority}</td></tr>
        <tr><td>Price :</td><td class="text-end">₹${r2?.price}</td></tr>
        <tr><td>Discount :</td><td class="text-end">${r2?.discountPercentage}% (₹${r2?.discountRupee})</td></tr>
        <tr><td>Tax :</td><td class="text-end">${r2?.tax}% (₹${r2?.tax_rs})</td></tr>
        <tr><td>Total Price :</td><td class="text-end">₹${r2?.totalPrice}</td></tr>
        <tr><td>Total Gross Amount :</td><td class="text-end">₹${r2?.grossTotalAmount}</td></tr>
        <tr><td>Total Deducation :</td><td class="text-end">₹${r2?.deductionTotalAmount}</td></tr>
        <tr><td>Total Net Amount :</td><td class="text-end">₹${r2?.netTotalAmount}</td></tr>
      `;
    } catch(error){
      console.log(error);
    }
    try{
      const tableData2 = document.getElementById("tbodytwo");
      const r3 = r2?.clientName;
      tableData2.innerHTML = `
        <tr><td>Name :</td><td class="text-end"><a href='clientProfile.html?id=${r3?._id}'>${r3?.name}</a></td></tr>
        <tr><td>ID :</td><td class="text-end"><a href='clientProfile.html?id=${r3?._id}'>${r3?.userId}</a></td></tr>
        <tr><td>Email :</td><td class="text-end"><a href='clientProfile.html?id=${r3?._id}'>${r3?.email}</a></td></tr>
      `;
    } catch(error){
      console.log(error);
    }
    
    try{
      const tableData = document.getElementById("tbodyfive");
      tableData.innerHTML = `
        <tr><td><b>Total Gross Amount :</b></td><td class="text-end"><b>₹${r2?.grossTotalAmount}</b></td></tr>
        <tr><td><b>Total Deduction Amount  :</b></td><td class="text-end"><b>₹${r2?.deductionTotalAmount}</b></td></tr>
        <tr><td><b>Total Net Amount :</b></td><td class="text-end"><b>₹${r2?.netTotalAmount}</b></td></tr>
      `;
    } catch(error){
      console.log(error)
    }
    try{
      const tableData = document.getElementById("tbodyfour");
      tableData.innerHTML = `
        <tr><td><b>Deduction Amount  :</b></td><td class="text-end"><b>₹${r2?.deductionTotalAmount}</b></td></tr>
        <tr><td>Total Income Tax :</td><td class="text-end">₹${r2?.income_tax_totalDeduction}</td></tr>
        <tr><td>Total GST :</td><td class="text-end">₹${r2?.GST_totalDeduction}</td></tr>
        <tr><td>Total Royalty :</td><td class="text-end">₹${r2?.royalty_totalDeduction}</td></tr>
        <tr><td>Total Late Deduction :</td><td class="text-end">₹${r2?.late_totalDeduction}</td></tr>
        <tr><td>Total Security Deposit :</td><td class="text-end">₹${r2?.security_deposit_totalDeduction}</td></tr>
        <tr><td>Total Labour Cess :</td><td class="text-end">₹${r2?.labourCess_totalDeduction}</td></tr>
        <tr><td>Total Any Other Deduction :</td><td class="text-end">₹${r2?.any_other_totalDeduction}</td></tr>
      `;
    } catch(error){
      console.log(error)
    }
    try{
      const projectName = document.getElementById("project-name");
      const description = document.getElementById("description");
      
      projectName.innerText = `${r2.projectName} (${r2.projectId})`;
      description.innerText = r2.description || "-";
    } catch(error){
      console.log(error)
    }

    // ================== document files ==============
    try{
      let f1 = r2?.document;
      if(f1.length>0){
        document.getElementById("uploaded_files").classList.remove("d-none");
        let a10 = document.getElementById("uploaded_files_tbodyone");
        f1.map((ee,i)=>{
          let tr1 = document.createElement("tr");
          tr1.innerHTML = `<td>${i+1}</td>
                            <td>
                                <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                            </td>
                            
            <td class="text-center">
              <a href="${ee}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-eye"></i></a>
            </td>`;
          a10.appendChild(tr1);                        
        }) 
      } else {
        document.getElementById("uploaded_files").classList.add("d-none");
      }
    } catch(error){
      console.log(error)
    }
    
    // ==================== md files ========================
    try{
      let f1 = r2?.paymentDetails[0]?.mbfile;
      if(f1.length>0){
        document.getElementById("md_uploaded_files").classList.remove("d-none");
        let a10 = document.getElementById("md_uploaded_files_tbodyone");
        f1.map((ee,i)=>{
          let tr1 = document.createElement("tr");
          tr1.innerHTML = `<td>${i+1}</td>
                            <td>
                                <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                            </td>
                            
            <td class="text-center">
              <a href="${ee}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-eye"></i></a>
            </td>`;
          a10.appendChild(tr1);                        
        }) 
      } else {
        document.getElementById("md_uploaded_files").classList.add("d-none");
      }
    } catch(error){
      console.log(error)
    }
    
    // ==================== sd files ========================
    try{
      let f1 = r2?.sdDetails[0]?.sdFiles;
      if(f1.length>0){
        document.getElementById("sd_uploaded_files").classList.remove("d-none");
        let a10 = document.getElementById("sd_uploaded_files_tbodyone");
        f1.map((ee,i)=>{
          let tr1 = document.createElement("tr");
          tr1.innerHTML = `<td>${i+1}</td>
                            <td>
                                <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                            </td>
                            
            <td class="text-center">
              <a href="${ee}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-eye"></i></a>
            </td>`;
          a10.appendChild(tr1);                        
        }) 
      } else {
        document.getElementById("sd_uploaded_files").classList.add("d-none");
      }
    } catch(error){
      console.log(error)
    }


    try{
      const taskDetailsBody = document.getElementById("task_details_tbodyone");
      if((r2?.tasks).length>0){
        taskDetailsBody.innerHTML = r2.tasks.map((task, index) => {
          const contractorNames = task.assignedTo.map(contractor => contractor.ContractorName).join(", ") || "-";
          return `
            <tr>
              <td>${index + 1}</td>
              <td><a href="task-view.html?id=${task._id}">${task.title}</a></td>
              <td>${contractorNames}</td>
              <td>${task.status}</td>
              <td>${formatDate(task.startDate)}</td>
              <td class="text-center">
                <a href="task-view.html?id=${task._id}" class="btn btn-primary"><i class="fa-solid fa-eye"></i></a>
              </td>
            </tr>
          `;
        }).join("");
      } else {
        document.querySelectorAll(".hide_if_data_null_task").forEach(e=> e.classList.add("d-none"));
      }
    } catch(error){
      console.log(error);
    }
    try{
      const loop = r2?.paymentDetails;

      const z1 = document.getElementById("recieptDetailsId");
      const accordionContainer = document.getElementById("accordionWrapper"); // Ensure a container exists

      loop.forEach((e, i) => {
        const accordionWrapper = document.createElement("div");
        accordionWrapper.classList.add("col-sm-6", "mb-3");
      
        accordionWrapper.innerHTML = `
          <div class="accordion" id="accordion${i}">
            <div class="accordion-item">
              <h2 class="accordion-header" id="heading${i}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                  Recipt ${i + 1}
                </button>
              </h2>
              <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordion${i}">
                <div class="accordion-body">
                  <table class="table table-striped table-border mb-0">
                    <tbody>
                      <tr><td>MB Number :</td><td class="text-end">${e?.mbNumber}</td></tr>
                      <tr><td>MB Date :</td><td class="text-end">${formatDate(e?.complitionDate)}</td></tr>
                      <tr><td>Payment Date :</td><td class="text-end">${formatDate(e?.paymentDate)}</td></tr>
                      <tr><td>Gross Amount :</td><td class="text-end">₹${e?.grossAmount || 0}</td></tr>
                      <tr><td>Income Tax :</td><td class="text-end">₹${e?.incomeTaxDeduction || 0}</td></tr>
                      <tr><td>GST :</td><td class="text-end">₹${e?.GSTDeduction || 0}</td></tr>
                      <tr><td>Royalty :</td><td class="text-end">₹${e?.royaltyDeduction || 0}</td></tr>
                      <tr><td>Late Deduction :</td><td class="text-end">₹${e?.letDeduction || 0}</td></tr>
                      <tr><td>Security Deposit :</td><td class="text-end">₹${e?.securityDepositDeduction || 0}</td></tr>
                      <tr><td>Labour Cess :</td><td class="text-end">₹${e?.labourCess_totalDeduction || 0}</td></tr>
                      <tr><td>Any Other Deduction :</td><td class="text-end">₹${e?.otherDeduction || 0}</td></tr>
                      <tr><td>Net Amount :</td><td class="text-end">₹${e?.netAmount || 0}</td></tr>
                      <tr><td>Status :</td><td class="text-end">${e?.status}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        `;
      
        accordionContainer.appendChild(accordionWrapper);
      });
      

      document.querySelector(".grossTotalAmountSpan").innerText = `₹${r2?.grossTotalAmount}`;
      document.querySelector(".deductionTotalAmountSpan").innerText = `₹${r2?.deductionTotalAmount}`;
      document.querySelector(".netTotalAmountSpan").innerText = `₹${r2?.netTotalAmount}`;
    } catch(error){
      console.log(error)
    }
    // ==============================================================================
    try{
      // const loop = r2?.sdDetails;
      // const z1 = document.getElementById("sdtDetailsId");
      // loop.forEach((e,i)=>{
      //   const zz2 = document.createElement("div");
      //   zz2.classList.add("col-xl-6");
      //   zz2.innerHTML = `
      //       <div class="card">
      //         <div class="card-body rounded-top  ps-0 pe-0 pb-0 pt-3" style="background-color: #373737">
      //           <h6 class="card-title text-white mb-3 ps-2" >SD Recipt ${i+1}</h6>
      //           <table class="table table-striped table-border mb-0 ">
      //             <tbody id="" class="">
      //               <tr><td>Amount :</td><td class="text-end">₹${e?.amount || 0}</td></tr>
      //               <tr><td>Amount :</td><td class="text-end">₹${e?.amountStatus || 0}</td></tr>
      //               <tr><td>Remark :</td><td class="text-end">${e?.remark}</td></tr>
      //             </tbody>
      //           </table>
      //         </div>
      //       </div>
      //   `;
      //   z1.appendChild(zz2);
      // });

      
      const taskDetailsBody = document.getElementById("sdtDetailsId");
      if((r2?.sdDetails).length>0){
        taskDetailsBody.innerHTML = r2.sdDetails.map((task, index) => {
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${task.amount}</td>
              <td>${task.amountStatus}</td>
              <td>${task.remark}</td>
            </tr>
          `;
        }).join("");
      }

    } catch(error){
      console.log(error)
    }
    // ==============================================================================
    try{
      // const loop = r2?.materialDetails;
      // const z1 = document.getElementById("materialDetailsId");
      // loop.forEach((e,i)=>{
      //   const zz2 = document.createElement("div");
      //   zz2.classList.add("col-xl-6");
      //   zz2.innerHTML = `
      //       <div class="card">
      //         <div class="card-body rounded-top  ps-0 pe-0 pb-0 pt-3" style="background-color: #373737">
      //           <h6 class="card-title text-white mb-3 ps-2" >MD Recipt ${i+1}</h6>
      //           <table class="table table-striped table-border mb-0 ">
      //             <tbody id="" class="">
      //               <tr><td>Material :</td><td class="text-end">₹${e?.material || 0}</td></tr>
      //               <tr><td>Specs :</td><td class="text-end">₹${e?.specs || 0}</td></tr>
      //               <tr><td>Quantity :</td><td class="text-end">${e?.quantity}</td></tr>
      //               <tr><td>Unit :</td><td class="text-end">${e?.unit}</td></tr>
      //             </tbody>
      //           </table>
      //         </div>
      //       </div>
      //   `;
      //   z1.appendChild(zz2);
      // });

      

      // console.log("cachePurchaseOrder :- ",cachePurchaseOrder)
      // console.log("r2.materialDetails :- ",r2.materialDetails)
    
      const taskDetailsBody = document.getElementById("materialDetailsId");
      if((r2?.materialDetails).length>0){
          taskDetailsBody.innerHTML = r2.materialDetails.map((task, index) => {
              let bb1olean = (task?.material?.quantity<=-1);
              let bb2olean = false;
              let aab1 = ``;
              if(bb1olean){
                // console.log("bhai bhai")
                aab1 = `<a title="Create Purchase Order" onclick="updateMaterialAndOpenPurchasePage('${task?.material?._id}', '${task?.material?.quantity}', '${task?.material?.unit}')"  ><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#cb2c2c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
  <path d="M8 2v12M2 8h12"/>
</svg></a>` ;
              } else {
                // console.log("bhen bhen")
                bb2olean = true; ;
              }

              if(bb2olean){
                // console.log("bro aab1 :- ",cachePurchaseOrder)
                  aab1 = ``;
                  cachePurchaseOrder.forEach(e=>{
                    // console.log("brothe :- ",task?.material?._id==e?.material?._id)
                      if(task?.material?._id==e?.material?._id){
                        
                          // console.log("bro aab2 :- ",aab1)

                          aab1 = `<a href="purchase-order-view.html?id=${e?._id} "" title="View Purchase Order "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#cb2c2c" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"></path>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"></path>
</svg> </a>`;

                          if(e?.invoice){
                              aab1 += `<a href="purchase-invoice-view.html?id=${e?.invoice?._id}" "title="View Purchase Order "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#cb2c2c" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"></path>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"></path>
</svg> </a>`;
                          } else {
                              aab1 += `<a href="purchase-order-list.html" title="Create Purchase Order "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#cb2c2c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
  <path d="M8 2v12M2 8h12"/>
</svg>
</a>`;
                          }
                      }
                  });
              }

              // console.log("aab :- ",aab1)
              
              return `
                  <tr>
                      <td>${index + 1}</td>
                      <td class='remark-three-dot-css-design' title="${task?.material?.material} (${task?.material?.productId})" > ${task?.material?.material} (${task?.material?.productId})</td>
                      <td>${task.specs}</td>
                      <td>${task.quantity}</td>
                      <td>${task.unit}</td>
                      <td >
                          <div>
                              ${aab1}
                          </div>
                      </td>
                  </tr>
              `;
          }).join("");
      }

    } catch(error){
      console.log(error)
    }
    // ==============================================================================
    try{
      
      const taskDetailsBody = document.getElementById("taskMaterialDetailsId");
      if((r2?.tasks).length>0){
        for(let i = 0; i<r2?.tasks.length; i++){
          let task = r2?.tasks[i]?.materialManagement;

          // console.log("task br :- ",task)

          if(task.length>0){
            taskDetailsBody.innerHTML += task.map((task, index) => {
              let bb1olean = (task?.material?.quantity<=1);
              let bb2olean = false;

              let aab1 = ``;
              if(bb1olean){
                aab1 = `<a onclick="updateMaterialAndOpenPurchasePage('${task?.material?._id}', '${task?.material?.quantity}', '${task?.material?.unit}')" title="Create Purchase Order"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#cb2c2c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
  <path d="M8 2v12M2 8h12"/>
</svg></a>` ;
                // console.log("bhai bhai")
              } else {
                // console.log("bhen bhen")
                  bb2olean = true; ;
              }

              if(bb2olean){
                  aab1 = ``;
                  // console.log("BRO :- ",cachePurchaseOrder)

                  cachePurchaseOrder.forEach(e=>{
                      if(task?.material?._id==e?.material?._id){
                          aab1 = `<a href="purchase-order-view.html?id=${e?._id}" title="View Purcahse Invoice"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#cb2c2c" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"></path>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"></path>
</svg>  </a>`;

                          if(e?.invoice){
                              aab1 += `<a href="purchase-invoice-view.html?id=${e?.invoice?._id}" title="View Purcahse Invoice"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#cb2c2c" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"></path>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"></path>
</svg>  </a>`;
                          } else {
                              aab1 += `<a href="purchase-order-list.html"title="Create Purchase Invoice "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#cb2c2c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
  <path d="M8 2v12M2 8h12"/>
</svg></a>`;
                          }
                      }
                  });
              }


              return `
                    <tr>
                        <td>${index + 1}</td>
                        <td class='remark-three-dot-css-design' title="${task?.material?.material} (${task?.material?.productId})" > ${task?.material?.material} (${task?.material?.productId})</td>
                        <td>${task.specs}</td>
                        <td>${task.quantity}</td>
                        <td>${task.unit}</td>
                        <td >
                            <div>
                                ${aab1}
                            </div>
                        </td>
                    </tr>
              `;
            }).join("");
          }

        }

      }

    } catch(error){
      console.log(error)
    }


  } catch(error){
    console.log("error :- ",error);
  }
  
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}
}
// =======================================================================
window.updateMaterialAndOpenPurchasePage = async function updateMaterialAndOpenPurchasePage(_id, cQuntity,cUnit){
    try{
        const formData = new FormData();
        formData.append("_id",_id);
        formData.append("quantity", 0);

        const response = await fetch(`${product_API}/update`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        
        setTimeout(function(){
            localStorage.setItem("_id_param_redirect_task",`project-view.html?id=${_id_param}`);
            localStorage.setItem("_id_Project_Material_id",_id);
            localStorage.setItem("_id_Project_Material_quantity",(  Math.sqrt(Math.pow(cQuntity, 2)) ))
            localStorage.setItem("_id_Project_Material_unit",cUnit)
            
            window.location.href = 'add-purchase-order.html';
        }, 100);

    } catch (error){
        console.log(error)
    }
}

// =======================================================================
// =======================================================================

// Function to update the UI with task statistics
function updateTaskStatisticsUI(data) {
  const totalTasks = data.totalTasks || 0;
  const taskCounts = data.taskCounts || {};

  // Update total and overdue tasks
  const totalTasksCountEl = document.getElementById("totalTasksCount");
  const overdueTasksCountEl = document.getElementById("overdueTasksCount");

  if (totalTasksCountEl) {
    totalTasksCountEl.innerText = totalTasks;
  }

  if (overdueTasksCountEl) {
    overdueTasksCountEl.innerText = data.overdueTasks || 0;
  }

  // Define colors for task statuses
  const statusColors = {
    Completed: { color: "text-purple", bgColor: "bg-purple" },
    "In-Progress": { color: "text-warning", bgColor: "bg-warning" },
    Hold: { color: "text-success", bgColor: "bg-success" },
    Pending: { color: "text-danger", bgColor: "bg-danger" },
    Active: { color: "text-info", bgColor: "bg-info" },
    Inactive: { color: "text-secondary", bgColor: "bg-secondary" },
    "Ready to Start": { color: "text-primary", bgColor: "bg-primary" },
    Closed: { color: "text-black", bgColor: "bg-dark" },
  };

  const progressContainer = document.querySelector(".progress");
  const breakdownContainer = document.getElementById("taskStatisticsBreakdown");

  // Ensure the elements exist before modifying them
  if (!progressContainer || !breakdownContainer) {
    console.error("Missing required elements: .progress or #taskStatisticsBreakdown");
    return;
  }

  // Clear previous content
  progressContainer.innerHTML = "";
  breakdownContainer.innerHTML = "";

  // Add progress bars and breakdown for each task status
  Object.entries(taskCounts).forEach(([status, count]) => {
    const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(2) : 0;
    const statusConfig = statusColors[status];

    // Create progress bar
    const progressBar = document.createElement("div");
    progressBar.className = `progress-bar ${statusConfig?.bgColor || "bg-secondary"}`;
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = `${percentage}%`;
    progressContainer.appendChild(progressBar);
    progressBar.setAttribute("data-bs-toggle", "tooltip");
    progressBar.setAttribute("data-bs-placement", "top");
    progressBar.setAttribute("title", `${status}: ${count} tasks`);
    progressContainer.appendChild(progressBar);


    // Initialize tooltips (Bootstrap-specific)
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipElements.forEach((el) => new bootstrap.Tooltip(el));
    }

    // Create task status breakdown
    const breakdown = document.createElement("p");
    breakdown.innerHTML = `
      <i class="fa-regular fa-circle-dot ${statusConfig?.color || "text-secondary"} me-2"></i>
      ${status} Tasks
      <span class="float-end">${count} (${percentage}%)</span>
    `;
    breakdownContainer.appendChild(breakdown);
  });
}

document.getElementById("taskStatisticsId").addEventListener("submit", async function (event) {
  event.preventDefault();
  try{
      loading_shimmer();
      document.getElementById("task_page").href = `project-add-task.html?id=${_id_param}`;
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  try{
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    // Prepare query parameters for the API call
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);

    // -----------------------------------------------------------------------------------
    let API = `${project_API}/get/${_id_param}?${queryParams.toString()}`;
    const response = await fetch(API,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // -----------------------------------------------------------------------------------
    const r1 = await response.json();

    const r2 = r1?.projectDetails;
    const y2 = r1?.taskStatistics;

    try{
      updateTaskStatisticsUI(y2);
    } catch(error){
      console.log(error)
    }
    try{
      const taskDetailsBody = document.getElementById("task_details_tbodyone");
      // Update tasks
      taskDetailsBody.innerHTML = r2.tasks.map((task, index) => {
        const contractorNames = task.assignedTo.map(contractor => contractor.ContractorName).join(", ") || "N/A";
        return `
          <tr>
            <td>${index + 1}</td>
            <td><a href="task-view.html?id=${task._id}">${task.title}</a></td>
            <td>${contractorNames}</td>
            <td>${task.status}</td>
            <td>${formatDate(task.startDate)}</td>
            <td class="text-center">
              <a href="task-view.html?id=${task._id}" class="btn btn-primary"><i class="fa-solid fa-eye"></i></a>
            </td>
          </tr>
        `;
      }).join("");
    } catch(error){
      console.log(error);
    }
  } catch(error){
    console.log(error)
  }  
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}  
})
 

// // Function to update the UI with subtask statistics
function updateSubTaskStatisticsUI(data) {
  const totalSubTasks = data.totalSubTasks || 0;
  const subTaskStatusCounts = data.subTaskStatusCounts || {};

  // Update total and overdue tasks
  const totalTasksCountEl = document.getElementById("totalSubTasksCount");
  const overdueTasksCountEl = document.getElementById("overdueSubTasksCount");

  if (totalTasksCountEl) {
    totalTasksCountEl.innerText = totalSubTasks;
  }

  if (overdueTasksCountEl) {
    overdueTasksCountEl.innerText = data.overdueTasks || 0;
  }

  // Define colors for task statuses
  const statusColors = {
    Completed: { color: "text-purple", bgColor: "bg-purple" },
    "In-Progress": { color: "text-warning", bgColor: "bg-warning" },
     "Ready to Start": { color: "text-primary", bgColor: "bg-primary" },
   };

  const progressContainer = document.querySelector(".progress");
  const breakdownContainer = document.getElementById("subTaskStatisticsBreakdown");

  // Ensure the elements exist before modifying them
  if (!progressContainer || !breakdownContainer) {
    console.error("Missing required elements: .progress or #subTaskStatisticsBreakdown");
    return;
  }

  // Clear previous content
  progressContainer.innerHTML = "";
  breakdownContainer.innerHTML = "";

  // Add progress bars and breakdown for each task status
  Object.entries(subTaskStatusCounts).forEach(([status, count]) => {
    const percentage = totalSubTasks > 0 ? ((count / totalSubTasks) * 100).toFixed(2) : 0;
    const statusConfig = statusColors[status];

    // Create progress bar
    const progressBar = document.createElement("div");
    progressBar.className = `progress-bar ${statusConfig?.bgColor || "bg-secondary"}`;
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = `${percentage}%`;
    progressContainer.appendChild(progressBar);
    progressBar.setAttribute("data-bs-toggle", "tooltip");
    progressBar.setAttribute("data-bs-placement", "top");
    progressBar.setAttribute("title", `${status}: ${count} tasks`);
    progressContainer.appendChild(progressBar);


    // Initialize tooltips (Bootstrap-specific)
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipElements.forEach((el) => new bootstrap.Tooltip(el));
    }

    // Create task status breakdown
    const breakdown = document.createElement("p");
    breakdown.innerHTML = `
      <i class="fa-regular fa-circle-dot ${statusConfig?.color || "text-secondary"} me-2"></i>
      ${status} Tasks
      <span class="float-end">${count} (${percentage}%)</span>
    `;
    breakdownContainer.appendChild(breakdown);
  });
}

document.getElementById("subTaskStatisticsId").addEventListener("submit", async function (event) {
  event.preventDefault();
  try{
      loading_shimmer();
      document.getElementById("task_page").href = `project-add-task.html?id=${_id_param}`;
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  try{
    const fromDate = document.getElementById("subTaskfromDate").value;
    const toDate = document.getElementById("subTasktoDate").value;
    // Prepare query parameters for the API call
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("subTaskfromDate", fromDate);
    if (toDate) queryParams.append("subTasktoDate", toDate);

    // -----------------------------------------------------------------------------------
    let API = `${project_API}/get/${_id_param}?${queryParams.toString()}`;
    const response = await fetch(API,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // -----------------------------------------------------------------------------------
    const r1 = await response.json();

    const r2 = r1?.projectDetails;
    const y2 = r1?.taskStatistics;

    try{
      updateSubTaskStatisticsUI(y2);
    } catch(error){
      console.log(error)
    }
   
  } catch(error){
    console.log(error)
  }  
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}  
})


all_data_load_dashboard();





 
 