const apiUrl = 'http://localhost:4000/graphql'; // Asegúrate de que esta línea esté incluida solo una vez

// Obtener el panelId de la URL
const panelId = new URLSearchParams(window.location.search).get('panelId');
if (!panelId) {
    console.error("Error: 'panelId' no está definido en la URL.");
    alert("No se puede cargar el tablero porque falta el ID del panel en la URL.");
    throw new Error("El ID del panel es obligatorio.");
}

// Función para obtener todas las tareas desde el backend
async function fetchTasks() {
    const query = `
        query {
            getTasks {
                id
                title
                description
                completed
                panelId
                responsible
                createdAt
                status
            }
        }
    `;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        const { data } = await response.json();
        return data.getTasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Función para crear una nueva tarea
async function createTask(title, description, panelId, responsible, status) {
    const mutation = `
        mutation {
            createTask(title: "${title}", description: "${description}", panelId: "${panelId}", responsible: "${responsible}", status: "${status}") {
                id
                title
                description
                status
                completed
                responsible
                createdAt
                panelId
            }
        }
    `;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation }),
        });

        const { data } = await response.json();
        return data.createTask;
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

// Función para actualizar una tarea
async function updateTask(id, title, description, completed, responsible, status) {
    const mutation = `
        mutation {
            updateTask(id: "${id}", title: "${title}", description: "${description}", completed: ${completed}, responsible: "${responsible}", status: "${status}") {
                id
                title
                description
                completed
                responsible
                panelId
                status
            }
        }
    `;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation }),
        });

        const { data } = await response.json();
        return data.updateTask;
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Función para eliminar una tarea
async function deleteTask(id) {
    // Mostrar la alerta de confirmación usando SweetAlert2
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, proceder con la eliminación
            const mutation = `
                mutation {
                    deleteTask(id: "${id}") {
                        id
                    }
                }
            `;
            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: mutation }),
                });

                // Actualizar las tareas después de eliminar
                await displayTasks();

                // Mostrar una alerta de éxito
                Swal.fire(
                    '¡Eliminada!',
                    'La tarea ha sido eliminada con éxito.',
                    'success'
                );
            } catch (error) {
                console.error('Error eliminando la tarea:', error);

                // Mostrar una alerta de error
                Swal.fire(
                    'Error',
                    'Hubo un problema al intentar eliminar la tarea.',
                    'error'
                );
            }
        }
    });
}


// Función para mostrar las tareas en las columnas
async function displayTasks() {
    const tasks = await fetchTasks();
    const porHacerCol = document.getElementById('por_hacer');
    const enProcesoCol = document.getElementById('en_proceso');
    const finalizadoCol = document.getElementById('finalizado');

    porHacerCol.innerHTML = '';
    enProcesoCol.innerHTML = '';
    finalizadoCol.innerHTML = '';

    tasks.forEach(task => {
        if (task.panelId === panelId) {
            const taskCard = document.createElement('div');
            taskCard.classList.add('card', 'mb-3', 'draggable');
            taskCard.setAttribute('id', task.id);
            taskCard.setAttribute('draggable', 'true');
            taskCard.ondragstart = drag;

            taskCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text"><strong>Responsable:</strong> ${task.responsible}</p>
                    <p class="card-text"><strong>Estado:</strong> ${task.status}</p>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">Eliminar</button>
                    <button class="btn btn-primary btn-sm" onclick='openEditModal(${JSON.stringify(task)})'>Editar</button>
                </div>
            `;

            if (task.status === 'por_hacer') {
                porHacerCol.appendChild(taskCard);
            } else if (task.status === 'en_proceso') {
                enProcesoCol.appendChild(taskCard);
            } else if (task.status === 'finalizado') {
                finalizadoCol.appendChild(taskCard);
            }
        }
    });
}

// Función para abrir el modal en modo edición
function openEditModal(task) {
    document.getElementById('newTaskTitle').value = task.title || '';
    document.getElementById('newTaskDescription').value = task.description || '';
    document.getElementById('panelId').value = task.panelId || '';
    document.getElementById('newTaskEstado').value = task.status || '';

    const saveButton = document.getElementById('saveTaskButton');
    saveButton.dataset.taskId = task.id || '';
    saveButton.textContent = "Actualizar Tarea";

    const editModal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    editModal.show();
}

// Evento para guardar o actualizar una tarea
document.getElementById('saveTaskButton').addEventListener('click', async function () {
    const taskId = this.dataset.taskId;
    const title = document.getElementById('newTaskTitle').value;
    const description = document.getElementById('newTaskDescription').value;
    const responsible = document.getElementById('newTaskResponsible').value;
    const status = document.getElementById('newTaskEstado').value;

    try {
        if (taskId) {
            await updateTask(taskId, title, description, false, responsible, status);
            delete this.dataset.taskId;
            this.textContent = "Guardar";
        } else {
            await createTask(title, description, panelId, responsible, status);
        }
        await displayTasks();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        modal.hide();
    } catch (error) {
        console.error('Error al guardar la tarea:', error);
    }
});

// Definición de la función drag
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Definición de la función drop
function allowDrop(ev) {
    ev.preventDefault();
}

async function drop(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const targetColumn = ev.target.id;

    const statusMap = {
        por_hacer: 'por_hacer',
        en_proceso: 'en_proceso',
        finalizado: 'finalizado',
    };

    const newStatus = statusMap[targetColumn];
    if (!newStatus) {
        console.error("Estado de destino no válido:", targetColumn);
        return;
    }

    const tasks = await fetchTasks();
    const updatedTask = tasks.find(t => t.id === taskId);
    if (updatedTask) {
        await updateTask(updatedTask.id, updatedTask.title, updatedTask.description, false, updatedTask.responsible, newStatus);
        displayTasks();
    }
}

// Llamada inicial para mostrar las tareas
window.onload = async function () {
    document.getElementById('panelId').value = panelId;
    await displayTasks();
};
