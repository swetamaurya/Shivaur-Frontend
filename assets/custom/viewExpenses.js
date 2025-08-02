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

const url = "http://localhost:6000/sales/expenses";
const token = localStorage.getItem("token");
var res;
window.onload = async()=>{
    const response = await fetch(`${url}/get`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    res = await response.json();
    let id = new URLSearchParams(window.location.search).get('id');
    const expenseName = document.getElementById('expenseName')
    const expenseDescription = document.getElementById('expense-description');
    const uploadedExpenseFiles = document.getElementById('uploaded_expense_files_tbodyone')
    const expensesDetailsTbodyone = document.getElementById('expensesDetailsTbodyone')
    let files = ''
    res.map((e,i)=>{
        if(id === e._id){
            expenseName.innerText = e.expenseName
            expenseDescription.innerText = e.description;
            e.files.map((e,i)=>{
                files+= `<tr>
                          <td>${i+1}</td>
                          <td>
                              <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                          </td>
                          <td class="text-center">
                                      
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i
                                class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a  href="${e}" target="_blank" class="dropdown-item" ><i class="fa-regular fa-eye"></i> View</a>
                                    <a class="dropdown-item"  href="#" data-bs-toggle="modal" data-bs-target="#delete_project"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                                </div>
                            </div>
                          </td>
                          </tr>`;
            })
            uploadedExpenseFiles.innerHTML = files;
            expensesDetailsTbodyone.innerHTML =`
            <tr>
                        <td>Cost:</td>
                        <td class="text-end">${e.amount}</td>
                      </tr>
                       <tr>
                        <td>Name:</td>
                        <td class="text-end">${e.expenseName}</td>
                      </tr>
                      <tr>
                        <td>Purchase Date:</td>
                        <td class="text-end" id="deadline">${e.purchaseDate}</td>
                      </tr>
                      <tr>
                        <td>Purchase By:</td>
                        <td class="text-end">
                          <a href="#">${e.purchaseBy}</a>
                        </td>
                      </tr>
                      <tr>
                        <td>Status:</td>
                        <td class="text-end">${e.status}</td>
                      </tr>
            `
        }
        else{
            console.log('Id Not Found');
        }
    })
}