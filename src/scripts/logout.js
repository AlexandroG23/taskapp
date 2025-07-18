
  /**
   * Logout the user by removing the token from localStorage and redirecting to the login page
   */
  export function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
    }
  }); 