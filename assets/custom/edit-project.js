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
// --------------------------------------------------------------------------------
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import {user_API,project_API,product_API} from './apis.js';
import { formatDate } from './globalFunctions2.js';
// --------------------------------------------------------------------------------
const token = localStorage.getItem('token');
// =======================================================
// =======================================================
let id_param = new URLSearchParams(window.location.search).get("id");
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

async function editDateLoad() {
 
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // ----------------------------------------------------------------------------------------------------
  try{
    const response = await fetch(`${project_API}/get/${id_param}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if(!response.ok){
      throw new Error();
    }
    let r1 = await response.json();

    try{
      console.log(r1)
      let r2 = r1?.projectDetails;

      document.getElementById("projectName").value = r2?.projectName;
      document.getElementById("statuss").value = r2?.status;
      document.getElementById("client_select_option").value = r2?.clientName?._id;
      document.getElementById("emp_select_option").value = r2?.assignedTo._id;
      document.getElementById("startDate").value = r2?.startDate;
      document.getElementById("deadline").value = r2?.deadline;
      document.getElementById("complitionDate").value = r2?.complitionDate;
      document.getElementById("extensionDate").value = r2?.timeExtensionDate;
      document.getElementById("price").value = r2?.price;
      document.getElementById("discount_p").value = r2?.discountPercentage;
      document.getElementById("discount_p").setAttribute("disabled", "disabled");
      document.getElementById("discount_rs").value = r2?.discountRupee;
      document.getElementById("taxType").value = r2?.taxType;
      document.getElementById("tax").value = r2?.tax;
      document.getElementById("tax_rs").value = r2?.tax_rs;
      document.getElementById("totalPrice").value = r2?.totalPrice;
      document.getElementById("description").value = r2?.description;
      document.getElementById("tga_disabled_input").value = r2?.grossTotalAmount;
      document.getElementById("tda_disabled_input").value = r2?.deductionTotalAmount;
      document.getElementById("tna_disabled_input").value = r2?.netTotalAmount;
      document.getElementById("tit_disabled_input").value = r2?.income_tax_totalDeduction;
      document.getElementById("tgst_disabled_input").value = r2?.GST_totalDeduction;
      document.getElementById("trlty_disabled_input").value = r2?.royalty_totalDeduction;
      document.getElementById("tld_disabled_input").value = r2?.late_totalDeduction;
      document.getElementById("tsd_disabled_input").value = r2?.security_deposit_totalDeduction;
      document.getElementById("tlcs_disabled_input").value = r2?.labourCess_totalDeduction;
      document.getElementById("taod_disabled_input").value = r2?.any_other_totalDeduction;

      let r3 = r2?.paymentDetails;
      for(let i = 0; i<r3.length; i++){
        let r4 = r3[i];
        const row = document.querySelectorAll(".tbodyone tr");
        
        let cell = row[i].querySelectorAll("td");
        
        try{
          let cell1Input = cell[1]?.querySelector("input");
          if (cell1Input) cell1Input.value = r4?.paymentDate;
          
          let cell2Input = cell[2]?.querySelector("input");
          if (cell2Input) cell2Input.value = r4?.grossAmount;
          
          let abc1 = cell[3]?.children[0]?.children[1];
          if (abc1) {
              let incomeTaxInput = abc1.children[0]?.querySelector("input");
              if (incomeTaxInput) incomeTaxInput.value = r4?.incomeTaxDeduction;
          
              let gstInput = abc1.children[1]?.querySelector("input");
              if (gstInput) gstInput.value = r4?.GSTDeduction;
          
              let royaltyInput = abc1.children[2]?.querySelector("input");
              if (royaltyInput) royaltyInput.value = r4?.royaltyDeduction;
          
              let letInput = abc1.children[3]?.querySelector("input");
              if (letInput) letInput.value = r4?.letDeduction;
          
              let securityInput = abc1.children[4]?.querySelector("input");
              if (securityInput) securityInput.value = r4?.securityDepositDeduction;
          
              let labourCess = abc1.children[5]?.querySelector("input");
              if (labourCess) labourCess.value = r4?.labourCessDeduction;

              let otherInput = abc1.children[6]?.querySelector("input");
              if (otherInput) otherInput.value = r4?.otherDeduction;
          }
          
          let cell4Input = cell[4]?.querySelector("select");
          if (cell4Input) cell4Input.value = r4?.netAmount;
          
          let cell5Select = cell[5]?.querySelector("select");
          if (cell5Select) cell5Select.value = r4?.status;

          let cell6Input = cell[6]?.querySelector("input");
          if (cell6Input) cell6Input.value = r4?.mbNumber;
          
          // ---bhai mohit, yahaa pe, MB FILE SHOW krne ke code lekhne h, baad mei, yaad rakhna---------
          
          let cell8Input = cell[8]?.querySelector("input");
          if (cell8Input) cell8Input.value = r4?.complitionDate;
        } catch(error){
          console.log(error);
        }       

        if (r3.length- 1 != i) {
          addInvoiceTableRow("addTable");
        }
      }

      
      let rr4 = r2?.materialDetails;
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

      
      let rr5 = r2?.sdDetails;
      for(let i = 0; i<rr5.length; i++){
        let r4 = rr5[i];
        const row = document.querySelectorAll(".tbodythree tr");
        let cell = row[i].querySelectorAll("td");
        
        try{
          let cell1Input = cell[1]?.querySelector("input");
          if (cell1Input) cell1Input.value = r4?.amount;

          let cell2Input = cell[2]?.querySelector("input");
          if (cell2Input) cell2Input.value = r4?.remark;

          let cell3Input = cell[3]?.querySelector("select");
          if (cell3Input) cell3Input.value = r4?.amountStatus;
            
        } catch(error){
          console.log(error)
        }
        if (rr5.length- 1 != i) {
          addSDSectionTableRow("addTableSDSection");
        }
      }



      let f1 = r2?.document;
      if(f1.length>0){
        document.getElementById("file_main_div").classList.remove("d-none");
        let a10 = document.getElementById("uploaded_files_tbodyone"); 
        console.log("bro :- ",f1);
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
      } else {
        document.getElementById("file_main_div").classList.add("d-none");
      }

    } catch(error){
      console.log(error)
    }
    
  } catch(error){
    console.log(error)
    // window.location.href = 'project-list.html'; 
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
}


global_price_calculate();

// Fetch clients and employees on page load
try {
  const response = await fetch(`${user_API}/data/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  const res = await response.json();

  const client_select_option = document.getElementById("client_select_option");
  const emp_select_option = document.getElementById("emp_select_option");

  // Populate clients dropdown
  res.users.clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client._id;
    option.text = `${client?.name} (${client?.userId})`;
    client_select_option.appendChild(option);
  });

  // Populate employees dropdown
  res.users.employees.forEach((employee) => {
    const option = document.createElement("option");
    option.value = employee._id;
    option.text = `${employee?.name} (${employee?.userId})`;
    emp_select_option.appendChild(option);
  });
} catch (error) {
  console.error('Error fetching data:', error);
  alert('Failed to load client and employee data.');
}
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
    let _id = id_param;
    let fileName = document.getElementById("_value_for_file_name").value;
    console.log("File name :- ",fileName)

    const response = await fetch(`${project_API}/deleteFile`, {
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

// =============================================================================================
// =============================================================================================

// Form submission for adding a new project
let materialUpdateAPIObjectData = [];
document.getElementById("add_project_form").addEventListener("submit", async function (event) {
  event.preventDefault();
  
  try{
    loading_shimmer();
  } catch(error){console.log(error)}
  // ----------------------------------------------------------------------------------------------------
  try {
    let formData = rntFormData();

    const response = await fetch(`${project_API}/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    
    const c1 = (response.ok);
    try{
        status_popup( ((c1) ? "Project Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
        let abmohit = await batchFetchProducts();
        let ab2mohit = await batchUpdateProducts(abmohit);
        setTimeout(function(){
            window.location.href = `project-view.html?id=${id_param}`;
        },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error){
      status_popup( ("Please try <br> again later"), (false) );
    }
  } catch (error) {
    console.log(error)
    status_popup( ("Please try <br> again later"), (false) );
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
});
//=======================================================================================================
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
//======================================================================================================


function rntFormData(){
  let formData = new FormData();

  const files = document.getElementById("project-file").files;
  for (const file of files) {
    formData.append("file", file);
  }

  formData.append("_id", id_param);
  
  formData.append("projectName", document.getElementById("projectName").value);
  formData.append("clientName", document.getElementById("client_select_option").value);
  formData.append("startDate", document.getElementById("startDate").value);
  formData.append("deadline", document.getElementById("deadline").value);
  formData.append("complitionDate", document.getElementById("complitionDate").value);
  formData.append("timeExtensionDate", document.getElementById("extensionDate").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("status", document.getElementById("statuss").value);
  formData.append("assignedTo", document.getElementById("emp_select_option").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("tax", document.getElementById("tax").value);
  formData.append("tax_rs", document.getElementById("tax_rs").value);
  formData.append("taxType", document.getElementById("taxType").value);
  formData.append("discountPercentage", document.getElementById("discount_p").value);
  formData.append("discountRupee", document.getElementById("discount_rs").value);
  formData.append("totalPrice", document.getElementById("totalPrice").value);
  formData.append("grossTotalAmount", document.getElementById("tga_disabled_input").value);
  formData.append("deductionTotalAmount", document.getElementById("tda_disabled_input").value);
  formData.append("netTotalAmount", document.getElementById("tna_disabled_input").value);
  
  formData.append("income_tax_totalDeduction", document.getElementById("tit_disabled_input").value);
  formData.append("GST_totalDeduction", document.getElementById("tgst_disabled_input").value);
  formData.append("royalty_totalDeduction", document.getElementById("trlty_disabled_input").value);
  formData.append("late_totalDeduction", document.getElementById("tld_disabled_input").value);
  formData.append("security_deposit_totalDeduction", document.getElementById("tsd_disabled_input").value);
  formData.append("labourCess_totalDeduction", document.getElementById("tlcs_disabled_input").value);
  formData.append("any_other_totalDeduction", document.getElementById("taod_disabled_input").value);
  
  // Process Payment Details
  const rows = document.querySelectorAll(".tbodyone tr");
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    formData.append(`paymentDetails[${index}][paymentDate]`, cells[1]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][grossAmount]`, cells[2]?.querySelector("input")?.value || "");

    let abc1 = cells[3]?.children[0]?.children[1];
    formData.append(`paymentDetails[${index}][incomeTaxDeduction]`, abc1?.children[0]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][GSTDeduction]`, abc1?.children[1]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][royaltyDeduction]`, abc1?.children[2]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][letDeduction]`, abc1?.children[3]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][securityDepositDeduction]`, abc1?.children[4]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][labourCessDeduction]`, abc1?.children[5]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][otherDeduction]`, abc1?.children[6]?.querySelector("input")?.value || "");

    formData.append(`paymentDetails[${index}][netAmount]`, cells[4]?.querySelector("input")?.value || "");
    formData.append(`paymentDetails[${index}][status]`, cells[5]?.querySelector("select")?.value || "");
    formData.append(`paymentDetails[${index}][mbNumber]`, cells[6]?.querySelector("select")?.value || "");

    // Handle file upload for mbfile (Fix: Correct field name)
    const fileInput = cells[7]?.querySelector("input");
    if (fileInput && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append("mbfile", fileInput.files[i]); // ✅ FIXED: No brackets []
      }
    }

    formData.append(`paymentDetails[${index}][complitionDate]`, cells[8]?.querySelector("input")?.value || "");
  });

  // Process Material Details
  let rows2 = document.querySelectorAll(".tbodytwo tr"); 
  rows2.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    formData.append(`materialDetails[${index}][material]`, cells[1]?.querySelector("select")?.value || "");
    formData.append(`materialDetails[${index}][specs]`, cells[2]?.querySelector("input")?.value || "");
    formData.append(`materialDetails[${index}][quantity]`, cells[3]?.querySelector("input")?.value || "");
    formData.append(`materialDetails[${index}][unit]`, cells[4]?.querySelector("select")?.value || "");
  });

  // Process Security Deposit (sdDetails)
  let rows3 = document.querySelectorAll(".tbodythree tr");
  rows3.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    formData.append(`sdDetails[${index}][amount]`, cells[1]?.querySelector("input")?.value || "");
    formData.append(`sdDetails[${index}][remark]`, cells[2]?.querySelector("input")?.value || "");
    formData.append(`sdDetails[${index}][amountStatus]`, cells[3]?.querySelector("select")?.value || "");

    // Handle file upload for sdFiles (Fix: Correct field name)
    const fileInput = cells[4]?.querySelector("input");
    if (fileInput && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append("sdFiles", fileInput.files[i]); // ✅ FIXED: No brackets []
      }
    }
  });

  return formData;
}
// =======================================================================================================================
// =======================================================================================================================
// =======================================================================================================================



