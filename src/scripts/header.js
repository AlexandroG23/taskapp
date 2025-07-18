document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const msg = document.getElementById("welcome-message");

  if (!token || !msg) return;

  try {
    const res = await fetch("http://localhost:8090/user/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) {
      msg.textContent = "Error al cargar usuario";
      return;
    }

    const user = await res.json();
    const icon = user.role === "ADMIN" ? "🛡️" : "👤";

    msg.textContent = `${icon} ${user.role === "ADMIN" ? "Admin" : user.name}`;

  } catch (error) {
    msg.textContent = "Error de conexión";
  }
});
