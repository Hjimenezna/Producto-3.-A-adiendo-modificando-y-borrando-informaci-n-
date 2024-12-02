// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    responsible: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel', required: true },
    status: { type: String, enum: ['por_hacer', 'en_proceso', 'finalizado'], default: 'por_hacer' }, // Nuevo campo
});


module.exports = mongoose.model('Task', taskSchema);
