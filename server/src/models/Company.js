import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const CompanyModel = {
  tableName: "companies",

  // Company validation schema
  validateCompany: (companyData) => {
    const errors = [];

    if (!companyData.name || companyData.name.trim().length === 0) {
      errors.push("Company name is required");
    }

    if (!companyData.slug || companyData.slug.trim().length === 0) {
      errors.push("Company slug is required");
    }

    // Validate slug format (lowercase, alphanumeric, hyphens)
    if (companyData.slug && !/^[a-z0-9-]+$/.test(companyData.slug)) {
      errors.push("Slug must be lowercase alphanumeric characters and hyphens only");
    }

    return errors;
  },

  // Generate slug from company name
  generateSlug: (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  },

  // Clean and prepare data for database
  prepareData: (companyData) => {
    const slug = companyData.slug || CompanyModel.generateSlug(companyData.name);

    return {
      id: companyData.id || crypto.randomUUID(),
      name: companyData.name?.trim(),
      slug: slug,
      branding: companyData.branding || null,
      sections: companyData.sections || null,
      updatedAt: new Date().toISOString(),
    };
  },
};
