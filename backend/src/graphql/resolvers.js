const supabase = require("../config/database");
const { JSONResolver } = require("graphql-scalars");

const resolvers = {
  JSON: JSONResolver,
  Query: {
    // Get all companies
    companies: async () => {
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch companies: ${error.message}`);
        }

        return data.map((company) => ({
          ...company,
          createdAt: company.created_at,
          updatedAt: company.updated_at,
        }));
      } catch (error) {
        throw new Error(`Error fetching companies: ${error.message}`);
      }
    },

    // Get company by ID or slug
    company: async (_, { id, slug }) => {
      try {
        let query = supabase.from("companies").select("*");

        if (id) {
          query = query.eq("id", id);
        } else if (slug) {
          query = query.eq("slug", slug);
        } else {
          throw new Error("Either id or slug must be provided");
        }

        const { data, error } = await query.single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new Error("Company not found");
          }
          throw new Error(`Failed to fetch company: ${error.message}`);
        }

        return {
          ...data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } catch (error) {
        throw new Error(`Error fetching company: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Create a new company
    createCompany: async (_, { name, slug, branding, sections }, context) => {
      try {
        // Check if slug already exists
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("slug")
          .eq("slug", slug)
          .single();

        if (existingCompany) {
          throw new Error("Company with this slug already exists");
        }

        const companyData = {
          name,
          slug,
          branding: branding || {},
          sections: sections || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("companies")
          .insert([companyData])
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create company: ${error.message}`);
        }

        return {
          ...data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } catch (error) {
        throw new Error(`Error creating company: ${error.message}`);
      }
    },

    // Update an existing company
    updateCompany: async (
      _,
      { id, name, slug, branding, sections },
      context
    ) => {
      try {
        // Check if company exists
        const { data: existingCompany, error: fetchError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            throw new Error("Company not found");
          }
          throw new Error(`Failed to fetch company: ${fetchError.message}`);
        }

        // If slug is being updated, check if new slug already exists
        if (slug && slug !== existingCompany.slug) {
          const { data: slugExists } = await supabase
            .from("companies")
            .select("slug")
            .eq("slug", slug)
            .single();

          if (slugExists) {
            throw new Error("Company with this slug already exists");
          }
        }

        // Prepare update data
        const updateData = {
          updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (slug !== undefined) updateData.slug = slug;
        if (branding !== undefined) updateData.branding = branding;
        if (sections !== undefined) updateData.sections = sections;

        const { data, error } = await supabase
          .from("companies")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update company: ${error.message}`);
        }

        return {
          ...data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } catch (error) {
        throw new Error(`Error updating company: ${error.message}`);
      }
    },

    // Delete a company
    deleteCompany: async (_, { id }, context) => {
      try {
        // Check if company exists
        const { data: existingCompany, error: fetchError } = await supabase
          .from("companies")
          .select("id")
          .eq("id", id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            throw new Error("Company not found");
          }
          throw new Error(`Failed to fetch company: ${fetchError.message}`);
        }

        const { error } = await supabase
          .from("companies")
          .delete()
          .eq("id", id);

        if (error) {
          throw new Error(`Failed to delete company: ${error.message}`);
        }

        return true;
      } catch (error) {
        throw new Error(`Error deleting company: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;
