// tablero.js
const apiUrl = 'http://localhost:4000/graphql'; // Cambia esto a la URL de tu servidor GraphQL

// Obtener el ID del panel desde la URL
const urlParams = new URLSearchParams(window.location.search);
const panelId = urlParams.get('panelId');

// Establecer el ID del panel en el campo oculto
document.getElementById('panelId').value = panelId;

// Función para mostrar el título del panel
async function setPanelTitle() {
    const query = `
        query {
            getPanel(id: "${panelId}") {
                name
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
        document.getElementById('panelTitle').innerText = `Tablero - ${data.getPanel.name}`;
    } catch (error) {
        console.error('Error fetching panel title:', error);
    }
}

// Inicializar el tablero con tareas
async function displayTasks() {
    const tasks = await fetchTasks(panelId); // Asegúrate de que esta función esté bien definida
    const porHacerCol = document.getElementById('porHacer');
    const enProcesoCol = document.getElementById('enProceso');
    const finalizadoCol = document.getElementById('finalizado');

    // Limpiar las columnas
    porHacerCol.innerHTML = '';
    enProcesoCol.innerHTML = '';
    finalizadoCol.innerHTML = '';

    tasks.forEach(task => {
        if (task.panelId === panelId) { // Asegúrate de que el panelId sea correcto
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
        <p class="card-text"><strong>Creado el:</strong> ${new Date(task.createdAt).toLocaleDateString()}</p> <!-- Mostrar fecha de creación -->
        <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">Eliminar</button>
        <button class="btn btn-primary btn-sm" onclick='openEditModal(${JSON.stringify(task)})'>Editar</button>
    </div>
`;
            // Añadir a la columna correspondiente
            if (task.completed) {
                finalizadoCol.appendChild(taskCard);
            } else if (task.estado === 'enProceso') {
                enProcesoCol.appendChild(taskCard);
            } else {
                porHacerCol.appendChild(taskCard);
            }
        }
    });
}

// Almacenando la tarea al hacer clic en guardar
document.getElementById('saveTaskButton').addEventListener('click', async function () {
    const taskId = this.dataset.taskId;
    const title = document.getElementById('newTaskTitle').value;
    const description = document.getElementById('newTaskDescription').value;
    const responsible = document.getElementById('newTaskResponsible').value; // Nuevo campo
    const panelId = document.getElementById('panelId').value;

    try {
        if (taskId) {
            // Actualizar tarea existente
            await updateTask(taskId, title, description, false);
            delete this.dataset.taskId;
            this.textContent = "Guardar";
        } else {
            // Crear tarea nueva con responsible
            await createTask(title, description, panelId, responsible);
        }

        await displayTasks();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        modal.hide();

    } catch (error) {
        console.error('Error al guardar la tarea:', error);
    }
});
