const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar JSON

  type Company {
    id: ID!
    name: String!
    slug: String!
    branding: JSON
    sections: JSON
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    companies: [Company!]!
    company(id: ID, slug: String): Company
  }

  type Mutation {
    createCompany(
      name: String!
      slug: String!
      branding: JSON
      sections: JSON
    ): Company!
    updateCompany(
      id: ID!
      name: String
      slug: String
      branding: JSON
      sections: JSON
    ): Company!
    deleteCompany(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
