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
import {main_hidder_function} from './gloabl_hide.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
// -------------------------------------------------------------------------
import { product_API, purchaseOrder_API, task_API } from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
let _id_param = new URLSearchParams(window.location.search).get("id");
// =================================================================================
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
    console.log("cachePurchaseOrder :- ",cachePurchaseOrder)
}
purchaseOrderListFunction();
// =======================================================
// =======================================================

async function taskViewLoad() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    try{
        const r1 = await fetch(`${task_API}/get/${_id_param}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });
        if(!r1.ok){
            throw new Error();
        }
        let r2 = await r1.json();   
    
        document.getElementById("taskName").innerText = `${r2?.title || '-'} `;
        document.getElementById("viewDescription").innerText = r2?.taskDescription || '-';
    //   =========================================================================================
        let aa1 = document.getElementById("taskTableId");
        let tbodyone = document.createElement("tbody");
        tbodyone.innerHTML = `
                            <tr>
                                <td>Project : </td>
                                <td class="text-end"><a href='project-view.html?id=${r2?.project?._id}'>${r2?.project?.projectName} (${r2?.project?.projectId})</a> </td>
                            </tr>
                            <tr>
                                <td>Assigned By : </td>
                                <td class="text-end">${r2?.assignedBy?.name} (${r2?.assignedBy?.userId})</td>
                            </tr>
                            <tr>
                                <td>Start Date : </td>
                                <td class="text-end" id="startDate">${formatDate(r2?.startDate)}</td>
                            </tr>
                            <tr>
                                <td>Complate Date : </td>
                                <td class="text-end" id="complateDate">${formatDate(r2?.complateDate)}</td>
                            </tr>
                            <tr>
                                <td>Deadline Date : </td>
                                <td class="text-end" id="deadlineDate">${formatDate(r2?.deadlineDate)}</td>
                            </tr>
                            <tr>
                                <td>Status : </td>
                                <td class="text-end">${r2?.status}</td>
                            </tr>
                            <tr>
                                <td>Work Site Addrress : </td>
                                <td class="text-end">${r2?.siteAddress}</td>
                            </tr>
                    `;
        tbodyone.id = 'tbodyone';
        aa1.appendChild(tbodyone);
    //   =========================================================================================
    
        const taskDetailsBody = document.getElementById("materialDetailsId");
        if((r2?.materialManagement).length>0){
            taskDetailsBody.innerHTML = r2.materialManagement.map((task, index) => {
                let bb1olean = (task?.material?.quantity<0);
                let bb2olean = false;
                
                let aab1 = ``;
                if(bb1olean){
                    aab1 = `<button onclick="updateMaterialAndOpenPurchasePage('${task?.material?._id}', '${task?.material?.quantity}', '${task?.material?.unit}')"  class="btn rounded add-btn ">Create Purchase Order </button>` ;
                } else {
                    bb2olean = true; ;
                }

                if(bb2olean){
                    aab1 = ``;
                    cachePurchaseOrder.forEach(e=>{
                        if(task?.material?._id==e?.material?._id){
                            aab1 = `<a href="purchase-order-view.html?id=${e?._id}" class="btn rounded add-btn ">View Purchase Invoice </a>`;

                            if(e?.invoice){
                                aab1 += `<a href="purchase-invoice-view.html?id=${e?.invoice?._id}" class="btn rounded add-btn ">View Purchase Invoice </a>`;
                            } else {
                                aab1 += `<a href="purchase-order-list.html" class="btn rounded add-btn ">Create Purchase Invoice </a>`;
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
        //   =========================================================================================
        //   =========================================================================================

        
        const subTaskDetailsId = document.getElementById("subTaskDetailsId");
        if((r2?.subTask).length>0){
            subTaskDetailsId.innerHTML = r2.subTask.map((task, index) => {
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${task.remark}</td>
                        <td>${formatDate(task.date)}</td>
                        <td>${task.workStatus}</td>
                    </tr>
                `;
            }).join("");
        }
    //   =========================================================================================
        let aa2 = document.getElementById("assigned-project-list");
        (r2?.assignedTo).map((e)=>{
            let li1 = document.createElement("li");
            li1.innerHTML = `<a href="userProfile.html?id=${e?._id}" style="color:black;" >  ${e?.ContractorName} (${e?.contractorId})</a>`;
            aa2.appendChild(li1);
        });
    
        // =========================================================================================
    
        let rd_doc = r2?.files;
        if(rd_doc.length!=0){
          document.getElementById("file_main_div").classList.remove("d-none");
          let uploaded_files = document.getElementById("uploaded_files");
          uploaded_files.classList.remove("d-none");
      
          let uploaded_files_tbodyone = document.getElementById("uploaded_files_tbodyone");
          rd_doc.map((ee,i)=>{
            let rowNew = document.createElement("tr");
            rowNew.innerHTML = `
                                <td>${i+1}</td>
                                <td>
                                    <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                                </td>
                                <td class="text-center">

                                
                                            <a  href="${ee}" target="_blank" class="btn btn-primary" ><i class="fa-regular fa-eye"></i></a>
                                            
                                </td>`;
            uploaded_files_tbodyone.appendChild(rowNew);
          })
      
        }else {
          document.getElementById("file_main_div").classList.add("d-none");
          document.getElementById("uploaded_files").classList.add("d-none");
        }
    } catch(error){
        // window.location.href = 'tasks.html';
        console.log(error)
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
    try{
        main_hidder_function();
    } catch (error){console.log(error)}
}
taskViewLoad();
// =======================================================================
// =======================================================================
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
            localStorage.setItem("_id_param_redirect_task",`task-view.html?id=${_id_param}`);
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
// =======================================================================
document.getElementById("edit_task_btn").addEventListener("click", function(){
      window.location.href = `edit-tasks.html?id=${_id_param}`;
  })
  

