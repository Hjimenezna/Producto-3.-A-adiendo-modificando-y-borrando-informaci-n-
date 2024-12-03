const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Título de la tarea
    description: { type: String, default: '' }, // Descripción opcional
    completed: { type: Boolean, default: false }, // Estado de completitud
    responsible: { type: String, required: true }, // Responsable asignado
    createdAt: { type: Date, default: Date.now }, // Fecha de creación
    updatedAt: { type: Date, default: Date.now }, // Fecha de última actualización
    panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel', required: true }, // ID del panel al que pertenece la tarea
    status: {
        type: String,
        enum: ['por_hacer', 'en_proceso', 'finalizado'], // Estados válidos para la tarea
        default: 'por_hacer', // Estado predeterminado
    },
});

// Middleware para actualizar automáticamente `updatedAt` antes de guardar
taskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Exportar el modelo basado en el esquema definido
module.exports = mongoose.model('Task', taskSchema);
