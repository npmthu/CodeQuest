// Check if user is logged in
const token = localStorage.getItem('token');
if (!token) {
  alert("Vui lòng đăng nhập!");
  window.location.href = "login_register.html";
}

document.getElementById("logout").addEventListener("click", (e) => {
  e.preventDefault();
  // Clear token from localStorage
  localStorage.removeItem('token');
  alert("Đăng xuất thành công!");
  window.location.href = "login_register.html";
});
