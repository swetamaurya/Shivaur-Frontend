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

import {status_popup, loading_shimmer, remove_loading_shimmer} from './globalFunctions1.js';
import {task_API, user_API, project_API,contractor_API, product_API} from './apis.js';

const token = localStorage.getItem('token');
// =======================================================
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
  assignee_drop_down_checkbox();
  // =========================================================
}
dropdownForAddTask();
// Task Post API 
// ---------------------------------------------
let materialUpdateAPIObjectData = [];
// ----------------------------------------------
const addTaskForm = document.getElementById('add_task_form');
addTaskForm.addEventListener('submit',async(event)=>{
  event.preventDefault();

  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
 
  let formData = rtnFormData();

  try {
    const response = await fetch(`${task_API}/create-and-assign`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    console.log("responce,",response)
    const c1 = (response.ok);
    try{
      status_popup( ((c1) ? "Task Created <br> Successfully!" : "Please try <br> again later"), (c1) );
      
      let abmohit = await batchFetchProducts();
      let ab2mohit = await batchUpdateProducts(abmohit);
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

// =====================================================
async function batchFetchProducts() {
  try {
    // Create an array of fetch promises for each material ID
    const fetchPromises = materialUpdateAPIObjectData.map(item =>
      fetch(`${product_API}/get/${item.material}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch product with id: ${item.material}`);
        }
        return response.json();
      })
    );

    // Wait for all the fetch requests to resolve
    const productsData = await Promise.all(fetchPromises);
    console.log("Batch fetched products:", productsData);
    return productsData;
  } catch (error) {
    console.error("Error in batch fetch:", error);
  }
}
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================
// =====================================================

// Function to update a single product by subtracting the update quantities
async function updateProductQuantity(product) {
  // Get all update entries that match this product by _id
  const updatesForProduct = materialUpdateAPIObjectData.filter(
    item => item.material === product._id
  );
  
  // Sum up all quantities to subtract
  const totalSubtraction = updatesForProduct.reduce(
    (sum, item) => sum + Number(item.task_quantity),
    0
  );
  
  const currentQty = Number(product.quantity || 0);
  const newQty = currentQty - totalSubtraction;

  // Prepare FormData for the update API
  const formData = new FormData();
  formData.append("_id", product._id);
  formData.append("quantity", newQty);
  
  try {
    const response = await fetch(`${product_API}/update`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product with id ${product._id}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

// Function to run all updates in batch
async function batchUpdateProducts(fetchedProducts) {
  try {
    const updatePromises = fetchedProducts.map(product => updateProductQuantity(product));
    const updateResults = await Promise.all(updatePromises);
    return updateResults;
  } catch (error) {
    console.error("Error in batch updating products:", error);
  }
}

// =====================================================
// =====================================================
// =====================================================

function rtnFormData(){
  let startDate = document.getElementById('startDate').value;
  let complateDate = document.getElementById('complateDate').value;
  let deadlineDate = document.getElementById('deadlineDate').value;
  let status = document.getElementById('status').value;
  let assignedBy = document.getElementById('assigned_by_select_option').value;
  let title = document.getElementById('task-title').value;
  let project = document.getElementById('project_select_option').value;
  let taskDescription = document.getElementById('description').value;
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

    let aaad1 = {
      "material": cells[1]?.querySelector("select")?.value,
      "task_quantity" :cells[3]?.querySelector("input")?.value
    }
    materialUpdateAPIObjectData.push(aaad1);

  })


  let rows3 = document.querySelectorAll(".tbodythree tr");
  rows3.forEach((row, index)=>{
    const cells = row.querySelectorAll("td");
    formData.append(`subTask[${index}][remark]`, cells[1]?.querySelector("textarea")?.value || "");
    formData.append(`subTask[${index}][date]`, cells[2]?.querySelector("input")?.value || "");
    formData.append(`subTask[${index}][workStatus]`, cells[3]?.querySelector("select")?.value || "");
  })


  formData.append("startDate", startDate);
  formData.append("complateDate", complateDate);
  formData.append("deadlineDate", deadlineDate);

  formData.append("status", status);
  formData.append("assignedBy", assignedBy);
  formData.append("title", title);
  formData.append("project", project);
  formData.append("taskDescription", taskDescription);
  formData.append("siteAddress", siteAddress);

  return formData;
}

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
// =======================================================================================================================
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
															<option value="Ready to Start">Ready to Start</option>
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


// // Automatically set start date to tomorrow
document.addEventListener("DOMContentLoaded", function () {
  ["startDate","deadlineDate","complateDate"].forEach(e=>{
    const startDateField = document.getElementById(e);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    let a = tomorrow.toISOString().split("T")[0];
    startDateField.setAttribute("min", a);
  });
});