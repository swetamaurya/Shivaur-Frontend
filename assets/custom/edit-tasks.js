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
import {status_popup, loading_shimmer, remove_loading_shimmer} from './globalFunctions1.js';
import {task_API, user_API, project_API,contractor_API,product_API} from './apis.js';
// -------------------------------------------------------------------------
const token = localStorage.getItem('token');
// =======================================================
    let _id_param = new URLSearchParams(window.location.search).get("id");  
// =======================================================
let cacheAPIMaterialData = [];
let cacheAPIMaterialHTML;
async function materilaCacheApiHit() {
  
  try {
    const response = await fetch(`${product_API}/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const res = await response.json();
    cacheAPIMaterialData = res?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  try{
    let aaab1 = cacheAPIMaterialData.map((e,i)=>{
      return `<option value='${e?._id}' >${e?.material} (${e?.productId})</option>`;
    }).join("");

    cacheAPIMaterialHTML = `
                      <select class='form-control dymcMaterialQuantity' >
                        <option selected='' disabled='' >Select Material</option>
                        ${aaab1}
                      </select>
    `;

    document.getElementById("selectMaterialOneTime").innerHTML = cacheAPIMaterialHTML;
    startBro();

  } catch(error){
    console.log(error)
  }
}
materilaCacheApiHit();



function getSingleMaterialListCacheFunction(id) {
  return cacheAPIMaterialData.find(item => item._id === id);
}
// =======================================================
// getting the project Id 
// let pId = new URLSearchParams(window.location.search).get("id");
// ===============================================================================================================
const newOption = document.createElement("option");
newOption.value = localStorage.getItem('User_id');
newOption.text = localStorage.getItem('User_name');
const select = document.getElementById("assigned_by_select_option");
select.add(newOption);
select.value = newOption.value;
// ===============================================================================================================
// =======================================================


async function dropdownForAddTask(){
  // =========================================================
  const r1 = await fetch(`${project_API}/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });
  const r2 = await r1.json();
  const project_select_option = document.getElementById("project_select_option");
  r2?.data.map((e) => {
    let a1 = document.createElement("option");
    a1.value = e?._id || '-';
    a1.text = `${e?.projectName} (${e?.projectId})` || '-' ;
    project_select_option.appendChild(a1);
  });
  // =========================================================
  // =========================================================
  const r3 = await fetch(`${contractor_API}/getAll`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });
  const r4 = (await r3.json());

  const dropdownContent_my_shivaur_mohit = document.getElementById("dropdownContent_my_shivaur_mohit");
  r4?.data.map((e) => {
    let d1 = document.createElement("div");
    d1.innerHTML = `
                    <input type="checkbox" value="${e._id}" class="assignee-checkbox_my_shivaur_m">
                    <label class="checkbox-label_my_shivaur_mohit">${e.ContractorName} (${e.contractorId})</label>`;
    d1.classList.add("checkbox-container_my_shivaur_mohit");
    dropdownContent_my_shivaur_mohit.appendChild(d1);    
  });
}
// ==================================================================================================================
async function editTaskDataUpdate() {
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  await dropdownForAddTask();
  // =========================================================================
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
    
    const r2 = await r1.json();
    console.log(r2)

    let a1 = document.getElementById("startDate");
    let a2 = document.getElementById("status");
    let a3 = document.getElementById("task-title");
    let a4 = document.getElementById("description");
    let a7 = document.getElementById("project_select_option");
    let a9 = document.getElementById('work-site-address');
    // let a11 = document.getElementById('material-quantity');
    // let a12 = document.getElementById('select-unit');
    let a13 = document.getElementById("complateDate");
    let a14 = document.getElementById("deadlineDate");
    a14.value = r2?.deadlineDate || '-';
    a13.value = r2?.complateDate || '-';
    // a12.value = r2?.unit || '-';
    // a11.value = r2?.quantity || '-';
    a9.value = r2?.siteAddress || '-';
    a1.value = r2?.startDate || '-';
    a2.value = r2?.status || '-';
    a3.value = r2?.title || '-';
    a4.value = r2?.taskDescription || '-';
    a7.value = r2?.project?._id || '-';
    

      
    let rr4 = r2?.materialManagement;
    for(let i = 0; i<rr4.length; i++){
      let r4 = rr4[i];
      const row = document.querySelectorAll(".tbodytwo tr");
      let cell = row[i].querySelectorAll("td");
      
      try{
        let cell1Input = cell[1]?.querySelector("select");
        if (cell1Input) cell1Input.value = r4?.material._id;

        let cell2Input = cell[2]?.querySelector("input");
        if (cell2Input) cell2Input.value = r4?.specs;

        let cell3Input = cell[3]?.querySelector("input");
        if (cell3Input) cell3Input.value = r4?.quantity;
        
        let cell4Select = cell[4]?.querySelector("select");
        if (cell4Select) cell4Select.value = r4?.unit;          
      } catch(error){
        console.log(error)
      }
      if (rr4.length- 1 != i) {
        addMaterialTableRow("addTableMaterial");
      }
    }
    //===============================================================
    // Sub-Task Section
    let rr5 = r2?.subTask
    for(let i=0; i<rr5.length; i++){
      let r5 = rr5[i];
      const subRow = document.querySelectorAll('.tbodythree tr')
      let cell = subRow[i].querySelectorAll("td");
      
      try{
        let cell1Input = cell[1]?.querySelector("textarea");
        if (cell1Input) cell1Input.value = r5?.remark;

        let cell2Input = cell[2]?.querySelector("input");
        if (cell2Input) cell2Input.value = r5?.date;

        let cell3Input = cell[3]?.querySelector("select");
        if (cell3Input) cell3Input.value = r5?.workStatus;
                  
      } catch(error){
        console.log(error)
      }
      if (rr5.length- 1 != i) {
        addSubTaskTableRow("addTableSubTask");
      }
    }
    //============================================================================


    let a6 = document.getElementById("assigned_by_select_option");
    let op1 = document.createElement("option");
    op1.text = r2?.assignedBy?.name;
    op1.value = r2?.assignedBy?._id;
    a6.appendChild(op1);

    let a8 = document.getElementById("selectedAssignees_my_shivaur_m");
    let assTo = r2?.assignedTo;
    assTo.map((e)=>{
      Array.from(document.querySelectorAll(".assignee-checkbox_my_shivaur_m")).map((e2) => {
        if(e2.value==e?._id){
          e2.checked = true;
        }
      });

      console.log("e :- ",e)
      let sp1 = document.createElement("span");
      sp1.innerText = `${e?.ContractorName} (${e?.contractorId})`;
      sp1.setAttribute("value", e?._id);
      sp1.classList.add("tag_my_shivaur_mohit");
      a8.appendChild(sp1);
    });

    
    let f1 = r2?.files;
    let a10 = document.getElementById("uploaded_files_tbodyone");
    if(f1.length>0){
      document.getElementById("file_main_div").classList.remove("d-none");
      f1.map((ee,i)=>{
        let tr1 = document.createElement("tr");
        tr1.innerHTML = `<td>${i+1}</td>
                          <td>
                              <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                          </td>
                          <td class="text-center">
                                      
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i
                                class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a  href="${ee}" target="_blank" class="dropdown-item" ><i class="fa-regular fa-eye"></i> View</a>
                                      <a class="dropdown-item " onclick="deleteUploadedFile('${ee}')" href="#" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                </div>
                            </div>
                          </td>`;
        a10.appendChild(tr1);                        
      }) 
    };
    assignee_drop_down_checkbox();
  } catch(error){
    window.location.href = 'tasks.html';
    // console.log(error)
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
}
editTaskDataUpdate();
// =============================================================================================

