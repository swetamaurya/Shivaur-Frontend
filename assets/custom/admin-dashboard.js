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

// Import necessary functions and APIs
// const { loading_shimmer, remove_loading_shimmer } = await import("./globalFunctions1.js");
// const { dashboard_API, project_API } = await import("./apis.js");
// const { formatDate } = await import('./globalFunctions2.js');

// Define APIs locally to avoid import issues
const dashboard_API = 'https://shivaur-backend.onrender.com/dashboard';
const project_API = 'https://shivaur-backend.onrender.com/project';

// Define loading functions locally
function loading_shimmer() {
    // Add loading shimmer effect
    const shimmer = document.createElement('div');
    shimmer.id = 'loading-shimmer';
    shimmer.innerHTML = '<div class="shimmer"></div>';
    document.body.appendChild(shimmer);
}

function remove_loading_shimmer() {
    const shimmer = document.getElementById('loading-shimmer');
    if (shimmer) {
        shimmer.remove();
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Retrieve token
const token = localStorage.getItem("token");

// Function to handle login and registration messages
window.onload = () => {
  let projectTask = document.getElementById('project_select_option').value
  const loginMessage = localStorage.getItem("loginMessage");
  const registerMessage = localStorage.getItem("registerMessage");
  const message = document.getElementById("response");

  if (loginMessage || registerMessage) {
    message.innerText = loginMessage || registerMessage;
    setTimeout(() => {
      message.style.display = "none";
    }, 6000);
    localStorage.removeItem("loginMessage");
    localStorage.removeItem("registerMessage");
  }

  // Fetch data for the dashboard
  fetchTaskStatistics();
  fetchDashboardData();
};

// Helper function to update recent items in tables
function updateRecentItems(tableId, items, fields) {
  const table = document.querySelector(`#${tableId} tbody`);
  table.innerHTML = items
    .map(
      (item) =>
        `<tr>${fields
          .map(({ field, link, linkPath, render }) => {
            const value = resolveNestedProperty(item, field);

            // Check for custom render function
            if (render) {
              return `<td>${render(value)}</td>`;
            }

            // Handle link if provided
            if (link) {
              return `<td><a href="${
                linkPath.replace("{value}", value) || "#"
              }">${value}</a></td>`;
            }

            // Default cell value
            return `<td>${value}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");
}

function resolveNestedProperty(obj, path) {
  // Split the paths to allow checking multiple options
  const paths = path.split("||").map((p) => p.trim());
  for (let p of paths) {
    const value = p.split(".").reduce((acc, key) => acc?.[key], obj);
    if (value) return value; // Return the first non-falsy value
  }
  return "-"; // Default if no value is found
}

// Function to fetch dashboard data
async function fetchDashboardData() {
  try {
    loading_shimmer();

    const response = await fetch(dashboard_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch dashboard data");

    const data = await response.json();

    // Update dashboard counts
    document.querySelector(".projects-count").textContent =
      data.counts.projectCount || 0;
    document.querySelector(".clients-count").textContent =
      data.counts.clientCount || 0;
    document.querySelector(".tasks-count").textContent =
      data.counts.taskCount || 0;
    document.querySelector(".employees-count").textContent =
      data.counts.employeeCount || 0;

    // Update recent items
    updateRecentItems("tableData", data.recentInvoices, [
      {
        field: "invoiceId"
      },
      { field: "client.name" },
      // { field: "project.projectName" },
      { field: "dueDate" },
      // { field: "total" },
      {
        field: "_id",
        render: (value) => {
          return `<a href="invoice-view.html?id=${value}" target="_blank" title="View Invoice">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#e84040" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
</svg>
                  </a>`;
        },
      },
    ]);

    updateRecentItems("enquiryData", data.recentEnquiry, [
      { field: "enquiryDate" },

      { field: "PIC" },
      { field: "createdBy.name" },
      // { field: "offers.0.offerReferenceNumber || offerReferenceNumber" },
      // { field: "offers.0.offerDate || offerDate" },
      // { field: "detailOfEnquiry" },
      {
        field: "_id",
        render: (value) => {
          return `<a href="enquiry-view.html?id=${value}" target="_blank" title="View Enquiry">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#e84040" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
</svg>
                  </a>`;
        },
      },
    ]);

    updateRecentItems("projectData", data.recentProjects, [
      { field: "startDate" },
      { field: "projectName" },
      // { field: "projectId" },
      // { field: "clientName.name" },
      // { field: "assignedTo.name" },
      
      { field: "deadline" },
      {
        field: "_id",
        render: (value) => {
          return `<a href="project-view.html?id=${value}" target="_blank" title="View Project">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#e84040" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
</svg>
                  </a>`;
        },
      },
    ]);

    updateRecentItems("offerData", data.recentOffer, [
      // { field: "offerReferenceNumber" },
      { field: "offerDate" },
      // { field: "enquiry.enquiryTitle || enquiryTitle" },
      { field: "enquiry.PIC || PIC" },
      { field: "offerTitle" },
      // { field: "enquiry.email || email" },
      // { field: "enquiry.phone || phone" },
      // { field: "enquiry.department || department" },
      // { field: "enquiry.company || company" },
      // { field: "price" },
      {
        field: "_id",
        render: (value) => {
          return `<a href="offer-view.html?id=${value}" target="_blank" title="View Offer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#e84040" class="bi bi-eye-fill" viewBox="0 0 16 16">
  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
</svg>
                  </a>`;
        },
      },
    ]);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    remove_loading_shimmer();
  }
}

// Function to fetch task statistics for the dashboard with date filter
async function fetchTaskStatistics() {
  try {
    loading_shimmer();

    // Get date filters
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    // Build the query parameters
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);

    const response = await fetch(
      `${dashboard_API}/task-status?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch task statistics");

    const data = await response.json();
    updateTaskStatistics(data);
  } catch (error) {
    console.error("Error fetching task statistics:", error);
    alert("Unable to fetch task statistics. Please try again later.");
  } finally {
    remove_loading_shimmer();
  }
}

