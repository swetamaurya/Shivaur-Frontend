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
import {main_hidder_function} from './gloabl_hide.js';
import { loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
import {product_API} from './apis.js';

const token = localStorage.getItem('token');

// =======================================================
let _id_param = new URLSearchParams(window.location.search).get("id");
// =======================================================
taskViewLoad();
async function taskViewLoad() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    try{
        const r1 = await fetch(`${product_API}/get/${_id_param}`, {
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

        console.log(r2);

        try{
                
            document.getElementById("taskName").innerText = `${r2?.material || '-'} (${r2?.productId})`;
            document.getElementById("viewDescription").innerText = r2?.description || '-';
        } catch(error){console.log(error)}
    //   =========================================================================================
        try{
            let aa1 = document.getElementById("taskTableId");
            let tbodyone = document.createElement("tbody");
            tbodyone.innerHTML = `
                                <tr>
                                    <td>Category : </td>
                                    <td class="text-end">${r2?.category?.category}</td>
                                </tr>
                                <tr>
                                    <td>Purchase Date : </td>
                                    <td class="text-end">${formatDate(r2?.purchaseDate)}</td>
                                </tr>
                                <tr>
                                    <td>Supplier : </td>
                                    <td class="text-end">${r2?.vendor?.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>Status : </td>
                                    <td class="text-end">${r2?.status}</td>
                                </tr>
                                <tr>
                                    <td>Price : </td>
                                    <td class="text-end">₹${r2?.price}</td>
                                </tr>
                                <tr>
                                    <td>Quantity : </td>
                                    <td class="text-end">${r2?.quantity}</td>
                                </tr>
                                <tr>
                                    <td>Total Price : </td>
                                    <td class="text-end">₹${r2?.totalPrice}</td>
                                </tr>
                                 <tr>
                                    <td>Unit : </td>
                                    <td class="text-end">${r2?.unit}</td>
                                </tr>`;
            tbodyone.id = 'tbodyone';
            aa1.appendChild(tbodyone);
        } catch (error){console.log(error)}
    //   =========================================================================================
            // try{
            //     let aa2 = document.getElementById("assigned-project-list");
            //     (r2?.assignedTo).map((e)=>{
            //         let li1 = document.createElement("li");
            //         li1.innerText = ` - ${e?.name} (${e?.userId})`;
            //         aa2.appendChild(li1);
            //     });    
            // } catch(error){console.log(error)}
        // =========================================================================================
        try{
            let rd_doc = r2?.images;
            if(rd_doc.length!=0){
            document.getElementById("file_main_div").classList.remove("d-none");
            let uploaded_files = document.getElementById("uploaded_files");
            uploaded_files.classList.remove("d-none");
        
            let uploaded_files_tbodyone = document.getElementById("uploaded_files_tbodyone");
            rd_doc.map((ee,i)=>{
                let rowNew = document.createElement("tr");
                rowNew.innerHTML = `<td>${i+1}</td>
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
        } catch(error){console.log(error)}
    } catch(error){
        window.location.href = 'product-list.html';
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
    try{
        main_hidder_function();
    } catch (error){console.log(error)}
}



document.getElementById("edit_task_btn").addEventListener("click",()=>{
      window.location.href = `edit-product.html?id=${_id_param}`;
  })
  

 

