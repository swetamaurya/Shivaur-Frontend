(function(){
    document.getElementById("pagination_footer").innerHTML = `
                    <div class="col-sm-12 col-md-5">
                        <div class="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite" >
                            Showing <span id="minDataInPage">1</span> to <span id="maxDataInPage">10</span> of <span id="totalDataInApi"></span> entries
                        </div>
                    </div>
                    <div class="col-sm-12 col-md-7">
                        <div class="dataTables_paginate paging_simple_numbers" id="DataTables_Table_0_paginate" >
                            <ul class="pagination justify-content-end">
                                <li class="paginate_button page-item previous disabled" id="DataTables_Table_0_previous" >
                                    <a href="#" aria-controls="DataTables_Table_0" data-dt-idx="0" tabindex="0" class="page-link" ><i class="fa fa-angle-double-left"></i> </a>
                                </li>
                                <li class="paginate_button page-item active">
                                    <a href="#" id="page-limit-show-pagination" aria-controls="DataTables_Table_0" data-dt-idx="1" tabindex="0" class="page-link" >1</a >
                                </li>
                                <li class="paginate_button page-item next disabled" id="DataTables_Table_0_next" >
                                    <a href="#" aria-controls="DataTables_Table_0"  data-dt-idx="2" tabindex="0" class="page-link" > <i class="fa fa-angle-double-right"></i ></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                `;
    
    document.getElementById("DataTables_Table_0_length").innerHTML = 
                `<label >Show entries</label>
                 <select id="pagination_select_option_number" name="DataTables_Table_0_length" aria-controls="DataTables_Table_0" class="ms-2 custom-select custom-select-sm form-select form-control-sm" fdprocessedid="2bf78h" >
                     <option value="10">10</option>
                     <option value="25">25</option>
                     <option value="50">50</option>
                     <option value="100">100</option>
                 </select>
             `;        
})();
// ############################################################################################################################
// ############################################################################################################################
// ############################################################################################################################
// ############################################################################################################################
let apiPageNumber = 1;
let currentPageApiLimit = 10;
let totalDataCount;
// =================================================================================
// ------------------------------------------------
export function setApiPageNumber(z1) {
    apiPageNumber = z1;
}
export function getApiPageNumber() {
    return apiPageNumber;
}
// ------------------------------------------------
export function setCurrentPageApiLimit(z1){
    currentPageApiLimit = z1;
}
export function getCurrentPageApiLimit(){
    return currentPageApiLimit;
}
// ------------------------------------------------
export function setTotalDataCount(z1){
    document.getElementById("totalDataInApi").innerText = z1;
    totalDataCount = z1;
}
export function getTotalDataCount(){
    return totalDataCount;
}
// ------------------------------------------------
// =================================================================================
let select_option = document.getElementById("pagination_select_option_number");
let number_of_buttons_l_f = document.getElementById("page-limit-show-pagination");
let left_btn_of_l_f = document.getElementById("DataTables_Table_0_previous");
let right_btn_of_l_f = document.getElementById("DataTables_Table_0_next");
// =================================================================================
select_option.addEventListener("input", function() {
    setCurrentPageApiLimit(select_option.value);
    setApiPageNumber(1);
    number__load_handle();
})
// --------------------------------------------------------------------------------
left_btn_of_l_f.addEventListener("click", function() {
    if(getApiPageNumber()==1){
        return;
    }
    setApiPageNumber(getApiPageNumber()-1);
    number__load_handle();
});
// --------------------------------------------------------------------------------
right_btn_of_l_f.addEventListener("click", function() {
    let a1 = (Number(number_of_buttons_l_f.innerText) * Number(select_option.value));
    if(a1>=getTotalDataCount()){
        return;
    }
    setApiPageNumber(getApiPageNumber()+1);
    number__load_handle();
})
// =================================================================================
let table_data_reload;
export function pagination_data_handler_function(table_data_function) {
    table_data_reload = table_data_function;
}
// --------------------------------------------------------------------------------
function number__load_handle(){
    document.getElementById("minDataInPage").innerText = ((Number(getApiPageNumber())-1) * Number(pagination_select_option_number.value))+1;
    document.getElementById("maxDataInPage").innerText = Number(pagination_select_option_number.value) * Number(getApiPageNumber()) ;
    number_of_buttons_l_f.innerText = getApiPageNumber();
    load_all_data();``
}
function load_all_data(){
    table_data_reload();
}
// --------------------------------------------------------------------------------
export function rtnPaginationParameters() {
    let z2 = `?limit=${getCurrentPageApiLimit()}&page=${getApiPageNumber()}`;
    return z2;
}
// ##################################################################################
// ##################################################################################
export function forGloablDelete_js(){
    setApiPageNumber(1);
    setCurrentPageApiLimit(10);
    select_option.value = getCurrentPageApiLimit();
    number__load_handle();
}

