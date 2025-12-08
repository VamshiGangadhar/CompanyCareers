const supabase = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const aiService = require("../services/aiService");

// Helper function to verify user from token
const verifyUserFromRequest = async (req) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    console.log(
      "🔐 [AUTH] Verifying user token:",
      token ? "Token present" : "No token"
    );

    if (token) {
      console.log("🔍 [AUTH] Token preview:", token.substring(0, 50) + "...");
      console.log(
        "🔍 [AUTH] Token type:",
        token.startsWith("eyJ") ? "JWT" : "Other"
      );
    }

    if (!token) {
      return { error: "No authorization token provided", user: null };
    }

    // Handle old mock tokens temporarily for development
    if (token.startsWith("mock_token_") || token.startsWith("token_")) {
      console.log("⚠️ [AUTH] Detected old mock token, creating temporary user");
      const mockUser = {
        id: uuidv4(), // Generate unique UUID for each request
        email: "demo@example.com",
        name: "Demo User",
      };
      return { user: mockUser, error: null };
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    console.log("🔐 [AUTH] Token decoded successfully:", {
      userId: decoded.id,
      email: decoded.email,
    });

    return { user: decoded, error: null };
  } catch (error) {
    console.error("🔐 [AUTH] Token verification failed:", error.message);
    return { error: "Invalid token", user: null };
  }
};

// Helper function to check if user owns company
const checkCompanyOwnership = async (slug, userEmail, userId) => {
  try {
    console.log("🏢 [OWNERSHIP] Checking ownership for:", {
      slug,
      userEmail,
      userId,
    });

    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("🏢 [OWNERSHIP] Database error:", error);
      return { hasAccess: false, error: error.message, company: null };
    }

    if (!company) {
      console.log("🏢 [OWNERSHIP] Company not found:", slug);
      return { hasAccess: false, error: "Company not found", company: null };
    }

    console.log("🏢 [OWNERSHIP] Company data:", {
      id: company.id,
      name: company.name,
      created_by: company.created_by,
    });

    // Check if user owns this company (simplified to only use created_by)
    const hasAccess =
      company.created_by === userEmail || company.created_by === userId;

    console.log("🏢 [OWNERSHIP] Access check result:", {
      hasAccess,
      userEmail,
      userId,
      companyCreatedBy: company.created_by,
    });

    return { hasAccess, error: null, company };
  } catch (error) {
    console.error("🏢 [OWNERSHIP] Unexpected error:", error);
    return { hasAccess: false, error: error.message, company: null };
  }
};

