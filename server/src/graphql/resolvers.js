import { companyService } from "../services/companyService.js";

export const resolvers = {
  Query: {
    companies: async () => {
      return await companyService.getAllCompanies();
    },

    company: async (_, { id }) => {
      return await companyService.getCompanyById(id);
    },

    companyBySlug: async (_, { slug }) => {
      return await companyService.getCompanyBySlug(slug);
    },
  },

  Mutation: {
    registerCompany: async (_, { input }) => {
      return await companyService.registerCompany(input);
    },

    updateCompany: async (_, { id, input }) => {
      return await companyService.updateCompany(id, input);
    },

    deleteCompany: async (_, { id }) => {
      return await companyService.deleteCompany(id);
    },
  },
};