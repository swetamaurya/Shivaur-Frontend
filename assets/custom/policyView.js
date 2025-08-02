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
let role = localStorage.getItem('User_role')


import {policy_API} from './apis.js';

const token = localStorage.getItem('token');

// =======================================================
//Function to print the dates
let currentDate;
let updateDate
function generateDate(currDate,updDate){
let b = currDate.split('T');
let date = b[0].split('-')
currentDate = `${date[2]}-${date[1]}-${date[0]}`

let upDate = updDate.split('T');
let updatedDate = upDate[0].split('-')
updateDate = `${updatedDate[2]}-${updatedDate[1]}-${updatedDate[0]}`
}
// =======================================================
projectViewLoad();
async function projectViewLoad() {
        
    let _id_param = new URLSearchParams(window.location.search).get("id");
    const response = await fetch(`${policy_API}/${_id_param}`, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
    });
    let res = await response.json();

    console.log(res);
    let createdAt = res?.createdAt? res?.createdAt : new Date()
    let updatedAt = res?.updatedAt? res?.updatedAt : new Date()
    generateDate(createdAt,updatedAt)

    // let createdDate = res.createdAtFormatted.split(' ')[0]
    // let createdTime = res.createdAtFormatted.split(' ')[1]
    // let created = res.createdAtFormatted.split(' ')[2]
    // let UpdatedDate = res.updatedAtFormatted.split(' ')[0]
    // let UpdatedTime = res.updatedAtFormatted.split(' ')[1]
    // let Updated = res.updatedAtFormatted.split(' ')[2]
    // console.log(createdDate,createdTime,created)


    document.getElementById("PolicyName").innerText = res.policyName || '-';
    document.getElementById("policyDescription").innerText = res.description || '-';
//   =========================================================================================
    let policyTableData = document.getElementById("policyTableData");
    let tbodyone = document.createElement("tbody");
    tbodyone.innerHTML = `
                        <tr>
                            <td>Name : </td>
                            <td class="text-end">${role}</td>
                        </tr>
                        <tr>
                            <td>Created At : </td>
                            <td class="text-end">${currentDate}</td>
                        </tr>
                        <tr>
                            <td>Upadted At : </td>
                            <td class="text-end">${updateDate}</td>
                        </tr>`;
    tbodyone.id = 'tbodyone';
    policyTableData.appendChild(tbodyone);
//   =========================================================================================
    let policyFile = res?.files;
    if(policyFile.length!=0){
      document.getElementById("file_main_div").classList.remove("d-none");
      let uploaded_files = document.getElementById("uploaded_files");
      uploaded_files.classList.remove("d-none");
  
      let uploaded_policy_files_tbodyone = document.getElementById("uploaded_policy_files_tbodyone");
      policyFile.map((ee,i)=>{
        let rowNew = document.createElement("tr");
        rowNew.innerHTML = `
                            <td>${i+1}</td>
                            <td>
                                <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                            </td>
                            <td class="text-center">
                                        
                              <div class="dropdown dropdown-action">
                                  <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i
                                  class="material-icons">more_vert</i></a>
                                  <div class="dropdown-menu dropdown-menu-right">
                                      <a  href="${ee}" target="_blank" class="dropdown-item" ><i class="fa-regular fa-eye"></i> View</a>
                                  </div>
                              </div>
                            </td>`;
        uploaded_policy_files_tbodyone.appendChild(rowNew);
      })
  
    }else {
      document.getElementById("file_main_div").classList.add("d-none");
      document.getElementById("uploaded_files").classList.add("d-none");
    }
}



// document.getElementById("edit_task_btn").addEventListener("click", function(){
//     let _id_param = new URLSearchParams(window.location.search).get("id");
//       // viewProjectDetails(_id_param);
//       window.location.href = `/front-end/edit-tasks.html?id=${_id_param}`;
//   })
  