window.deleteUploadedFile = function deleteUploadedFile(fileName){
  document.getElementById("_value_for_file_name").value = fileName;
}
document.getElementById("deleteButton").addEventListener("click", async function(event){
  event.preventDefault();
  try{
    loading_shimmer();
  } catch(error){console.log(error)}
  // ----------------------------------------------------------------------------------------------------
  try{
    let _id = _id_param;
    let fileName = document.getElementById("_value_for_file_name").value;
    console.log("File name :- ",fileName)

    const response = await fetch(`${task_API}/deleteFile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id, fileName}),
    });
    
    if (response.ok) {
      status_popup("File Deleted <br> Successfully!", true);
      setTimeout(() => {
          window.location.reload();
      }, 1000);
    } else {
      status_popup("please try again <br> later!", false);
    }
  } catch(error){
    console.log(error)
  }
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}
})


// =====================================================================================
// =====================================================================================
// =====================================================================================

// Task Post API 
const update_task_form = document.getElementById('update_task_form');
update_task_form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  
  // if (!validateTaskForm()) {
  //   return;
  // }
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------

  let startDate = document.getElementById('startDate').value;
  let complateDate = document.getElementById('complateDate').value;
  let deadlineDate = document.getElementById('deadlineDate').value;
  let status = document.getElementById('status').value;
  let assignedBy = document.getElementById('assigned_by_select_option').value;
  let title = document.getElementById('task-title').value;
  let project = document.getElementById('project_select_option').value;
  let taskDescription = document.getElementById('description').value;
  // let unit = document.getElementById('select-unit').value;
  // let quantity = document.getElementById('material-quantity').value;
  let siteAddress = document.getElementById('work-site-address').value;

  let formData = new FormData();

  Array.from(document.getElementById("selectedAssignees_my_shivaur_m").children).forEach((e)=>{
    formData.append("assignedTo",e.getAttribute('value'));
  });
  
  let files = document.getElementById('file').files;
  for (const file of files) {
    formData.append("file", file);
  }

  let rows2 = document.querySelectorAll(".tbodytwo tr");
  rows2.forEach((row, index)=>{
    const cells = row.querySelectorAll("td");
    formData.append(`materialManagement[${index}][material]`, cells[1]?.querySelector("select")?.value || "");
    formData.append(`materialManagement[${index}][specs]`, cells[2]?.querySelector("input")?.value || "");
    formData.append(`materialManagement[${index}][quantity]`, cells[3]?.querySelector("input")?.value || "");
    formData.append(`materialManagement[${index}][unit]`, cells[4]?.querySelector("select")?.value || "");
  })

  let rows3 = document.querySelectorAll(".tbodythree tr");
  rows3.forEach((row, index)=>{
    const cells = row.querySelectorAll("td");
    formData.append(`subTask[${index}][remark]`, cells[1]?.querySelector("textarea")?.value || "");
    formData.append(`subTask[${index}][date]`, cells[2]?.querySelector("input")?.value || "");
    formData.append(`subTask[${index}][workStatus]`, cells[3]?.querySelector("select")?.value || "");
  })

  formData.append("_id",_id_param);
  formData.append("startDate", startDate); 
  formData.append("complateDate", complateDate);
  formData.append("deadlineDate", deadlineDate);
  formData.append("status", status);
  formData.append("assignedBy", assignedBy);
  formData.append("title", title);
  formData.append("project", project);
  formData.append("taskDescription", taskDescription);
  // formData.append("unit", unit); 
  // formData.append("quantity", quantity); 
  formData.append("siteAddress", siteAddress);

  try {
    const response = await fetch(`${task_API}/update`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const c1 = (response.ok);
    try{
      status_popup( ((c1) ? "Task Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
      setTimeout(function(){
        window.location.href = 'tasks.html'; 
      },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error){
      status_popup("Please try <br> again later", false);
    }
  } catch (error) {
    console.log(error)
    status_popup("Please try <br> again later", false);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
} catch(error){console.log(error)}
});

// =======================================================================================================================
// =======================================================================================================================
// =======================================================================================================================
// =======================================================================================================================

window.removeMaterialTableRow = function removeMaterialTableRow(i, tag_id) {
  document.getElementById(tag_id).children[1].children[i-1].remove();
  Array.from(document.getElementById(tag_id).children[1].children).map(
    (e, i) => {
      var dummyNo1 = i + 1;
      if (dummyNo1 != 1) {
        e.cells[0].innerText = dummyNo1;
        e.cells[
          e.cells.length - 1
        ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeMaterialTableRow(${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
      }
    }
  );
}
// Add Table Row function globally declared for reuse
window.addMaterialTableRow = function addMaterialTableRow(tag_id) {
  const varTableConst = document.getElementById(tag_id).children[1].children;
  const i = Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
  var tableBody = document.createElement("tr");
  tableBody.setAttribute("key",i);
  tableBody.innerHTML = `
                          <td >${i}</td>
                          <td> ${cacheAPIMaterialHTML} </td>
                          <td><input class="form-control " type="text" ></td>
                          <td><input class="form-control " type="text" ></td>
                          <td>
														<select class="form-control">
															<option value="" selected="" disabled="">Select Units</option>
															<option value="Feet">Feet</option>
															<option value="Meter">Meter</option>
															<option value="Nos">Nos</option>
															<option value="Kg">Kg</option>
															<option value="Cft">Cft</option>
															<option value="Depth">Depth</option>
															<option value="Pcs">Pcs</option>
															<option value="Bags">Bags</option>
														</select>
                          </td>
                          <td class="text-center">
                            <a href="javascript:void(0)" class="text-danger font-18 addProduct" onclick="removeMaterialTableRow(${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>
                          </td>
                      `;
  document.querySelector(".tbodytwo").appendChild(tableBody);
  try{
    startBro();
  } catch (error ){console.log(error)}
}
// ===========================================================================
// ===========================================================================
function startBro(){
  
  const dynamicMaterial = Array.from(document.querySelectorAll(".dymcMaterialQuantity"));
  try{
    dynamicMaterial.forEach(e=>{
      try{
        e.removeEventListener("change", searchFunction);
      } catch (error){console.log("eerrror :- ",error)}
    })
  } catch (error){console.log("error :- ",error)}
  
  dynamicMaterial.forEach(e=>{
    e.addEventListener("change", searchFunction);
  });
}
// =======================================
function searchFunction(event){
  try{
    let temp_tr = event.target.closest('tr');
    let temp_value = event.target.value;

    let rtn_slct_data = getSingleMaterialListCacheFunction(temp_value);

    temp_tr.children[3].querySelector("input").value = rtn_slct_data?.quantity;
    temp_tr.children[4].querySelector("select").value = rtn_slct_data?.unit;

  } catch (error){
    console.log(error)
  }
}

// =======================================================================================================================

window.removeSubTaskTableRow  = function removeSubTaskTableRow (i, tag_id) {
  document.getElementById(tag_id).children[1].children[i-1].remove();
  Array.from(document.getElementById(tag_id).children[1].children).map(
    (e, i) => {
      var dummyNo1 = i + 1;
      if (dummyNo1 != 1) {
        e.cells[0].innerText = dummyNo1;
        e.cells[
          e.cells.length - 1
        ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeSubTaskTableRow (${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
      }
    }
  );
}
// Add Table Row function globally declared for reuse
window.addSubTaskTableRow = function addSubTaskTableRow(tag_id) {
  const varTableConst = document.getElementById(tag_id).children[1].children;
  const i = Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
  var tableBody = document.createElement("tr");
  tableBody.setAttribute("key",i);
  tableBody.innerHTML = `
                          <td >${i}</td>
													<td> <textarea class="w-100 form-control" ></textarea> </td>
													<td> <input type="date" name="" id="" class="form-control"> </td>
													<td>
														<select class="form-control " id="">
															<option value="" selected="" disabled="">Select Status</option>
															<option value="Ready to Start">Ready to start</option>
															<option value="In-Progress">In-Progress</option>
															<option value="Complete">Complete</option>
														</select>
													</td>

                          <td class="text-center">
                            <a href="javascript:void(0)" class="text-danger font-18 addProduct" onclick="removeSubTaskTableRow (${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>
                          </td>
                      `;
  document.querySelector(".tbodythree").appendChild(tableBody);
}
// ===========================================================================

// ==========================================================================================
// ==========================================================================================

function assignee_drop_down_checkbox(){
  
  const dropdownContent_my_shivaur_mohit = document.getElementById("dropdownContent_my_shivaur_mohit");
  const selectedAssignees_my_shivaur_m = document.getElementById("selectedAssignees_my_shivaur_m");
  const checkboxes_my_shivaur_mohit = document.querySelectorAll(".assignee-checkbox_my_shivaur_m");
  
  // Function to toggle dropdown visibility
  window.toggleDropdown_my_shivaur_mohit = function toggleDropdown_my_shivaur_mohit() {
    dropdownContent_my_shivaur_mohit.classList.toggle("show_my_shivaur_mohit");
  }
  
  // Close dropdown if clicked outside
  window.addEventListener("click", function (event) {
    if (!event.target.matches('.dropdown-btn_my_shivaur_mohit')) {
      dropdownContent_my_shivaur_mohit.classList.remove("show_my_shivaur_mohit");
    }
  });
  
  // Function to update selected assignees display
  function updateselectedAssignees_my_shivaur_m() {
    // Clear the display area
    selectedAssignees_my_shivaur_m.innerHTML = "";
    
    // Loop through each checkbox and add selected ones to display
    checkboxes_my_shivaur_mohit.forEach((checkbox) => {
      if (checkbox.checked) {
        const label = checkbox.nextElementSibling.textContent; // Get the label text
        const tag = document.createElement("span");
        tag.classList.add("tag_my_shivaur_mohit");
        tag.textContent = label; // Display the label text
        tag.setAttribute("value", checkbox.value);
        selectedAssignees_my_shivaur_m.appendChild(tag);
      }
    });
    // dropdownContent_my_shivaur_mohit.click();
    document.getElementsByClassName("dropdown-btn_my_shivaur_mohit")[0].click();
  }
  
  // Attach event listeners to all checkboxes for selection
  checkboxes_my_shivaur_mohit.forEach((checkbox) => {
    checkbox.addEventListener("change", updateselectedAssignees_my_shivaur_m);
  });
}

// ===============================================================================================
// ===============================================================================================
// ===============================================================================================
// ===============================================================================================
// ===============================================================================================

// Validation function
function validateTaskForm() {
  clearErrors(); // Clear previous error messages

  let isValid = true;

  // Get field elements
  const taskTitle = document.getElementById("task-title");
  const project = document.getElementById("project_select_option");
  const assignees = document.getElementById("dropdownContent_my_shivaur_mohit");
  const assignedBy = document.getElementById("assigned_by_select_option");
  const status = document.getElementById("status");
  const description = document.getElementById("description");
  
  // Task Title Validation
  if (!taskTitle.value.trim()) {
    showError(taskTitle, "Please enter a valid task title");
    isValid = false;
  }

  // Project Validation
  if (!project.value.trim()) {
    showError(project, "Please select a project");
    isValid = false;
  }

  // Assignee Validation
  if (!isAnyAssigneeSelected()) {
    showError(document.getElementById("just_for_form_validation"), "Please select at least one assignee");
    isValid = false;
  }

  // Assigned By Validation
  if (!assignedBy.value.trim()) {
    showError(assignedBy, "Please select the person who assigned the task");
    isValid = false;
  }
  
  // Status Validation
  if (!status.value.trim()) {
    showError(status, "Please select a status");
    isValid = false;
  }

  // Description Validation
  if (!description.value.trim()) {
    showError(description, "Please provide a description");
    isValid = false;
  }

  return isValid;
}

// Function to check if any assignee is selected
function isAnyAssigneeSelected() {
  const checkboxes = document.querySelectorAll(
    "#dropdownContent_my_shivaur_mohit input[type='checkbox']"
  );
  return Array.from(checkboxes).some((checkbox) => checkbox.checked);
}

// Function to get selected assignees
function getSelectedAssignees() {
  const checkboxes = document.querySelectorAll(
    "#dropdownContent_my_shivaur_mohit input[type='checkbox']"
  );
  return Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value)
    .join(", ");
}

// --------------------------------------------------------------------------------------------------
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
function clearErrors() {
  const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
  errorMessages.forEach((msg) => msg.remove());
}