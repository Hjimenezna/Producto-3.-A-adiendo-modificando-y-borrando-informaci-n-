const { gql } = require('apollo-server-express');

const taskSchema = gql`
    type Task {
        id: ID!
        title: String!
        description: String
        completed: Boolean
        responsible: String
        createdAt: String
        updatedAt: String
        panelId: ID!
        status: String! # Campo obligatorio para el estado
    }

    extend type Query {
        getTasks: [Task] # Obtener todas las tareas
        getTask(id: ID!): Task # Obtener una tarea por ID
    }

    extend type Mutation {
        createTask(
            title: String!,
            description: String,
            panelId: ID!,
            responsible: String!,
            status: String! # Estado obligatorio
        ): Task

        updateTask(
            id: ID!,
            title: String,
            description: String,
            completed: Boolean,
            responsible: String,
            status: String
        ): Task

        deleteTask(id: ID!): Task
    }
`;

module.exports = taskSchema;
