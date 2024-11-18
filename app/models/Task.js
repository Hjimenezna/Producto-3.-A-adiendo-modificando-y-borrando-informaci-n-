// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    responsible: {         // Nuevo campo de responsable
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    panelId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel',
        required: true
    }
});


module.exports = mongoose.model('Task', taskSchema);
