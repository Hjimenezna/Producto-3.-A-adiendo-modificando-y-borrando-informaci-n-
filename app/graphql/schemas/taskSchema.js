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
        status: String! # Nuevo campo
    }

    extend type Query {
        getTasks: [Task]
        getTask(id: ID!): Task
    }

    extend type Mutation {
        createTask(title: String!, description: String, panelId: ID!, responsible: String!, status: String): Task
        updateTask(id: ID!, title: String, description: String, completed: Boolean, responsible: String, status: String): Task
        deleteTask(id: ID!): Task
    }
`;


module.exports = taskSchema;
