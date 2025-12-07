import { supabase, CompanyModel } from "../models/Company.js";

export const companyService = {
  async getAllCompanies() {
    try {
      const { data, error } = await supabase
        .from(CompanyModel.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
  },

  async getCompanyById(id) {
    try {
      const { data, error } = await supabase
        .from(CompanyModel.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Company not found");
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch company: ${error.message}`);
    }
  },

  async getCompaniesByIndustry(industry) {
    try {
      const { data, error } = await supabase
        .from(CompanyModel.tableName)
        .select("*")
        .ilike("industry", `%${industry}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch companies by industry: ${error.message}`
      );
    }
  },

  async registerCompany(companyData) {
    try {
      // Validate input data
      const validationErrors = CompanyModel.validateCompany(companyData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      // Check if company with email already exists
      const { data: existingCompany } = await supabase
        .from(CompanyModel.tableName)
        .select("id")
        .eq("email", companyData.email.toLowerCase().trim())
        .single();

      if (existingCompany) {
        throw new Error("Company with this email already exists");
      }

      // Prepare and insert data
      const preparedData = CompanyModel.prepareData(companyData);
      const { data, error } = await supabase
        .from(CompanyModel.tableName)
        .insert([preparedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to register company: ${error.message}`);
    }
  },

  async updateCompany(id, updateData) {
    try {
      // Validate update data
      const validationErrors = CompanyModel.validateCompany(updateData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      // Prepare update data
      const preparedData = CompanyModel.prepareData(updateData);
      preparedData.updated_at = new Date().toISOString();
      delete preparedData.created_at; // Don't update created_at

      const { data, error } = await supabase
        .from(CompanyModel.tableName)
        .update(preparedData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Company not found");
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }
  },

  async deleteCompany(id) {
    try {
      const { error } = await supabase
        .from(CompanyModel.tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete company: ${error.message}`);
    }
  },
};
