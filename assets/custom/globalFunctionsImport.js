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
const token = localStorage.getItem("token");

// Import necessary dependencies
import { status_popup, loading_shimmer, remove_loading_shimmer } from "./globalFunctions1.js";
import { import_API } from "./apis.js";


console.log("Import functionality initialized.");

document.addEventListener("DOMContentLoaded", () => {
  const importButton = document.getElementById("downloadSample");
  importButton.addEventListener("click", handleImportFunction);

  async function handleImportFunction(event) {
    event.preventDefault();

    const fileInput = document.getElementById("file_input");
    if (!fileInput || fileInput.files.length === 0) {
      status_popup("Please select a file to import.", false);
      return;
    }

    const file = fileInput.files[0];
    const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type)) {
      status_popup("Invalid file type. Please upload an Excel file.", false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      loading_shimmer(); // Show loading shimmer

      const response = await fetch(`${import_API}/excelFile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        status_popup("Data Imported <br> Successfully!", true);
        console.log(await response.json());

        // Close the modal programmatically
        const modalElement = document.getElementById("import_data");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        } else {
          console.warn("Modal instance not found. Ensure Bootstrap is properly loaded.");
        }

        // Reset the file input
        fileInput.value = "";
      } else {
        const errorData = await response.json().catch(() => ({ message: "Server error with no valid JSON response." }));
        const errorMessage = errorData?.message || "An unknown error occurred.";
        status_popup(`Import failed: <br>${errorMessage}`, false);
      }
    } catch (error) {
      console.error("Error during import:", error);
      status_popup("An error occurred while importing data. Please try again.", false);
    } finally {
      remove_loading_shimmer(); // Remove loading shimmer
    }
  }
});