// Event handler that routes different steps to appropriate actions
const handleEvent = async (req, res) => {
  try {
    const { step, payload } = req.body;

    console.log(`🚀 [EVENT] Handling event: ${step}`);
    console.log(
      `📦 [PAYLOAD] Event payload:`,
      JSON.stringify(payload, null, 2)
    );
    console.log(
      `🌐 [HEADERS] Authorization:`,
      req.headers.authorization ? "Present" : "Missing"
    );

    // Verify user for protected operations
    const protectedOperations = [
      "UPDATE_COMPANY",
      "DELETE_COMPANY",
      "CREATE_COMPANY",
    ];
    if (protectedOperations.includes(step)) {
      const { user, error } = await verifyUserFromRequest(req);
      if (error) {
        console.log(`❌ [AUTH] Authentication failed for ${step}:`, error);
        return res.status(401).json({ success: false, error });
      }
      // Add user info to payload for downstream functions
      payload.currentUser = user;
    }

    switch (step) {
      case "TEST_CONNECTION":
        return await testConnection(res);

      case "CREATE_DEMO_COMPANY":
        return await createDemoCompany(res);

      case "CREATE_COMPANY":
        return await createCompany(payload, res);

      case "GET_COMPANY":
        return await getCompany(payload, res);
      case "UPDATE_COMPANY":
        return await updateCompany(payload, res);

      case "GET_USER_COMPANIES":
        return await getUserCompanies(payload, res);

      case "GET_JOBS":
        return await getJobs(payload, res);

      case "ADD_JOB":
        return await addJob(payload, res);

      case "UPDATE_JOB":
        return await updateJob(payload, res);

      case "DELETE_JOB":
        return await deleteJob(payload, res);

      case "UPLOAD_LOGO":
        return await uploadLogoToStorage(payload, res);

      case "UPLOAD_BANNER":
        return await uploadBannerToStorage(payload, res);

      case "DELETE_LOGO":
        return await deleteLogo(payload, res);

      case "DELETE_BANNER":
        return await deleteBanner(payload, res);

      case "TEST_STORAGE":
        return await testStorageConfiguration(res);

      case "AUTH_LOGIN":
        return await authLogin(payload, res);

      case "AUTH_REGISTER":
        return await authRegister(payload, res);

      case "AUTH_LOGOUT":
        return await authLogout(payload, res);

      case "AUTH_VERIFY":
        return await authVerify(payload, res);

      case "ENHANCE_TEXT":
        return await enhanceText(payload, res);

      case "ENHANCE_TEXT_ARRAY":
        return await enhanceTextArray(payload, res);

      case "GENERATE_CONTENT":
        return await generateContent(payload, res);

      default:
        return res.status(400).json({ error: `Unknown step: ${step}` });
    }
  } catch (error) {
    console.error("Event handler error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Test connection function
const testConnection = async (res) => {
  try {
    // Try to query a simple system table or make a basic connection test
    const { data, error } = await supabase
      .from("companies")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Connection test error:", error);
      return res.status(500).json({
        error: "Failed to connect to database",
        details: error.message,
        code: error.code,
      });
    }

    return res.json({
      success: true,
      message: "Database connection successful",
      tableExists: true,
    });
  } catch (error) {
    console.error("Unexpected error in testConnection:", error);
    return res.status(500).json({
      error: "Unexpected connection error",
      details: error.message,
    });
  }
};

// Create company function
const createCompany = async (
  { name, slug, branding, sections, currentUser },
  res
) => {
  try {
    console.log(`🏭 [CREATE_COMPANY] Starting company creation`);
    console.log(`📝 [CREATE_COMPANY] Input data:`, { name, slug });
    console.log(`👤 [CREATE_COMPANY] Current user:`, currentUser);

    if (!currentUser) {
      console.log(`❌ [CREATE_COMPANY] No current user found`);
      return res.status(401).json({
        success: false,
        error: "Authentication required to create company",
      });
    }

    // Check if slug already exists
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existingCompany) {
      console.log(`❌ [CREATE_COMPANY] Company slug already exists:`, slug);
      return res
        .status(400)
        .json({ error: "Company with this slug already exists" });
    }

    const companyData = {
      id: uuidv4(),
      name: name || "My Company",
      slug,
      created_by: currentUser.id || currentUser.email,
      branding: branding || {
        primaryColor: "#3b82f6",
        secondaryColor: "#1f2937",
        backgroundColor: "#ffffff",
        textColor: "#374151",
        logo: branding?.logo || null,
        banner: branding?.banner || null,
        website: branding?.website || null,
        layout: {
          containerWidth: "normal",
          spacing: "normal",
          borderRadius: "medium",
          layoutStyle: "modern",
        },
        typography: {
          fontFamily: "Inter",
          fontSize: "medium",
          fontWeight: "normal",
        },
      },
      sections: sections || {
        hero: {
          type: "hero",
          title: `Welcome to ${name || "My Company"}`,
          content: { subtitle: "Join our amazing team!" },
          visible: true,
          order: 1,
        },
        about: {
          type: "about",
          title: "About Us",
          content: { content: "We are building something amazing." },
          visible: true,
          order: 2,
        },
        jobs: {
          type: "jobs",
          title: "Open Positions",
          content: { showAll: true },
          visible: true,
          order: 3,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`💾 [CREATE_COMPANY] Creating company with data:`, {
      name: companyData.name,
      slug: companyData.slug,
      created_by: companyData.created_by,
      currentUser: currentUser,
    });

    const { data, error } = await supabase
      .from("companies")
      .insert([companyData])
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      return res.status(500).json({
        error: "Failed to create company",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Company created:", data);
    return res.json({
      success: true,
      message: "Company created successfully",
      company: {
        ...data,
        createdAt:
          data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt:
          data.updatedAt || data.updated_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Unexpected error in createCompany:", error);
    return res.status(500).json({
      error: "Unexpected error creating company",
      details: error.message,
    });
  }
};

// Create demo company function
const createDemoCompany = async (res) => {
  try {
    // First, check if demo company already exists
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", "demo")
      .single();

    if (existingCompany) {
      console.log("Demo company already exists:", existingCompany);
      return res.json({
        success: true,
        message: "Demo company already exists",
        company: {
          ...existingCompany,
          createdAt:
            existingCompany.createdAt ||
            existingCompany.created_at ||
            new Date().toISOString(),
          updatedAt:
            existingCompany.updatedAt ||
            existingCompany.updated_at ||
            new Date().toISOString(),
        },
      });
    }

    const demoCompany = {
      id: uuidv4(),
      name: "Demo Company",
      slug: "demo",
      branding: {
        primaryColor: "#3b82f6",
        secondaryColor: "#1f2937",
        backgroundColor: "#ffffff",
        textColor: "#374151",
        logo: null,
        banner: null,
        website: null,
        layout: {
          containerWidth: "normal",
          spacing: "normal",
          borderRadius: "medium",
          layoutStyle: "modern",
        },
        typography: {
          fontFamily: "Inter",
          fontSize: "medium",
          fontWeight: "normal",
        },
      },
      sections: {
        hero: {
          title: "Welcome to Demo Company",
          description: "This is a demo company for testing purposes",
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("companies")
      .insert([demoCompany])
      .select()
      .single();

    if (error) {
      console.error("Error creating demo company:", error);
      return res.status(500).json({
        error: "Failed to create demo company",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Demo company created:", data);
    return res.json({
      success: true,
      message: "Demo company created successfully",
      company: {
        ...data,
        createdAt:
          data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt:
          data.updatedAt || data.updated_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Unexpected error in createDemoCompany:", error);
    return res.status(500).json({
      error: "Unexpected error creating demo company",
      details: error.message,
    });
  }
};

// Company operations
const getCompany = async ({ slug }, res) => {
  try {
    console.log(`Getting company with slug: ${slug}`);

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Supabase error:", error);

      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Company not found" });
      }
      if (error.code === "42P01") {
        return res.status(500).json({
          error:
            "Companies table does not exist. Please create the table first.",
          details: error.message,
        });
      }
      return res.status(500).json({
        error: "Database error",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Company found:", data);
    return res.json({
      ...data,
      createdAt: data.createdAt || data.created_at || new Date().toISOString(),
      updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unexpected error in getCompany:", error);
    return res.status(500).json({
      error: "Unexpected error",
      details: error.message,
    });
  }
};

const updateCompany = async (
  { slug, name, branding, sections, team, published, publishedAt, currentUser },
  res
) => {
  try {
    console.log(
      `🔄 [UPDATE_COMPANY] Starting company update for slug: ${slug}`
    );
    console.log(`👤 [UPDATE_COMPANY] Current user:`, currentUser);
    console.log(`📝 [UPDATE_COMPANY] Update data:`, {
      name: !!name,
      branding: !!branding,
      sections: !!sections,
      team: !!team,
      published: published,
      publishedAt: !!publishedAt,
    });

    if (!currentUser) {
      console.log(`❌ [UPDATE_COMPANY] No current user found`);
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Check if user owns this company
    const {
      hasAccess,
      error: ownershipError,
      company,
    } = await checkCompanyOwnership(slug, currentUser.email, currentUser.id);

    if (ownershipError) {
      console.log(
        `❌ [UPDATE_COMPANY] Ownership check failed:`,
        ownershipError
      );
      return res.status(500).json({
        success: false,
        error: `Failed to verify ownership: ${ownershipError}`,
      });
    }

    if (!hasAccess) {
      console.log(
        `🚫 [UPDATE_COMPANY] Access denied for user ${currentUser.email} to company ${slug}`
      );
      return res.status(403).json({
        success: false,
        error: "You don't have permission to edit this company",
      });
    }

    console.log(`✅ [UPDATE_COMPANY] Access granted, proceeding with update`);

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (branding !== undefined) updateData.branding = branding;
    if (sections !== undefined) updateData.sections = sections;
    if (team !== undefined) updateData.team = team;
    if (published !== undefined) {
      updateData.published = published;
      console.log(
        `📢 [UPDATE_COMPANY] Setting published status to: ${published}`
      );
    }
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt;
      console.log(
        `📅 [UPDATE_COMPANY] Setting published date to: ${publishedAt}`
      );
    }

    console.log(
      `💾 [UPDATE_COMPANY] Final update data:`,
      Object.keys(updateData)
    );

    // Log team update specifically
    if (team !== undefined) {
      console.log(
        `👥 [UPDATE_COMPANY] Updating team with ${team.length} members`
      );
    }

    const { data, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      console.error(`❌ [UPDATE_COMPANY] Database error:`, error);
      throw error;
    }

    console.log(`✅ [UPDATE_COMPANY] Successfully updated company:`, data.id);

    return res.json({
      success: true,
      data: {
        ...data,
        createdAt:
          data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt:
          data.updatedAt || data.updated_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Job operations
const getJobs = async ({ companySlug, companyId, ...filters }, res) => {
  try {
    let query;

    if (companyId) {
      // Query by company ID directly
      query = supabase.from("jobs").select("*").eq("companyId", companyId);
    } else if (companySlug) {
      // Query by company slug with join
      query = supabase
        .from("jobs")
        .select(
          `
          *,
          companies!inner(slug)
        `
        )
        .eq("companies.slug", companySlug);
    } else {
      return res
        .status(400)
        .json({ error: "Either companyId or companySlug must be provided" });
    }

    // Apply filters
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order("createdAt", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({
        error: "Failed to fetch jobs",
        details: error.message,
      });
    }

    console.log(`Found ${data?.length || 0} jobs for company`);

    return res.json({
      success: true,
      data: { jobs: data || [] },
    });
  } catch (error) {
    console.error("Unexpected error in getJobs:", error);
    return res.status(500).json({
      error: "Unexpected error fetching jobs",
      details: error.message,
    });
  }
};

const addJob = async (jobData, res) => {
  try {
    const {
      companyId,
      companySlug,
      title,
      description,
      department,
      location,
      locationType,
      type,
      experienceLevel,
      salary,
      salaryMin,
      salaryMax,
      currency,
      requirements,
      responsibilities,
      skills,
      benefits,
      perks,
      applicationUrl,
      deadline,
      isActive,
      isFeatured,
    } = jobData;

    let finalCompanyId = companyId;

    // If companyId is provided directly, verify it exists
    if (companyId) {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("id", companyId)
        .single();

      if (companyError || !company) {
        console.error("Company not found with ID:", companyId, companyError);
        return res.status(404).json({ error: "Company not found" });
      }
      finalCompanyId = company.id;
    }
    // If companySlug is provided, get company ID from slug
    else if (companySlug) {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", companySlug)
        .single();

      if (companyError || !company) {
        console.error(
          "Company not found with slug:",
          companySlug,
          companyError
        );
        return res.status(404).json({ error: "Company not found" });
      }
      finalCompanyId = company.id;
    } else {
      return res
        .status(400)
        .json({ error: "Either companyId or companySlug must be provided" });
    }

    const newJobData = {
      id: uuidv4(),
      companyId: finalCompanyId,
      title: title || "Untitled Position",
      description: description || "",
      department: department || "General",
      location: location || "Remote",
      locationType: locationType || "Remote",
      type: type || "Full-time",
      experienceLevel: experienceLevel || "Mid",
      salary: salary || null,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      currency: currency || "USD",
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      benefits: benefits || [],
      perks: perks || [],
      applicationUrl: applicationUrl || null,
      deadline: deadline || null,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Creating job with data:", newJobData);

    const { data, error } = await supabase
      .from("jobs")
      .insert([newJobData])
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return res.status(500).json({
        error: "Failed to create job",
        details: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Job created successfully",
      job: data,
    });
  } catch (error) {
    console.error("Unexpected error in addJob:", error);
    return res.status(500).json({
      error: "Unexpected error creating job",
      details: error.message,
    });
  }
};

const updateJob = async (jobData, res) => {
  try {
    const {
      id,
      title,
      description,
      department,
      location,
      locationType,
      type,
      experienceLevel,
      salary,
      salaryMin,
      salaryMax,
      currency,
      requirements,
      responsibilities,
      skills,
      benefits,
      perks,
      applicationUrl,
      deadline,
      isActive,
      isFeatured,
    } = jobData;

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (department !== undefined) updateData.department = department;
    if (location !== undefined) updateData.location = location;
    if (locationType !== undefined) updateData.locationType = locationType;
    if (type !== undefined) updateData.type = type;
    if (experienceLevel !== undefined)
      updateData.experienceLevel = experienceLevel;
    if (salary !== undefined) updateData.salary = salary;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax;
    if (currency !== undefined) updateData.currency = currency;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (responsibilities !== undefined)
      updateData.responsibilities = responsibilities;
    if (skills !== undefined) updateData.skills = skills;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (perks !== undefined) updateData.perks = perks;
    if (applicationUrl !== undefined)
      updateData.applicationUrl = applicationUrl;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    console.log("Updating job with ID:", id, "Data:", updateData);

    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      return res.status(500).json({
        error: "Failed to update job",
        details: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Job updated successfully",
      job: data,
    });
  } catch (error) {
    console.error("Unexpected error in updateJob:", error);
    return res.status(500).json({
      error: "Unexpected error updating job",
      details: error.message,
    });
  }
};

const deleteJob = async ({ id }, res) => {
  try {
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      return res.status(500).json({
        error: "Failed to delete job",
        details: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error in deleteJob:", error);
    return res.status(500).json({
      error: "Unexpected error deleting job",
      details: error.message,
    });
  }
};

// Supabase Storage Upload Functions
const uploadLogoToStorage = async ({ companySlug, file, filename }, res) => {
  try {
    if (!companySlug || !file) {
      return res
        .status(400)
        .json({ error: "Company slug and file are required" });
    }

    // Create file path with clean folder structure
    const fileExt = path.extname(filename || "logo.png");
    const fileName = `${Date.now()}-logo${fileExt}`;
    const filePath = `companies/${companySlug}/logos/${fileName}`;

    // Convert base64 to buffer if needed
    let fileBuffer;
    if (typeof file === "string" && file.startsWith("data:")) {
      const base64Data = file.split(",")[1];
      fileBuffer = Buffer.from(base64Data, "base64");
    } else {
      fileBuffer = file;
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("career_company")
      .upload(filePath, fileBuffer, {
        contentType: filename
          ? `image/${path.extname(filename).slice(1)}`
          : "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      if (uploadError.message?.includes("Bucket not found")) {
        return res.status(500).json({
          error:
            "Storage bucket not found. Please create 'career_company' bucket in Supabase Dashboard → Storage",
          details: uploadError.message,
        });
      }
      return res.status(500).json({ error: uploadError.message });
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("career_company")
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;
    console.log("Generated logo URL:", logoUrl);

    // Update company branding in database
    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("branding")
      .eq("slug", companySlug)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: "Failed to fetch company data" });
    }

    const updatedBranding = {
      ...company.branding,
      logo: logoUrl,
    };

    const { error: updateError } = await supabase
      .from("companies")
      .update({
        branding: updatedBranding,
        updatedAt: new Date().toISOString(),
      })
      .eq("slug", companySlug);

    if (updateError) {
      console.error("Database update error:", updateError);
      // If RLS error, provide helpful message
      if (
        updateError.message &&
        updateError.message.includes("row-level security")
      ) {
        return res.status(403).json({
          error:
            "Database permission error. Please check Supabase RLS policies or use service role key.",
          details: updateError.message,
          suggestion:
            "Go to Supabase Dashboard → Settings → API and use the service_role key instead of anon key",
        });
      }
      return res.status(500).json({
        error: "Failed to update company branding",
        details: updateError.message,
      });
    }

    return res.json({
      success: true,
      message: "Logo uploaded successfully",
      logoUrl,
      filePath,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const uploadBannerToStorage = async ({ companySlug, file, filename }, res) => {
  try {
    if (!companySlug || !file) {
      return res
        .status(400)
        .json({ error: "Company slug and file are required" });
    }

    // Create file path with clean folder structure
    const fileExt = path.extname(filename || "banner.png");
    const fileName = `${Date.now()}-banner${fileExt}`;
    const filePath = `companies/${companySlug}/banners/${fileName}`;

    // Convert base64 to buffer if needed
    let fileBuffer;
    if (typeof file === "string" && file.startsWith("data:")) {
      const base64Data = file.split(",")[1];
      fileBuffer = Buffer.from(base64Data, "base64");
    } else {
      fileBuffer = file;
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("career_company")
      .upload(filePath, fileBuffer, {
        contentType: filename
          ? `image/${path.extname(filename).slice(1)}`
          : "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      if (uploadError.message?.includes("Bucket not found")) {
        return res.status(500).json({
          error:
            "Storage bucket not found. Please create 'career_company' bucket in Supabase Dashboard → Storage",
          details: uploadError.message,
        });
      }
      return res.status(500).json({ error: uploadError.message });
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("career_company")
      .getPublicUrl(filePath);

    const bannerUrl = urlData.publicUrl;
    console.log("Generated banner URL:", bannerUrl);

    // Update company branding in database
    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("branding")
      .eq("slug", companySlug)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: "Failed to fetch company data" });
    }

    const updatedBranding = {
      ...company.branding,
      banner: bannerUrl,
    };

    const { error: updateError } = await supabase
      .from("companies")
      .update({
        branding: updatedBranding,
        updatedAt: new Date().toISOString(),
      })
      .eq("slug", companySlug);

    if (updateError) {
      console.error("Database update error:", updateError);
      // If RLS error, provide helpful message
      if (
        updateError.message &&
        updateError.message.includes("row-level security")
      ) {
        return res.status(403).json({
          error:
            "Database permission error. Please check Supabase RLS policies or use service role key.",
          details: updateError.message,
          suggestion:
            "Go to Supabase Dashboard → Settings → API and use the service_role key instead of anon key",
        });
      }
      return res.status(500).json({
        error: "Failed to update company branding",
        details: updateError.message,
      });
    }

    return res.json({
      success: true,
      message: "Banner uploaded successfully",
      bannerUrl,
      filePath,
    });
  } catch (error) {
    console.error("Banner upload error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteLogo = async ({ companySlug }, res) => {
  try {
    if (!companySlug) {
      return res.status(400).json({ error: "Company slug is required" });
    }

    // Get company first to verify it exists and get current logo
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", companySlug)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // If there's a logo stored in Supabase Storage, delete it
    if (
      company.branding?.logo &&
      company.branding.logo.includes("career_company")
    ) {
      try {
        // Extract file path from URL
        const url = new URL(company.branding.logo);
        const pathMatch = url.pathname.match(
          /\/storage\/v1\/object\/public\/career_company\/(.+)/
        );
        if (pathMatch) {
          const filePath = pathMatch[1];
          const { error: deleteError } = await supabase.storage
            .from("career_company")
            .remove([filePath]);

          if (deleteError) {
            console.error("Error deleting logo file:", deleteError);
          }
        }
      } catch (urlError) {
        console.error("Error parsing logo URL:", urlError);
      }
    }

    // Update branding to remove logo
    const updatedBranding = {
      ...company.branding,
      logo: null,
    };

    const { data, error } = await supabase
      .from("companies")
      .update({
        branding: updatedBranding,
        updatedAt: new Date().toISOString(),
      })
      .eq("slug", companySlug)
      .select()
      .single();

    if (error) {
      console.error("Error deleting logo:", error);
      return res.status(500).json({
        error: "Failed to delete logo",
        details: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Logo deleted successfully",
      company: data,
    });
  } catch (error) {
    console.error("Unexpected error in deleteLogo:", error);
    return res.status(500).json({
      error: "Unexpected error deleting logo",
      details: error.message,
    });
  }
};

const deleteBanner = async ({ companySlug }, res) => {
  try {
    if (!companySlug) {
      return res.status(400).json({ error: "Company slug is required" });
    }

    // Get company first to verify it exists and get current banner
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", companySlug)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // If there's a banner stored in Supabase Storage, delete it
    if (
      company.branding?.banner &&
      company.branding.banner.includes("career_company")
    ) {
      try {
        // Extract file path from URL
        const url = new URL(company.branding.banner);
        const pathMatch = url.pathname.match(
          /\/storage\/v1\/object\/public\/career_company\/(.+)/
        );
        if (pathMatch) {
          const filePath = pathMatch[1];
          const { error: deleteError } = await supabase.storage
            .from("career_company")
            .remove([filePath]);

          if (deleteError) {
            console.error("Error deleting banner file:", deleteError);
          }
        }
      } catch (urlError) {
        console.error("Error parsing banner URL:", urlError);
      }
    }

    // Update branding to remove banner
    const updatedBranding = {
      ...company.branding,
      banner: null,
    };

    const { data, error } = await supabase
      .from("companies")
      .update({
        branding: updatedBranding,
        updatedAt: new Date().toISOString(),
      })
      .eq("slug", companySlug)
      .select()
      .single();

    if (error) {
      console.error("Error deleting banner:", error);
      return res.status(500).json({
        error: "Failed to delete banner",
        details: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Banner deleted successfully",
      company: data,
    });
  } catch (error) {
    console.error("Unexpected error in deleteBanner:", error);
    return res.status(500).json({
      error: "Unexpected error deleting banner",
      details: error.message,
    });
  }
};

// Auth operations (using Supabase auth)
const authLogin = async ({ email, password }, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split("@")[0],
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split("@")[0],
      },
      token: token,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const authRegister = async ({ email, password, metadata }, res) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Generate JWT token for the new user
    const token = jwt.sign(
      {
        id: data.user.id,
        email: data.user.email,
        name: metadata?.name || data.user.email.split("@")[0],
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: metadata?.name || data.user.email.split("@")[0],
      },
      token: token,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const authLogout = async ({ token }, res) => {
  try {
    // Token-based logout is handled on client side
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const authVerify = async ({ token }, res) => {
  try {
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      user: data.user,
      valid: true,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Test storage configuration
const testStorageConfiguration = async (res) => {
  try {
    console.log("Testing storage configuration...");

    // Test 1: List buckets
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("Bucket list error:", bucketError);
      return res.status(500).json({
        error: "Cannot list buckets",
        details: bucketError.message,
      });
    }

    const careerBucket = buckets.find(
      (bucket) => bucket.name === "career_company"
    );
    if (!careerBucket) {
      return res.status(404).json({
        error: "Bucket 'career_company' not found",
        availableBuckets: buckets.map((b) => b.name),
        instructions:
          "Please create 'career_company' bucket in Supabase Dashboard → Storage",
      });
    }

    // Test 2: Test file upload
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = `test/${testFileName}`;
    const testContent = "This is a test file";

    const { error: uploadError } = await supabase.storage
      .from("career_company")
      .upload(testFilePath, testContent, { contentType: "text/plain" });

    if (uploadError) {
      console.error("Test upload error:", uploadError);
      return res.status(500).json({
        error: "Cannot upload to bucket",
        details: uploadError.message,
        bucket: careerBucket,
      });
    }

    // Test 3: Get public URL
    const { data: urlData } = supabase.storage
      .from("career_company")
      .getPublicUrl(testFilePath);

    // Test 4: Clean up test file
    await supabase.storage.from("career_company").remove([testFilePath]);

    return res.json({
      success: true,
      message: "Storage configuration is working",
      bucket: careerBucket,
      testUrl: urlData.publicUrl,
      instructions: careerBucket.public
        ? "Bucket is public - files should be accessible"
        : "⚠️ Bucket is NOT public. Enable public access in Supabase Dashboard → Storage → career_company → Settings → Public bucket: ON",
    });
  } catch (error) {
    console.error("Storage test error:", error);
    return res.status(500).json({
      error: "Storage test failed",
      details: error.message,
    });
  }
};

// Get companies for a specific user
const getUserCompanies = async (payload, res) => {
  try {
    const { userEmail, userId } = payload;

    console.log(`👥 [GET_USER_COMPANIES] Starting company fetch`);
    console.log(`📧 [GET_USER_COMPANIES] User email:`, userEmail);
    console.log(`🆔 [GET_USER_COMPANIES] User ID:`, userId);

    if (!userEmail && !userId) {
      console.log(`❌ [GET_USER_COMPANIES] No user identification provided`);
      return res.status(400).json({
        success: false,
        error: "User email or ID is required",
      });
    }

    console.log("🔍 [GET_USER_COMPANIES] Getting companies for user:", {
      userEmail,
      userId,
    });

    // Check if companies have a created_by field matching either userId or userEmail
    if (userEmail && userId) {
      console.log(`🔍 [GET_USER_COMPANIES] Querying by user ID and email:`, {
        userId,
        userEmail,
      });

      // Query companies created by this user (using user ID OR email since creation uses id || email)
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select("*")
        .or(`created_by.eq.${userId},created_by.eq.${userEmail}`)
        .order("createdAt", { ascending: false });

      console.log(`💾 [GET_USER_COMPANIES] Query result:`, {
        found: companiesData?.length || 0,
        error: error?.message || "None",
        query: `created_by.eq.${userId} OR created_by.eq.${userEmail}`,
        companiesFound:
          companiesData?.map((c) => ({
            name: c.name,
            id: c.id,
            created_by: c.created_by,
          })) || [],
      });

      if (error) {
        // If the OR query fails, try a simpler approach
        console.log(
          `⚠️ [GET_USER_COMPANIES] OR query failed, trying simpler query:`,
          error.message
        );

        // Try to get all companies and filter on frontend as fallback
        const { data: allCompanies, error: allError } = await supabase
          .from("companies")
          .select("*")
          .order("createdAt", { ascending: false });

        if (allError) {
          throw new Error(`Failed to fetch companies: ${allError.message}`);
        }

        // For now, return all companies - this should be filtered properly based on your schema
        return res.json({
          success: true,
          data: {
            companies: allCompanies || [],
          },
        });
      }

      console.log(
        `✅ [GET_USER_COMPANIES] Returning ${
          companiesData?.length || 0
        } companies for user ${userEmail}`
      );
      return res.json({
        success: true,
        data: {
          companies: companiesData || [],
        },
      });
    }

    // If no userEmail, try with userId
    if (userId) {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("created_by", userId)
        .order("createdAt", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }

      return res.json({
        success: true,
        data: {
          companies: data || [],
        },
      });
    }

    return res.json({
      success: true,
      data: {
        companies: [],
      },
    });
  } catch (error) {
    console.error("Error getting user companies:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// AI Enhancement Functions
const enhanceText = async (payload, res) => {
  try {
    console.log("🤖 [AI] Enhancing text:", payload);

    const { text, contentType = "general" } = payload;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Text content is required",
      });
    }

    const enhancedText = await aiService.enhanceText(text, contentType);

    console.log("✨ [AI] Text enhancement completed");
    return res.json({
      success: true,
      data: {
        originalText: text,
        enhancedText,
        contentType,
      },
    });
  } catch (error) {
    console.error("❌ [AI] Text enhancement failed:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to enhance text",
    });
  }
};

const enhanceTextArray = async (payload, res) => {
  try {
    console.log("🤖 [AI] Enhancing text array:", payload);

    const { items, contentType = "list" } = payload;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items array is required",
      });
    }

    const enhancedItems = await aiService.enhanceTextArray(items, contentType);

    console.log("✨ [AI] Text array enhancement completed");
    return res.json({
      success: true,
      data: {
        originalItems: items,
        enhancedItems,
        contentType,
      },
    });
  } catch (error) {
    console.error("❌ [AI] Text array enhancement failed:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to enhance text array",
    });
  }
};

const generateContent = async (payload, res) => {
  try {
    console.log("🤖 [AI] Generating content:", payload);

    const { contentType, companyContext = {} } = payload;

    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: "Content type is required",
      });
    }

    const generatedContent = await aiService.generateContentSuggestions(
      contentType,
      companyContext
    );

    console.log("✨ [AI] Content generation completed");
    return res.json({
      success: true,
      data: {
        contentType,
        generatedContent,
        companyContext,
      },
    });
  } catch (error) {
    console.error("❌ [AI] Content generation failed:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate content",
    });
  }
};

module.exports = { handleEvent };
