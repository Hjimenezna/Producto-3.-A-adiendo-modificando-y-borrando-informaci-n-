const path = require('path');
const Task = require(path.resolve(__dirname, '../../models/Task.js')); // Importa el modelo Task
const Panel = require(path.resolve(__dirname, '../../models/Panel.js')); // Importa el modelo Panel

const taskResolver = {
    Query: {
        getTasks: async () => {
            try {
                const tasks = await Task.find();
                // Convierte las fechas a formato ISO antes de devolverlas
                return tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    responsible: task.responsible,
                    createdAt: task.createdAt.toISOString(), // Convierte a string ISO
                    updatedAt: task.updatedAt.toISOString(), // Convierte a string ISO
                    panelId: task.panelId
                }));
            } catch (error) {
                console.error("Error fetching tasks:", error);
                throw new Error("Error fetching tasks");
            }
        },
        getTask: async (_, { id }) => {
            try {
                const task = await Task.findById(id);
                if (!task) throw new Error(`Task with ID ${id} not found`);
                // Convierte las fechas a formato ISO
                return {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    responsible: task.responsible,
                    createdAt: task.createdAt.toISOString(),
                    updatedAt: task.updatedAt.toISOString(),
                    panelId: task.panelId
                };
            } catch (error) {
                console.error("Error fetching task:", error);
                throw new Error("Error fetching task");
            }
        }
    },

    Mutation: {
        createTask: async (_, { title, description, panelId, responsible }) => { // Remover createdAt ya que se genera automáticamente
            try {
                const newTask = new Task({ title, description, panelId, responsible });
                await newTask.save();

                // Asegúrate de que Panel se ha importado y está disponible
                await Panel.findByIdAndUpdate(panelId, { $push: { tasks: newTask._id } });

                // Convierte a ISO antes de devolver
                return {
                    id: newTask.id,
                    title: newTask.title,
                    description: newTask.description,
                    completed: newTask.completed,
                    responsible: newTask.responsible,
                    createdAt: newTask.createdAt.toISOString(),
                    updatedAt: newTask.updatedAt.toISOString(),
                    panelId: newTask.panelId
                };
            } catch (error) {
                console.error("Error creating task:", error);
                throw new Error("Error creating task");
            }
        },

        updateTask: async (_, { id, title, description, completed, responsible }) => {
            try {
                const updateData = {};
                if (title) updateData.title = title;
                if (description) updateData.description = description;
                if (typeof completed !== 'undefined') updateData.completed = completed;
                if (responsible) updateData.responsible = responsible;

                const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
                if (!updatedTask) throw new Error(`Task with ID ${id} not found`);

                // Convierte a ISO antes de devolver
                return {
                    id: updatedTask.id,
                    title: updatedTask.title,
                    description: updatedTask.description,
                    completed: updatedTask.completed,
                    responsible: updatedTask.responsible,
                    createdAt: updatedTask.createdAt.toISOString(),
                    updatedAt: updatedTask.updatedAt.toISOString(),
                    panelId: updatedTask.panelId
                };
            } catch (error) {
                console.error("Error updating task:", error);
                throw new Error("Error updating task");
            }
        },

        deleteTask: async (_, { id }) => {
            try {
                const deletedTask = await Task.findByIdAndDelete(id);
                if (!deletedTask) throw new Error(`Task with ID ${id} not found`);
                return deletedTask; // Aquí puedes retornar el task si es necesario
            } catch (error) {
                console.error("Error deleting task:", error);
                throw new Error("Error deleting task");
            }
        }
    }
};

module.exports = taskResolver;
