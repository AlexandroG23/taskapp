const form = document.querySelector("form");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8090/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      // Guarda token si es necesario
      localStorage.setItem("token", data.token);

      showModal("Inicio de sesión exitoso", "Serás redirigido al dashboard.");
    } else {
      let mensajes = ["Error desconocido"];
      try {
        const errorData = await response.json();

        if (typeof errorData === "object") {
          mensajes = Object.entries(errorData)
            .filter(([key]) => key !== "status" && key !== "timestamp")
            .map(([_, msg]) => msg);
        }
      } catch {
        mensajes = ["Error inesperado del servidor."];
      }

      showModal("Ocurrió un error  ❌", mensajes);
    }
  } catch {
    showModal("Error", ["No se pudo conectar con el servidor."]);
  }
});

modalClose.addEventListener("click", () => {
  hideModal();

  if (modalTitle.textContent === "Inicio de sesión exitoso") {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        if (payload.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        console.error("Error al decodificar el token", err);
        window.location.href = "/dashboard"; // fallback
      }
    } else {
      window.location.href = "/login"; // fallback si no hay token
    }
  }
});


function showModal(title, messageArray) {
  modalTitle.textContent = title;

  if (Array.isArray(messageArray)) {
    modalMessage.innerHTML = `
      <ul class="list-disc list-inside text-left space-y-1">
        ${messageArray.map((msg) => `<li>${msg}</li>`).join("")}
      </ul>
    `;
  } else {
    modalMessage.textContent = messageArray;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function hideModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}