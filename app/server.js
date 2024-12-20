require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

// Configuración y esquemas
const config = require('./config/config');
const rootSchema = require('./graphql/schemas/rootSchema');
const panelSchema = require('./graphql/schemas/panelSchema');
const taskSchema = require('./graphql/schemas/taskSchema');
const resolvers = require('./graphql/resolvers/resolvers');
const Task = require('./models/Task'); // Modelo de tareas

// Configurar Express
const app = express();

// Habilitar CORS
const corsOptions = {
    origin: 'http://127.0.0.1:5501', // Cambia esto al origen correcto del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));


// Sirve la carpeta 'www' como base para archivos estáticos
app.use(express.static(path.join(__dirname, 'www')));

// Configurar rutas específicas para cargar archivos JS correctamente
app.use('/configFrontend.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'configFrontend.js'));
});
app.use('/tasks.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'tasks.js'));
});
app.use('/tablero.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'www', 'tablero.js'));
});

// Configuración de subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Generar un nombre único para evitar conflictos
    }
});
const upload = multer({ storage });

// Ruta para manejar la subida de archivos
app.post('/upload/:taskId', upload.single('file'), async (req, res) => {
    try {
        const { taskId } = req.params;
        const filePath = `/uploads/${req.file.filename}`; // Ruta relativa al archivo subido

        // Actualizar la tarea en la base de datos para incluir el archivo
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $push: { files: filePath } },
            { new: true }
        );

        res.status(200).json({ message: 'Archivo subido correctamente.', task: updatedTask });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.status(500).json({ message: 'Error al subir el archivo.' });
    }
});

// Ruta para servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicio del servidor y configuración de Apollo Server
async function startServer() {
    try {
        // Conexión a MongoDB
        await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Conectado a MongoDB');

        // Crear el esquema de GraphQL
        const schema = makeExecutableSchema({
            typeDefs: mergeTypeDefs([rootSchema, panelSchema, taskSchema]),
            resolvers,
        });

        // Configurar Apollo Server
        const server = new ApolloServer({ schema });
        await server.start();
        server.applyMiddleware({ app });

        // Iniciar el servidor
        const port = config.PORT || 4000;
        app.listen(port, () => {
            console.log(`🚀 Servidor listo en http://localhost:${port}${server.graphqlPath}`);
            console.log(`📂 Archivos subidos disponibles en http://localhost:${port}/uploads/`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

startServer();