window.removeSDSectionTableRow = function removeSDSectionTableRow(i, tag_id) {
  document.getElementById(tag_id).children[1].children[i-1].remove();
  Array.from(document.getElementById(tag_id).children[1].children).map(
    (e, i) => {
      var dummyNo1 = i + 1;
      if (dummyNo1 != 1) {
        e.cells[0].innerText = dummyNo1;
        e.cells[
          e.cells.length - 1
        ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeSDSectionTableRow(${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
      }
    }
  );
}
// Add Table Row function globally declared for reuse
window.addSDSectionTableRow = function addSDSectionTableRow(tag_id) {
  const varTableConst = document.getElementById(tag_id).children[1].children;
  const i = Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
  var tableBody = document.createElement("tr");
  tableBody.setAttribute("key",i);
  tableBody.innerHTML = `
                          <td >${i}</td>
                          <td>
                            <input class="form-control" type="text"  >
                          </td>
                          <td>
                            <input class="form-control " type="text" >
                          </td>
                          <td>
                            <select class="form-control " id="">
                              <option value="" selected="" disabled>Select ID-Proof</option>
                              <option value="FD">FD</option>
                              <option value="BG">BG</option>
                              <option value="Online Transfer">Online Transfer</option>
                              <option value="Passbook">Passbook</option>
                            </select>
                          </td>
                          <td>
                            <input class="form-control" type="file" multiple >
                          </td>
                          <td class="text-center">
                            <a href="javascript:void(0)" class="text-danger font-18 addProduct" onclick="removeSDSectionTableRow(${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>
                          </td>
                      `;
  document.querySelector(".tbodythree").appendChild(tableBody);
}

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
// Add Table Row function globally declared for reuse
window.addMaterialTableRow = async function addMaterialTableRow(tag_id) {
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

// ===========================================================================
// ===========================================================================


// =======================================================================================================================
// =======================================================================================================================
// =======================================================================================================================
// =======================================================================================================================

window.removeInvoiceTableRow = function removeInvoiceTableRow(i, tag_id) {
  document.getElementById(tag_id).children[1].children[i - 1].remove();
  Array.from(document.getElementById(tag_id).children[1].children).map(
    (e, i) => {
      var dummyNo1 = i + 1;
      if (dummyNo1 != 1) {
        e.cells[0].innerText = dummyNo1;
        e.cells[
          e.cells.length - 1
        ].innerHTML = `<a href="javascript:void(0)" class="text-danger font-18 remove" onClick="removeInvoiceTableRow(${dummyNo1}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>`;
      }
    }
  );
}
// Add Table Row function globally declared for reuse
window.addInvoiceTableRow = function addInvoiceTableRow(tag_id) {
  const varTableConst = document.getElementById(tag_id).children[1].children;
  const i =
    Number(varTableConst[varTableConst.length - 1].cells[0].innerText) + 1;
  var tableBody = document.createElement("tr");
  tableBody.setAttribute("key",i);
  tableBody.innerHTML = `
                        <td hidden class="d-none">${i}</td>
                        <td>
                           <input class="form-control paymentDate" type="date" id="paymentDate" >
                        </td>
                        <td>
                          <input class="form-control paymentAmount" type="number" id="paymentAmount" placeholder="Enter Installment Amount" min="0" onkeypress="return event.charCode >= 48 && event.charCode <= 57">
                        </td>
                        <td>
                          <div class="custom-dropdown w-100">
                            <button type="button" class="  dropdown-toggle w-100 border text-start" style="background-color: white; padding: 10px;">Select an Option</button>
                            <div class="dropdown-content w-100 ">
                              <div>
                                <label class="col-form-label">Total Income Tax </label>
                                <input class="form-control deduction_income" type="text" placeholder="Enter Income Tax ₹">
                              </div>
                              <div>
                                <label class="col-form-label">Total GST </label>
                                <input class="form-control deduction_gst" type="text" placeholder="Enter GST ₹">
                              </div>
                              <div>
                                <label class="col-form-label">Total Royalty </label>
                                <input class="form-control deduction_royalty" type="text" placeholder="Enter Royalty ₹">
                              </div>
                              <div>
                                <label class="col-form-label">Total Late Deduction </label>
                                <input class="form-control deduction_late" type="text" placeholder="Enter Late Deduction ₹">
                              </div>
                              <div>
                                <label class="col-form-label">Total Security Deposit </label>
                                <input class="form-control deduction_security " type="text" placeholder="Enter Security Deposit ₹">
                              </div>
                              <div>
                                <label class="col-form-label">Total Labour Cess </label>
                                <input class="form-control deduction_labour_cess " type="text" placeholder="Enter Labour Cess ₹">
                              </div>
                              <div>
                                <label class="col-form-label">Total Any Other Deduction </label>
                                <input class="form-control deduction_other" type="text" placeholder="Enter Any Other Deduction ₹">
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input class="form-control ttl_net_amt" disabled type="number" placeholder="Total Net Amount">
                        </td>
                        <td>
                          <select class="form-control paymentStatus" id="paymentStatus">
                            <option value="" selected="">Select Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                        <td>
                          <input class="form-control" type="text">
                        </td>
                        <td>
                          <input class="form-control" type="file" multiple>
                        </td>
                        <td>
                          <input class="form-control paidDate" type="date" id="paidDate" >
                        </td>
                        <td class="text-center">
                          <a href="javascript:void(0)" class="text-danger font-18 addProduct" onclick="removeInvoiceTableRow(${i}, '${tag_id}')" title="Remove"><i class="fa-regular fa-trash-can"></i></a>
                        </td>
                      `;
  tableBody.classList.add("installmentData");
  document.querySelector(".tbodyone").appendChild(tableBody);
}

editDateLoad();


// ===========================================================================
// ===========================================================================

document.getElementById("addTable").addEventListener("input", function(event){
  let closest_tr = event.target.closest("tr");
  
  
  let a1 = Number(closest_tr.querySelector(".paymentAmount").value || 0) ;

  let b1 = Number(closest_tr.querySelector(".deduction_income").value || 0) ;
  let b2 = Number(closest_tr.querySelector(".deduction_gst").value || 0) ;
  let b3 = Number(closest_tr.querySelector(".deduction_royalty").value || 0) ;
  let b4 = Number(closest_tr.querySelector(".deduction_late").value || 0) ;
  let b5 = Number(closest_tr.querySelector(".deduction_security").value || 0) ;
  let b6 = Number(closest_tr.querySelector(".deduction_labour_cess").value || 0) ;
  let b7 = Number(closest_tr.querySelector(".deduction_other").value || 0) ;

  let aa1 = (b1+b2+b3+b4+b5+b6+b7);
  let aa2 = (a1 - aa1);
  
  closest_tr.querySelector(".ttl_net_amt").value = aa2;

  ttl_grs_ded_net();

});

function ttl_grs_ded_net() {
  const tbl_all = document.getElementById("addTable");

  // Class names and corresponding result variables
  const classes = [
    "paymentAmount",
    "deduction_income",
    "deduction_gst",
    "deduction_royalty",
    "deduction_late",
    "deduction_security",
    "deduction_labour_cess",
    "deduction_other",
    "ttl_net_amt"
  ];

  const totals = classes.map(cls => {
    return Array.from(tbl_all.querySelectorAll(`.${cls}`))
      .reduce((sum, el) => sum + Number(el.value || 0), 0);
  });

  const [b1, b2, b3, b4, b5, b6, b7, b8, b9] = totals;

  // Calculate totals
  const tga = b1;
  const tda = b2 + b3 + b4 + b5 + b7 + b8;
  const tna = b9;

  // Update the inputs
  document.getElementById("tga_disabled_input").value = tga;
  document.getElementById("tda_disabled_input").value = tda;
  document.getElementById("tna_disabled_input").value = tna;
  // -------------------------------------------------------
  document.getElementById("tit_disabled_input").value = b2;
  document.getElementById("tgst_disabled_input").value = b3;
  document.getElementById("trlty_disabled_input").value = b4;
  document.getElementById("tld_disabled_input").value = b5;
  document.getElementById("tsd_disabled_input").value = b6;
  document.getElementById("tlcs_disabled_input").value = b7;
  document.getElementById("taod_disabled_input").value = b8;


}



function global_price_calculate() {
  const discount_p = document.getElementById("discount_p");
  const discount_rs = document.getElementById("discount_rs");
  const price = document.getElementById("price");
  const tax_rs = document.getElementById("tax_rs");
  const totalPrice = document.getElementById("totalPrice");
  const tax = document.getElementById("tax");
  price.addEventListener("input", f1);
  tax.addEventListener("input", my_calc_1);
  discount_p.addEventListener("input", function () {
    if (Number(discount_p.value) > 0) {
      discount_rs.setAttribute("disabled", "disabled");
    } else {
      discount_rs.removeAttribute("disabled", "disabled");
    }
    f2();
  });
  discount_rs.addEventListener("input", function () {
    if (Number(discount_rs.value) > 0) {
      discount_p.setAttribute("disabled", "disabled");
    } else {
      discount_p.removeAttribute("disabled", "disabled");
    }
    f3();
  });
  function f1() {
    if (discount_p.getAttribute("disabled")) {
      f3();
    }
    if (
      discount_rs.getAttribute("disabled") ||
      Number(discount_rs.value) == 0
    ) {
      f2();
    }
  }
  function f2() {
    const p_price_12 = Number(price.value);
    const ps_discount_p = Number(discount_p.value);
    try {
      const mm_1 = formatValue_of_2((p_price_12 * ps_discount_p) / 100);
      discount_rs.value = mm_1;
    } catch {}
    my_calc_1();
  }
  function f3() {
    const p_price_12 = Number(price.value);
    const ps_discount_rs = Number(discount_rs.value);
    try {
      const mm_1 = formatValue_of_2(
        (Number(ps_discount_rs) / Number(p_price_12)) * 100
      );
      discount_p.value = mm_1;
    } catch {}
    my_calc_1();
  }
  function my_calc_1() {
    const my_aa1 = Number(tax.value);
    const my_aa2 = Number(discount_rs.value);
    const my_aa3 = Number(price.value);
    const rs_to_my_1 = formatValue_of_2(((my_aa3 - my_aa2) * my_aa1) / 100);
    tax_rs.value = rs_to_my_1;
    total_price_value_calc();
  }
  function total_price_value_calc() {
    const ma1 = Number(
      Number(price.value) - Number(discount_rs.value) + Number(tax_rs.value)
    );
    totalPrice.value = Math.floor(ma1);
  }
  function formatValue_of_2(value) {
    // Convert the value to a number
    const num = parseFloat(value);
    // Check if the number is an integer
    if (Number.isInteger(num)) {
      return num.toString(); // Return as a string without decimals
    }
    // Convert to string and split by the decimal point
    const parts = num.toString().split(".");
    // If there are more than 2 decimal places, truncate to 2
    if (parts[1] && parts[1].length > 2) {
      return num.toFixed(2);
    }
    // Otherwise, return the original number
    return num.toString();
  }
}

