import { supabase } from "../database.js";
import { successResponse, errorResponse } from "../eventHandler.js";

// Helper to verify auth for protected operations
const verifyAuth = async (token) => {
  if (!token) {
    throw errorResponse("Authentication required", 401);
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw errorResponse("Invalid authentication token", 401);
  }

  return data.user;
};

export const dataHandlers = {
  // Get company by slug
  GET_COMPANY: async (payload) => {
    const { slug } = payload;

    if (!slug) {
      throw errorResponse("Company slug required", 400);
    }

    const { data, error } = await supabase
      .from("companies")
      .select(
        `
        *,
        jobs (*)
      `
      )
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw errorResponse("Company not found", 404);
      }
      throw errorResponse(error.message, 500);
    }

    return successResponse(data, "Company retrieved");
  },

  // Update company (protected)
  UPDATE_COMPANY: async (payload) => {
    const { token, slug, ...updateData } = payload;

    // Verify authentication
    await verifyAuth(token);

    if (!slug) {
      throw errorResponse("Company slug required", 400);
    }

    const { data, error } = await supabase
      .from("companies")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      throw errorResponse(error.message, 500);
    }

    return successResponse(data, "Company updated");
  },

  // Get jobs
  GET_JOBS: async (payload) => {
    const { page = 1, limit = 10, companySlug } = payload;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("jobs")
      .select(
        `
        *,
        companies (name, slug)
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by company if provided
    if (companySlug) {
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", companySlug)
        .single();

      if (company) {
        query = query.eq("company_id", company.id);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      throw errorResponse(error.message, 500);
    }

    return successResponse(
      {
        jobs: data,
        pagination: {
          currentPage: page,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          hasNext: offset + limit < count,
        },
      },
      "Jobs retrieved"
    );
  },

  // Add job (protected)
  ADD_JOB: async (payload) => {
    const { token, ...jobData } = payload;

    // Verify authentication
    await verifyAuth(token);

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        ...jobData,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        companies (name, slug)
      `
      )
      .single();

    if (error) {
      throw errorResponse(error.message, 500);
    }

    return successResponse(data, "Job created");
  },

  // Update job (protected)
  UPDATE_JOB: async (payload) => {
    const { token, id, ...updateData } = payload;

    // Verify authentication
    await verifyAuth(token);

    if (!id) {
      throw errorResponse("Job ID required", 400);
    }

    const { data, error } = await supabase
      .from("jobs")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw errorResponse(error.message, 500);
    }

    return successResponse(data, "Job updated");
  },

  // Delete job (protected)
  DELETE_JOB: async (payload) => {
    const { token, id } = payload;

    // Verify authentication
    await verifyAuth(token);

    if (!id) {
      throw errorResponse("Job ID required", 400);
    }

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      throw errorResponse(error.message, 500);
    }

    return successResponse(null, "Job deleted");
  },
};
