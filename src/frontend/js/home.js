document.getElementById("logout").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Đăng xuất thành công!");
  window.location.href = "index.html"; // quay lại trang login
});
