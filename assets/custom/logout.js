const logout = Array.from(document.querySelectorAll(".logoutBtn"));
logout.map(e=>{
    e.addEventListener("click",function(){
        localStorage.clear();
        window.location.href = 'index.html';
    })
});