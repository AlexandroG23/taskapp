document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const form = document.getElementById("account-form");
    const msg = document.getElementById("update-msg");
  
    // Obtener datos actuales
    try {
      const res = await fetch("http://localhost:8090/user/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
  
      if (res.ok) {
        const user = await res.json();
        nameInput.value = user.name;
        emailInput.value = user.email;
      }
    } catch (err) {
      console.error("Error al obtener datos del usuario", err);
    }
  
    // Enviar actualización
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value.trim() || null,
      };
  
      const res = await fetch("http://localhost:8090/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });
  
      if (res.ok) {
        msg.classList.remove("hidden");
        passwordInput.value = ""; // Limpiar campo
      } else {
        alert("Error al actualizar");
      }
    });
  });

  // Extraer el payload del JWT para obtener el rol
  const token = localStorage.getItem("token");

  if (token) {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    const role = payload.role; // Aquí sí: lo que tú generas en tu token
  
    const link = document.getElementById("dashboard-link");
    link.href = role === "ADMIN" ? "/admin" : "/dashboard";
  }
  