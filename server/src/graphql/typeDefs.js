import { gql } from "apollo-server-express";

export const typeDefs = gql`
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

  input RegisterCompanyInput {
    name: String!
    slug: String
    branding: JSON
    sections: JSON
  }

  input UpdateCompanyInput {
    name: String
    slug: String
    branding: JSON
    sections: JSON
  }

  type Query {
    companies: [Company!]!
    company(id: ID!): Company
    companyBySlug(slug: String!): Company
  }

  type Mutation {
    registerCompany(input: RegisterCompanyInput!): Company!
    updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
    deleteCompany(id: ID!): Boolean!
  }
`;
