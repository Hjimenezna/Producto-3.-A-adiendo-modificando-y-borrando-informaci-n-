const { gql } = require('apollo-server-express');

const taskSchema = gql`
    type Task {
        id: ID!
        title: String!
        description: String
        completed: Boolean
        responsible: String    # Nuevo campo
        createdAt: String
        updatedAt: String
        panelId: ID!
    }

    extend type Query {
        getTasks: [Task]
        getTask(id: ID!): Task
    }

    extend type Mutation {
        createTask(title: String!, description: String, panelId: ID!, responsible: String!): Task # Nuevo campo en el input de creación
        updateTask(id: ID!, title: String, description: String, completed: Boolean, responsible: String,): Task
        deleteTask(id: ID!): Task
    }
`;

module.exports = taskSchema;