// Event Listener for Date Filters
// document.getElementById("fromDate").addEventListener("change", fetchTaskStatistics);
// document.getElementById("toDate").addEventListener("change", fetchTaskStatistics);

// Existing function to update task statistics UI
function updateTaskStatistics(data) {
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
    console.error(
      "Missing required elements: .progress or #taskStatisticsBreakdown"
    );
    return; // Exit the function if elements are missing
  }

  progressContainer.innerHTML = "";
  breakdownContainer.innerHTML = "";

  Object.entries(taskCounts).forEach(([status, count]) => {
    const percentage =
      totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(2) : 0; // (count task ka)/(total task) *100
    const statusConfig = statusColors[status];

    // Add progress bar with corresponding color
    const progressBar = document.createElement("div");
    progressBar.className = `progress-bar ${
      statusConfig?.bgColor || "bg-secondary"
    }`;
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = `${percentage}%`;
    progressContainer.appendChild(progressBar);
    progressBar.setAttribute("data-bs-toggle", "tooltip");
    progressBar.setAttribute("data-bs-placement", "top");
    progressBar.setAttribute("title", `${status}: ${count} tasks`);
    progressContainer.appendChild(progressBar);

    // Initialize tooltips (Bootstrap-specific)
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      const tooltipElements = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipElements.forEach((el) => new bootstrap.Tooltip(el));
    }
    // Add task status breakdown with corresponding color
    const breakdown = document.createElement("p");
    breakdown.innerHTML = `
      <i class="fa-regular fa-circle-dot ${
        statusConfig?.color || "text-secondary"
      } me-2"></i>
      ${status} Tasks
      <span class="float-end">${count} (${percentage}%)</span>
    `;
    breakdownContainer.appendChild(breakdown);
  });
}
//----------------------------------------------------------------------------------------
// Project API --------------------------------------------------------------------------
let cachedProject = [];
async function showProjectDropdown(){
  try{
          loading_shimmer();
      } catch(error){console.log(error)}
      // -----------------------------------------------------------------------------------
      const r1 = await fetch(`${project_API}/get`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
      const r2 = await r1.json();
      cachedProject = r2?.data;
  
      console.log("bro :- ",cachedProject)
      
      const project_select_option = document.getElementById("project_select_option");
      console.log(r2?.projects);
      
      // Add error handling for missing DOM element
      if (project_select_option && cachedProject) {
          cachedProject.map((e) => {
              let a1 = document.createElement("option");
              a1.value = e?._id || '-';
              a1.text = `${e?.projectName} (${e?.projectId})` || '-' ;
              project_select_option.appendChild(a1);
          });
      }
      // ----------------------------------------------------------------------------------------------------
      try{
          remove_loading_shimmer();
      } catch(error){console.log(error)}
}
showProjectDropdown()

let showingSelectedProjectTask = document.getElementById('taskStatisticsId')

// Add error handling for missing DOM element
if (showingSelectedProjectTask) {
    showingSelectedProjectTask.addEventListener('submit',async(e)=>{
  e.preventDefault();
  try{
        loading_shimmer();
    } catch(error){console.log(error)}
//--------------------------------------------------------------------------------------------
try{
    const selectedProject = document.getElementById('project_select_option').value;
    if(selectedProject==''){
      fetchTaskStatistics();
    }
    const totalTasks = document.getElementById('totalTasksCount')
    const overdueTasksCount = document.getElementById('overdueTasksCount')
    const taskStatistics = document.getElementById('taskStatistics')
    const statPercBox = document.getElementById('statPercBox')
    const progressBox = document.createElement('div')
    progressBox.classList.add('progress','my-3','p-0')
    progressBox.setAttribute('id','progress-box')
    const taskStatisticsBreakdown = document.createElement('div') 
    taskStatisticsBreakdown.setAttribute('id','selectedtaskStatisticsBreakdown')
    let url;
    const formatDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    if(formatDate!=''){
      url = `${project_API}/get/${selectedProject}?fromDate=${formatDate}`
    }
    if(toDate!=''){
      url = `${project_API}/get/${selectedProject}?toDate=${toDate}`
    }
    if(formatDate!='' && toDate!=''){
      url = `${project_API}/get/${selectedProject}?fromDate=${formatDate}&toDate=${toDate}`
    }
    if(formatDate=='' && toDate==''){
      url = `${project_API}/get/${selectedProject}`
    }
    // const taskStatisticsBreakdown = document.getElementById('taskStatisticsBreakdown')

    const existingTaskStats = document.getElementById('selectedtaskStatisticsBreakdown');
    const existingProgressBox = document.getElementById('progress-box');
    
    if (existingTaskStats) {
      existingTaskStats.remove();
    }
    
    if (existingProgressBox) {
      existingProgressBox.remove();
    }

    console.log('the id of the project: ',selectedProject);
      let API = url;
      const response = await fetch(API,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // -----------------------------------------------------------------------------------
      const r1 = await response.json();
      console.log('bsdcmndbwckjbc',r1)
  
      const project = r1?.projectDetails;
      const task = r1?.taskStatistics;
      console.log('my task: ',task)
      const taskPercentage = task.percentages
      const taskCount = task.taskCounts

      totalTasks.innerText = task.totalTasks || '0';
      overdueTasksCount.innerText = task.overdueTasks || '0';

      //------------------------------------------------------------------------------------
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

  // if (!progressContainer || !breakdownContainer) {
  //   console.error(
  //     "Missing required elements: .progress or #taskStatisticsBreakdown"
  //   );
  //   return; 
  // }

  // progressContainer.innerHTML = "";
  // breakdownContainer.innerHTML = "";

  if(task.totalTasks !=0){
    breakdownContainer.style.display = 'none';
    progressContainer.style.display = 'none';
    taskStatistics.appendChild(taskStatisticsBreakdown);
    statPercBox.appendChild(progressBox)
    Object.entries(taskPercentage).forEach(([status, perc]) => {
      // const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(2) : 0; 
      const count  = taskCount[status];
      const statusConfig = statusColors[status];
  
      // Add progress bar with corresponding color
      const progressBar = document.createElement("div");
      progressBar.className = `progress-bar ${
        statusConfig?.bgColor || "bg-secondary"
      }`;
      progressBar.style.width = `${perc}%`;
      progressBar.innerText = `${perc}%`;
      progressContainer.appendChild(progressBar);
      progressBar.setAttribute("data-bs-toggle", "tooltip");
      progressBar.setAttribute("data-bs-placement", "top");
      progressBar.setAttribute("title", `${status}: ${perc} tasks`);
      progressBox.appendChild(progressBar);
  
      // Initialize tooltips (Bootstrap-specific)
      if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
        const tooltipElements = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]'
        );
        tooltipElements.forEach((el) => new bootstrap.Tooltip(el));
      }
      // Add task status breakdown with corresponding color
      const breakdown = document.createElement("p");
      breakdown.innerHTML = `
        <i class="fa-regular fa-circle-dot ${
          statusConfig?.color || "text-secondary"
        } me-2"></i>
        ${status} Tasks
        <span class="float-end">${count} (${perc}%)</span>
      `;
      taskStatisticsBreakdown.appendChild(breakdown);
    });
    // Object.entries(taskCount).forEach(([status, cont]) => {})
  }
  // else{}
  // for(let i=0; i<task.totalTasks; i++){
  //   console.log(statusColors[task.percentages])
    // const statusConfig = statusColors[status];
  
    //     // Add progress bar with corresponding color
    //     const progressBar = document.createElement("div");
    //     progressBar.className = `progress-bar ${
    //       statusConfig?.bgColor || "bg-secondary"
    //     }`;
    //     progressBar.style.width = `${task.percentages}%`;
    //     progressBar.innerText = `${task.percentages}%`;
    //     progressContainer.appendChild(progressBar);
    //     progressBar.setAttribute("data-bs-toggle", "tooltip");
    //     progressBar.setAttribute("data-bs-placement", "top");
    //     progressBar.setAttribute("title", `${status}: ${count} tasks`);
    //     progressContainer.appendChild(progressBar);
    
    //     // Initialize tooltips (Bootstrap-specific)
    //     if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
    //       const tooltipElements = document.querySelectorAll(
    //         '[data-bs-toggle="tooltip"]'
    //       );
    //       tooltipElements.forEach((el) => new bootstrap.Tooltip(el));
    //     }
    //     // Add task status breakdown with corresponding color
    //     const breakdown = document.createElement("p");
    //     breakdown.innerHTML = `
    //       <i class="fa-regular fa-circle-dot ${
    //         statusConfig?.color || "text-secondary"
    //       } me-2"></i>
    //       ${status} Tasks
    //       <span class="float-end">${count} (${status}%)</span>
    //     `;
    //     taskStatisticsBreakdown.appendChild(breakdown);
  // }

      //------------------------------------------------------------------------------------

    }catch(error){console.log('Error is ',error)}
//------------------------------------------------------------------------------------------
try{
  remove_loading_shimmer();
} catch(error){console.log(error)}
    });
}