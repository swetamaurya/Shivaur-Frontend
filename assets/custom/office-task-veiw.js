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
import {status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import {main_hidder_function} from './gloabl_hide.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
// -------------------------------------------------------------------------
import {  office_task_API } from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
let _id_param = new URLSearchParams(window.location.search).get("id");
// =================================================================================
// =======================================================

taskViewLoad();
async function taskViewLoad() {
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    // -----------------------------------------------------------------------------------
    try{
        const r1 = await fetch(`${ office_task_API}/get/${_id_param}`, {
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
                            
                        </tr>`
        tbodyone.id = 'tbodyone';
        aa1.appendChild(tbodyone);
    //   =========================================================================================
        let aa2 = document.getElementById("assigned-project-list");
        (r2?.assignedTo).map((e)=>{
            let li1 = document.createElement("li");
            li1.innerHTML = `<a href="userProfile.html?id=${e?._id}" style="color:black;" >  ${e?.name} (${e?.userId})</a>`;
            aa2.appendChild(li1);
        });
    
        // =========================================================================================
    
        let rd_doc = r2?.files || [];
if (Array.isArray(rd_doc) && rd_doc.length > 0) {
  console.log("Files in rd_doc:", rd_doc); // Debug log
  document.getElementById("file_main_div").classList.remove("d-none");
  let uploaded_files = document.getElementById("uploaded_files");
  uploaded_files.classList.remove("d-none");

  let uploaded_files_tbodyone = document.getElementById("uploaded_files_tbodyone");
  rd_doc.forEach((ee, i) => {
    console.log("Processing file:", ee); // Debug log
    let rowNew = document.createElement("tr");
    rowNew.innerHTML = `
      <td>${i + 1}</td>
      <td>
        <input class="form-control" type="name" value="File ${i + 1}" disabled id="paymentDate">
      </td>
      <td class="text-center">
        <div class="dropdown dropdown-action">
          <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="material-icons">more_vert</i>
          </a>
          <div class="dropdown-menu dropdown-menu-right">
            <a href="${ee}" target="_blank" class="dropdown-item"><i class="fa-regular fa-eye"></i> View</a>
            <a onclick="deleteContractorFile('${ee}', ${i})" class="dropdown-item"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
          </div>
        </div>
      </td>`;
    uploaded_files_tbodyone.appendChild(rowNew);
  });
} else {
  console.log("No files found in rd_doc."); // Debug log
  document.getElementById("file_main_div").classList.add("d-none");
  document.getElementById("uploaded_files").classList.add("d-none");
}

    } catch(error){
        window.location.href = 'office-tasks.html';
    }
    // ----------------------------------------------------------------------------------------------------
    try{
        remove_loading_shimmer();
    } catch(error){console.log(error)}
    try{
        main_hidder_function();
    } catch (error){console.log(error)}
}


window.deleteContractorFile = async function deleteContractorFile(fileName, index) {
    // Get the element for the file and the ID parameter
    let deleteFile = document.getElementById(`contracterDeletionFile${index}`);
    const _id = new URLSearchParams(window.location.search).get("id");

    // Check if _id is valid
    if (!_id || _id === "null") {
        console.error("Invalid or missing task ID.");
        status_popup("Error: Invalid task ID.", false);
        return;
    }

    console.log("task ID:", _id); // Debugging log

    // Show loading shimmer
    try {
        loading_shimmer();
    } catch (error) {
        console.log("Error while showing loading shimmer:", error);
    }

    // API call to delete the file
    const apiUrl = `${office_task_API}/deleteFile`;
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                _id,
                fileName,
            }),
        });

        const res = await response.json();

        // Handle API response
        if (response.ok) {
            if (deleteFile) {
                deleteFile.remove(); // Remove the file from the DOM
                console.log(`File element with ID 'contracterDeletionFile${index}' removed successfully.`);
            } else {
                console.warn(`Element with ID 'contracterDeletionFile${index}' not found.`);
            }

            // Show success message
            status_popup("File Deleted <br> Successfully!", true);

            // Redirect after a delay
            const delay = Number(document.getElementById("b1b1").innerText) * 1000 || 6000; // Default to 3 seconds
            setTimeout(() => {
                location.reload();
            }, delay);
        } else {
            console.error("API Error Response:", res);
            status_popup("Please try <br> again later", false);
        }
    } catch (error) {
        console.error("Error during API call:", error);
        status_popup("Please try <br> again later", false);
    } finally {
        // Always remove loading shimmer
        try {
            remove_loading_shimmer();
        } catch (error) {
            console.log("Error while removing loading shimmer:", error);
        }
    }
};



document.getElementById("edit_task_btn").addEventListener("click", function(){
      window.location.href = `office-edit-tasks.html?id=${_id_param}`;
  })
  

