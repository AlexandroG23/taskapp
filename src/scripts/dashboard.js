const API_URL = "http://localhost:8090/tasks";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const taskList = document.getElementById("task-list");

  const titleInput = document.getElementById("title");
  const descInput = document.getElementById("description");
  const dueDateInput = document.getElementById("dueDate"); // NUEVO
  const createForm = document.getElementById("create-task-form");

  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-task-form");
  const editIdInput = document.getElementById("edit-task-id");
  const editTitleInput = document.getElementById("edit-title");
  const editDescInput = document.getElementById("edit-description");
  const editDueDateInput = document.getElementById("edit-due-date"); // NUEVO
  const editCancelBtn = document.getElementById("edit-cancel");

  const deleteModal = document.getElementById("confirm-modal");
  const cancelDeleteBtn = document.getElementById("confirm-cancel");
  const confirmDeleteBtn = document.getElementById("confirm-accept");


  const taskModal = document.getElementById("task-modal");
  const taskModalTitle = document.getElementById("task-modal-title");
  const taskModalMessage = document.getElementById("task-modal-message");
  const taskModalClose = document.getElementById("task-modal-close");

  let taskToDeleteId = null;

  if (!token) {
    taskList.innerHTML = "<p class='text-red-500'>Token no encontrado. Por favor inicia sesión.</p>";
    return;
  }

  const fetchAndRenderTasks = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("No autorizado");

      const data = await response.json();



      taskList.innerHTML = "";
      const completedList = document.getElementById("completed-task-list");
      completedList.innerHTML = "";

      if (data.length === 0) {
        taskList.innerHTML = "<p class='text-gray-500'>No hay tareas aún.</p>";
        return;
      }

      data.forEach((task) => {
        const taskEl = document.createElement("div");
        const baseClass = "p-4 rounded-lg shadow flex flex-col justify-between";
        const taskClass = task.completed
          ? "dark:bg-green-900 border-l-4 border-green-500"
          : "bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-white";

        taskEl.className = `${baseClass} ${taskClass}`;

        taskEl.setAttribute("data-task-id", task.id);

        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        const dueText = task.dueDate
          ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vence: ${task.dueDate} ${isOverdue ? '<span class="text-red-500">(Vencida)</span>' : ''}
            </p>`
          : "";

        taskEl.innerHTML = `
          <div class="mb-4 cursor-pointer" data-view-task>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${task.title}</h3>
            <p class="text-gray-700 dark:text-gray-300 line-clamp-3 max-h-20 overflow-hidden">${task.description}</p>
            ${dueText}
          </div>
          <div class="mt-auto pt-2 border-t border-gray-300 dark:border-gray-600 flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                class="completed-checkbox accent-blue-600"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
                ${isOverdue && !task.completed ? "disabled" : ""}
              />
              ${task.completed ? "Desmarcar tarea completada" : "Marcar como completada"}
            </label>
        
            ${!task.completed
            ? `<div class="flex justify-between">
                     <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mt-2"
                       data-id="${task.id}"
                       data-title="${task.title}"
                       data-description="${task.description}"
                       data-duedate="${task.dueDate || ''}">
                       Editar
                     </button>
                     <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2"
                       data-id="${task.id}">
                       Eliminar
                     </button>
                   </div>`
            : ""
          }
          </div>
        `;

        (task.completed ? completedList : taskList).appendChild(taskEl);
      });
    } catch (err) {
      taskList.innerHTML = `<p class='text-red-500'>Error: ${err.message}</p>`;
    }
  };

  fetchAndRenderTasks();

  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newTask = {
      title: titleInput.value,
      description: descInput.value,
      dueDate: dueDateInput.value || null,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    });

    if (response.ok) {
      createForm.reset();
      fetchAndRenderTasks();
      showTaskModal("✅ Tarea creada", "La tarea fue registrada correctamente.");
    } else {
      showTaskModal("❌ Error", "No se pudo crear la tarea.");
    }
  });

  taskList.addEventListener("click", (e) => {
    const target = e.target;

    if (target.closest("[data-view-task]")) {
      const parent = target.closest("[data-view-task]");
      const title = parent.querySelector("h3")?.innerText || "";
      const desc = parent.querySelector("p")?.innerText || "";

      taskModalTitle.textContent = title;
      taskModalMessage.textContent = desc;
      taskModal.classList.remove("hidden");
      taskModal.classList.add("flex");
    }

    const editBtn = target.closest(".edit-btn");
    if (editBtn) {
      const { id, title, description, duedate } = editBtn.dataset;
      editIdInput.value = id;
      editTitleInput.value = title;
      editDescInput.value = description;
      editDueDateInput.value = duedate || "";
      editModal.classList.remove("hidden");
      editModal.classList.add("flex");
    }

    const deleteBtn = target.closest(".delete-btn");
    if (deleteBtn) {
      taskToDeleteId = deleteBtn.dataset.id;
      deleteModal.classList.remove("hidden");
      deleteModal.classList.add("flex");
    }
  });


  taskList.addEventListener("change", (e) => {
    if (e.target.classList.contains("completed-checkbox")) {
      toggleTaskCompletion(e.target, token);
    }
  });

  const completedList = document.getElementById("completed-task-list");

  completedList.addEventListener("change", (e) => {
    if (e.target.classList.contains("completed-checkbox")) {
      toggleTaskCompletion(e.target, token);
    }
  });

  const toggleTaskCompletion = async (checkbox, token) => {
    const taskId = checkbox.dataset.id;
    const completed = checkbox.checked;

    const taskCard = checkbox.closest("div[data-task-id]");
    const title = taskCard.querySelector("h3")?.textContent || "";
    const description = taskCard.querySelector("p")?.textContent || "";

    const dueDateEl = taskCard.querySelector("p.text-sm");
    let dueDate = null;
    if (dueDateEl && dueDateEl.textContent.includes("Vence:")) {
      dueDate = dueDateEl.textContent.replace("Vence:", "").replace("(Vencida)", "").trim();
    }

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dueDate, completed }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Error al actualizar tarea");
      }

      fetchAndRenderTasks();
    } catch (error) {
      alert(error.message.includes("vencida")
        ? "⚠️ No se puede marcar como completada una tarea vencida."
        : "Error al cambiar estado de la tarea.");
      console.error(error);
      checkbox.checked = !completed; // Revertir el cambio visual si hay error
    }
  };


  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedTask = {
      title: editTitleInput.value,
      description: editDescInput.value,
      dueDate: editDueDateInput.value || null,
    };

    const id = editIdInput.value;

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      editModal.classList.add("hidden");
      editModal.classList.remove("flex");
      fetchAndRenderTasks();
    } else {
      alert("Error al actualizar la tarea");
    }
  });

  editCancelBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editModal.classList.remove("flex");
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
    deleteModal.classList.remove("flex");
    taskToDeleteId = null;
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!taskToDeleteId) return;

    const response = await fetch(`${API_URL}/${taskToDeleteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      deleteModal.classList.add("hidden");
      deleteModal.classList.remove("flex");
      taskToDeleteId = null;
      fetchAndRenderTasks();
      showTaskModal("🗑️ Tarea eliminada", "La tarea fue eliminada correctamente.");
    } else {
      showTaskModal("❌ Error", "No se pudo eliminar la tarea.");
    }
  });

  taskModalClose.addEventListener("click", () => {
    taskModal.classList.add("hidden");
    taskModal.classList.remove("flex");
  });

  function showTaskModal(title, message) {
    const taskModal = document.getElementById("task-modal");
    const taskModalTitle = document.getElementById("task-modal-title");
    const taskModalMessage = document.getElementById("task-modal-message");

    taskModalTitle.textContent = title;
    taskModalMessage.textContent = message;

    taskModal.classList.remove("hidden");
    taskModal.classList.add("flex");
  }
});

