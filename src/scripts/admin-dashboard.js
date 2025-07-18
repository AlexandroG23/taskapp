import Chart from "chart.js/auto";

let rolesChartInstance = null;
let activityChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  async function fetchUsuarios() {
    const res = await fetch("http://localhost:8090/admin/usuarios", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const msg = document.getElementById("admin-message");
    const list = document.getElementById("user-list");

    if (!res.ok) {
      msg.textContent = "No autorizado";
      msg.classList.remove("hidden");
      return { usuarios: [], activos: [], admins: [] };
    }

    const usuarios = await res.json();
    const activos = usuarios.filter((u) => u.active);
    const admins = usuarios.filter((u) => u.role === "ADMIN");

    document.getElementById("total-users").textContent = usuarios.length;
    document.getElementById("active-users").textContent = activos.length;
    document.getElementById("admin-users").textContent = admins.length;

    list.innerHTML = "";
    activos.forEach((user) => {
      const item = document.createElement("div");
      item.className =
        "border p-2 rounded-2xl dark:bg-neutral-900 text-gray-800 dark:text-white shadow border-neutral-700";

      item.innerHTML = `
        <div class="p-4 md:p-5 flex flex-col gap-3 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow transition hover:shadow-md">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${user.name}</h3>
              <p class="text-sm text-gray-500 dark:text-neutral-400">${user.email}</p>
              <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full 
              ${user.role === "ADMIN"
          ? "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400"
          : "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
        }">
                ${user.role}
              </span>
            </div>
            <div class="flex gap-2">
              <button onclick="desactivarUsuario('${user.email}')" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition">Desactivar</button>
              ${user.role !== "ADMIN"
          ? `<button onclick="promoverUsuario('${user.email}')" class="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-600 transition">Promover</button>`
          : ""
        }
            </div>
          </div>
        </div>
      `;
      list.appendChild(item);
    });

    return { usuarios, activos, admins };
  }

  async function fetchUsuariosInactivos() {
    const res = await fetch("http://localhost:8090/admin/usuarios/inactivos", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const list = document.getElementById("inactive-user-list");

    if (!res.ok) {
      list.innerHTML = "<p class='text-red-500'>Error al cargar usuarios inactivos.</p>";
      return [];
    }

    const inactivos = await res.json();
    document.getElementById("inactive-users").textContent = inactivos.length;

    list.innerHTML = "";

    if (inactivos.length === 0) {
      list.innerHTML = `<p class="text-gray-500 dark:text-gray-400 text-sm">No hay usuarios inactivos aún.</p>`;
      return [];
    }

    inactivos.forEach((user) => {
      const item = document.createElement("div");
      item.className = "border p-2 rounded-2xl dark:bg-neutral-900 text-gray-800 dark:text-white shadow border-neutral-700";
      item.innerHTML = `
        <div class="p-4 md:p-5 flex flex-col gap-3 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow transition hover:shadow-md">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${user.name}</h3>
              <p class="text-sm text-gray-500 dark:text-neutral-400">${user.email}</p>
              <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full 
              ${user.role === "ADMIN"
          ? "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400"
          : "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
        }">${user.role}</span>
            </div>
            <div>
              <button onclick="reactivarUsuario('${user.email}')" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition">Reactivar</button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(item);
    });

    return inactivos;
  }

  async function actualizarDashboard() {
    const [{ usuarios, activos, admins }, inactivos] = await Promise.all([
      fetchUsuarios(),
      fetchUsuariosInactivos(),
    ]);

    renderCharts(
      admins.length,
      usuarios.length - admins.length,
      activos.length,
      inactivos.length
    );
  }

  window.reactivarUsuario = async function (email) {
    const res = await fetch("http://localhost:8090/admin/reactivate/" + email, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (res.ok) {
      showAdminModal("✅ Usuario reactivado", "El usuario fue reactivado correctamente.");
      await actualizarDashboard();
    } else {
      showAdminModal("❌ Error", "No se pudo reactivar el usuario.");
    }
  };

  window.desactivarUsuario = function (email) {
    showConfirmModal(`¿Estás seguro de desactivar a ${email}?`, async () => {
      const res = await fetch("http://localhost:8090/admin/deactivate/" + email, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        showAdminModal("✅ Usuario desactivado", "El usuario fue desactivado correctamente.");
        await actualizarDashboard();
      } else {
        showAdminModal("❌ Error", "No se pudo desactivar el usuario.");
      }
    });
  };

  window.promoverUsuario = async function (email) {
    const res = await fetch("http://localhost:8090/admin/promote/" + email, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (res.ok) {
      showAdminModal("✅ Usuario promovido", "El usuario fue promovido correctamente.");
      await actualizarDashboard();
    } else {
      showAdminModal("❌ Error", "No se pudo promover el usuario.");
    }
  };

  function renderCharts(adminsCount, usersCount, activeCount, inactiveCount) {
    if (rolesChartInstance) rolesChartInstance.destroy();
    if (activityChartInstance) activityChartInstance.destroy();

    const ctx = document.getElementById("rolesChart").getContext("2d");
    rolesChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Admins", "Usuarios"],
        datasets: [{
          label: "Roles",
          data: [adminsCount, usersCount],
          backgroundColor: ["#8b5cf6", "#3b82f6"],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--tw-text-white') || '#fff',
            }
          }
        }
      },
    });

    const actCtx = document.getElementById("activityChart").getContext("2d");
    activityChartInstance = new Chart(actCtx, {
      type: "bar",
      data: {
        labels: ["Activos", "Inactivos"],
        datasets: [{
          label: "Usuarios",
          data: [activeCount, inactiveCount],
          backgroundColor: ["#10b981", "#ef4444"],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { ticks: { color: '#ccc' } },
          x: { ticks: { color: '#ccc' } }
        }
      }
    });
  }

  actualizarDashboard();
});

function showAdminModal(title, message) {
  const modal = document.getElementById("admin-modal");
  document.getElementById("admin-modal-title").textContent = title;
  document.getElementById("admin-modal-message").textContent = message;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function hideAdminModal() {
  const modal = document.getElementById("admin-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

document.getElementById("admin-modal-close").addEventListener("click", hideAdminModal);

let onConfirmCallback = null;

function showConfirmModal(message, onConfirm) {
  const modal = document.getElementById("confirm-modal");
  document.getElementById("confirm-message").textContent = message;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  onConfirmCallback = onConfirm;
}

function hideConfirmModal() {
  const modal = document.getElementById("confirm-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  onConfirmCallback = null;
}

document.getElementById("confirm-cancel").addEventListener("click", hideConfirmModal);
document.getElementById("confirm-accept").addEventListener("click", () => {
  if (typeof onConfirmCallback === "function") {
    onConfirmCallback();
  }
  hideConfirmModal();
});
