// Archivo: js/tasks.js

const apiUrl = 'http://localhost:4000/graphql'; // Cambia esto a la URL de tu servidor GraphQL



// Obtener todas las tareas desde el backend
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

// Crear una nueva tarea con el campo responsible
async function createTask(title, description, panelId, responsible) {  // Añadir responsible como parámetro
    const mutation = `
        mutation {
            createTask(title: "${title}", description: "${description}", panelId: "${panelId}", responsible: "${responsible}") {
                id
                title
                description
                completed
                responsible       # Añadir responsible aquí
                createdAt          # Añadir fecha de creación
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

// Función para eliminar una tarea con SweetAlert2
async function deleteTask(id) {
    // Mostrar alerta de confirmación
    Swal.fire({
        title: '¿Eliminar esta tarea?',
        text: "Esta acción no puede deshacerse.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#007bff', // Color del botón de confirmación (azul)
        cancelButtonColor: '#d33',     // Color del botón de cancelación (rojo)
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Mutación para eliminar la tarea si el usuario confirma
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

                // Actualizar la visualización de las tareas
                displayTasks();

                // Alerta de éxito después de la eliminación
                Swal.fire({
                    title: 'Eliminada!',
                    text: 'La tarea ha sido eliminada.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745' // Color del botón "OK" en el popup de éxito (verde)
                });
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    });
}

// Manejo de arrastrar y soltar (drag and drop)
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const targetColumn = ev.target.id;
    const taskElement = document.getElementById(taskId);
    ev.target.appendChild(taskElement);

    // Actualizar el estado de la tarea según la columna de destino
    updateTaskColumn(taskId, targetColumn);
}

async function updateTask(id, title, description, completed, responsible, createdAt) {
    const mutation = `
        mutation {
            updateTask(id: "${id}", title: "${title}", description: "${description}", completed: ${completed}, responsible: "${responsible}") {
                id
                title
                description
                completed
                responsible
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
        return data.updateTask;
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


// Abrir el modal en modo de edición
function openEditModal(task) {
    document.getElementById('newTaskTitle').value = task.title;
    document.getElementById('newTaskDescription').value = task.description;
    document.getElementById('panelId').value = task.panelId;

    // Configura el botón de guardar para actualizar la tarea existente
    const saveButton = document.getElementById('saveTaskButton');
    saveButton.dataset.taskId = task.id;
    saveButton.textContent = "Actualizar Tarea";

    const editModal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    editModal.show();
}


// Función para mostrar tareas en las columnas
async function displayTasks() {
    const tasks = await fetchTasks(); // Recupera las tareas
    const porHacerCol = document.getElementById('porHacer');
    const enProcesoCol = document.getElementById('enProceso');
    const finalizadoCol = document.getElementById('finalizado');

    // Obtener el panelId del campo oculto o del contexto actual
    const currentPanelId = document.getElementById('panelId').value;

    // Limpiar las columnas
    porHacerCol.innerHTML = '';
    enProcesoCol.innerHTML = '';
    finalizadoCol.innerHTML = '';

    // Filtrar y mostrar tareas en las columnas correspondientes
    tasks.forEach(task => {
        if (task.panelId === currentPanelId) { // Filtrar solo por el panelId correspondiente
            const taskCard = document.createElement('div');
            taskCard.classList.add('card', 'mb-3', 'draggable');
            taskCard.setAttribute('id', task.id);
            taskCard.setAttribute('draggable', 'true');
            taskCard.ondragstart = drag;

            taskCard.innerHTML = `
    <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><strong>Responsable:</strong> ${task.responsible}</p>   <!-- Mostrar responsable -->
        <p class="card-text"><strong>Creado el:</strong> ${new Date(task.createdAt).toLocaleString()}</p> <!-- Mostrar fecha y hora de creación -->
        <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">Eliminar</button>
        <button class="btn btn-primary btn-sm" onclick='openEditModal(${JSON.stringify(task)})'>Editar</button>
    </div>
`;

            // Añadir la tarea a la columna correspondiente
            if (task.completed) {
                finalizadoCol.appendChild(taskCard);
            } else {
                porHacerCol.appendChild(taskCard);
            }
        }
    });
}


document.getElementById('saveTaskButton').addEventListener('click', async function () {
    const taskId = this.dataset.taskId;
    const title = document.getElementById('newTaskTitle').value;
    const description = document.getElementById('newTaskDescription').value;
    const responsible = document.getElementById('newTaskResponsible').value; // Obtener responsable aquí
    const panelId = document.getElementById('panelId').value;

    try {
        if (taskId) {
            // Actualizar tarea existente, pasando todos los datos nuevos, incluyendo responsible y createdAt
            await updateTask(taskId, title, description, false, responsible);
            delete this.dataset.taskId;
            this.textContent = "Guardar";
        } else {
            // Crear una nueva tarea, pero verifica si panelId está disponible
            if (!panelId) {
                console.error('Error: panelId no está definido');
                alert('Esto es una prueba ESTATICA DE HTML, para crear nuevas tareas, crear un nuevo proyecto! ');
                return; // Detener la ejecución si no hay panelId
            }
            await createTask(title, description, panelId, responsible); // Pasar responsible aquí
        }

        await displayTasks(); // Refrescar la lista de tareas
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        modal.hide();

    } catch (error) {
        console.error('Error al guardar la tarea:', error);
    }
});


