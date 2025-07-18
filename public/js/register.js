const form = document.querySelector("form");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8090/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      showModal(
        "Registro exitoso",
        "Tu cuenta ha sido creada correctamente. Serás redirigido al login."
      );
    } else {
      let mensajes = ["Error desconocido"];
      try {
        const errorData = await response.json();

        // Si es error tipo validación con múltiples campos
        if (typeof errorData === "object") {
          mensajes = Object.entries(errorData)
            .filter(([key]) => key !== "status" && key !== "timestamp")
            .map(([_, msg]) => msg);
        }
      } catch (jsonError) {
        mensajes = ["Error inesperado del servidor."];
      }

      showModal("Ocurrió un error  ❌", mensajes);
    }
  } catch (error) {
    showModal("Error", ["Ocurrió un error al conectarse con el servidor."]);
  }
});

modalClose.addEventListener("click", () => {
  hideModal();

  if (modalTitle.textContent === "Registro exitoso") {
    window.location.href = "/login";
  }
});

function showModal(title, messageArray) {
  modalTitle.textContent = title;

  // Mostrar como lista si es array, o como texto simple
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
