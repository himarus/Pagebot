function updateTime() {
    let now = new Date();
    document.getElementById("datetime").innerText = now.toLocaleString();
}

setInterval(updateTime, 1000);
updateTime();

document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});
