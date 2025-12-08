import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCompanyStore from "../context/companyStore";
import AIEnhancedTextField from "../components/AIEnhancedTextField";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Business,
  Launch,
  AccountCircle,
  Logout,
  Computer,
  CorporateFare,
  Brush,
  CheckCircle,
} from "@mui/icons-material";
import toast from "react-hot-toast";

/* -----------------------
   TEMPLATE DEFINITIONS
------------------------ */
const templates = [
  {
    id: "modern",
    name: "Modern Tech",
    description: "Clean, minimalist design for tech companies",
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    sections: ["hero", "about", "values", "jobs"],
    icon: Computer,
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional layout for enterprise organizations",
    primaryColor: "#2c3e50",
    secondaryColor: "#34495e",
    sections: ["hero", "about", "team", "jobs"],
    icon: CorporateFare,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold, vibrant design for creative teams",
    primaryColor: "#e74c3c",
    secondaryColor: "#f39c12",
    sections: ["hero", "culture", "values", "jobs"],
    icon: Brush,
  },
];

const STEPS = [
  { id: 0, title: "Company", subtitle: "Basic details" },
  { id: 1, title: "Template", subtitle: "Choose layout" },
  { id: 2, title: "Branding", subtitle: "Colors & preview" },
];

const CompanySetup = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { createCompany, loading } = useCompanyStore();

  const [activeStep, setActiveStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    template: "",
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
  });
  const [errors, setErrors] = useState({});

  /* -----------------------
       MENU HANDLING
  ------------------------ */
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* -----------------------
       VALIDATION + NAVIGATION
  ------------------------ */
  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.name) newErrors.name = "Company name is required.";
      if (!formData.slug) newErrors.slug = "Company slug is required.";
      if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug))
        newErrors.slug =
          "Slug may contain only lowercase letters, numbers, and hyphens.";
    }

    if (activeStep === 1 && !formData.template) {
      newErrors.template = "Select a template to continue.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  /* -----------------------
       INPUT HANDLER
  ------------------------ */
  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));

    if (field === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((p) => ({ ...p, slug }));
    }

    if (errors[field]) {
      setErrors((p) => ({ ...p, [field]: null }));
    }
  };

  const handleTemplateSelect = (t) => {
    setFormData((prev) => ({
      ...prev,
      template: t.id,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
    }));
  };

  /* -----------------------
       SUBMIT
  ------------------------ */
  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const companyData = {
        name: formData.name,
        slug: formData.slug,
        branding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          logo: null,
          website: formData.website || null,
        },
        sections: {
          hero: {
            type: "hero",
            title: `Welcome to ${formData.name}`,
            content: {
              subtitle:
                formData.description ||
                "Join our amazing team and make a difference!",
            },
            visible: true,
            order: 1,
          },
          about: {
            type: "about",
            title: "About Us",
            content: {
              content:
                formData.description ||
                "We are building something amazing. Join our team!",
            },
            visible: true,
            order: 2,
          },
        },
      };

      await createCompany(companyData);
      toast.success("Company created!");
      navigate(`/company/${formData.slug}/edit`);
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  /* -----------------------
       LEFT STEP RAIL
  ------------------------ */
  const StepRail = () => (
    <Box sx={{ width: 220 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Setup progress
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {STEPS.map((s) => {
          const isActive = s.id === activeStep;
          const isDone = s.id < activeStep;

          return (
            <Box
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 1,
                py: 1,
                borderRadius: 1,
                cursor: "pointer",
                backgroundColor: isActive ? "action.selected" : "transparent",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: isDone
                    ? "success.main"
                    : isActive
                    ? "primary.main"
                    : "transparent",
                  border: isDone || isActive ? "none" : "1px solid #ddd",
                  color: isDone || isActive ? "#fff" : "text.secondary",
                  fontSize: 14,
                }}
              >
                {isDone ? <CheckCircle sx={{ fontSize: 18 }} /> : s.id + 1}
              </Avatar>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {s.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.subtitle}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 3 }} />
    </Box>
  );

  /* -----------------------
       TEMPLATE CARD (3 per row)
  ------------------------ */
  const TemplateCard = ({ t }) => {
    const selected = formData.template === t.id;
    const Icon = t.icon;

    return (
      <Card
        onClick={() => handleTemplateSelect(t)}
        sx={{
          cursor: "pointer",
          borderRadius: 2,
          border: selected ? "1.5px solid #635bff" : "1px solid #e5e7eb",
          transition: "all .15s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          },
        }}
      >
        <Box
          sx={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${t.primaryColor}, ${t.secondaryColor})`,
          }}
        >
          <Icon sx={{ color: "#fff", fontSize: 32 }} />
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t.description}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {t.sections.map((s) => (
              <Chip
                key={s}
                size="small"
                label={s}
                sx={{ fontSize: "11px", height: 22 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  /* -----------------------
       CONTENT RENDERER
  ------------------------ */
  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Company details
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Basic company information used to build your careers page.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AIEnhancedTextField
                  label="Company Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name}
                  contentType="title"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Company Slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  fullWidth
                  error={!!errors.slug}
                  helperText={
                    errors.slug ||
                    `URL: yoursite.com/${formData.slug || "<slug>"}/careers`
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <AIEnhancedTextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  fullWidth
                  multiline
                  rows={3}
                  contentType="description"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  fullWidth
                  placeholder="https://yourcompany.com"
                />
              </Grid>
            </Grid>
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Choose a template
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Pick a layout — you can customize colors and content later.
            </Typography>

            {/* ★ 3-in-a-row template grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 3,
              }}
            >
              {templates.map((t) => (
                <TemplateCard key={t.id} t={t} />
              ))}
            </Box>

            {errors.template && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {errors.template}
              </Alert>
            )}
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Branding basics
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Select your brand colors. You can refine them later.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Primary color
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Box
                      onClick={() =>
                        document.getElementById("primaryColor").click()
                      }
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        background: formData.primaryColor,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        handleInputChange("primaryColor", e.target.value)
                      }
                      fullWidth
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Secondary color
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Box
                      onClick={() =>
                        document.getElementById("secondaryColor").click()
                      }
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        background: formData.secondaryColor,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        handleInputChange("secondaryColor", e.target.value)
                      }
                      fullWidth
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                  >
                    Preview
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      sx={{
                        background: formData.primaryColor,
                        "&:hover": { filter: "brightness(.9)" },
                      }}
                    >
                      Primary Button
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: formData.secondaryColor,
                        color: formData.secondaryColor,
                        "&:hover": {
                          backgroundColor: `${formData.secondaryColor}25`,
                        },
                      }}
                    >
                      Secondary
                    </Button>

                    <Typography
                      variant="h6"
                      sx={{ color: formData.primaryColor }}
                    >
                      Sample Heading
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  /* -----------------------
       RENDER
  ------------------------ */
  return (
    <Box>
      {/* Top App Bar */}
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid #eee" }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Business color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Company Career
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label={user?.email}
            variant="outlined"
            sx={{ borderColor: "#ddd", mr: 1 }}
          />

          <IconButton onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>

          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Layout */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          sx={{
            display: "flex",
            gap: 4,
            p: 4,
            borderRadius: 3,
            border: "1px solid #eee",
          }}
        >
          <StepRail />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={800}>
                Create your careers page
              </Typography>
              <Typography color="text.secondary">
                A quick setup to get your public careers page live.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {renderContent()}

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 4,
              }}
            >
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>

              {activeStep === STEPS.length - 1 ? (
                <LoadingButton
                  variant="contained"
                  startIcon={<Launch />}
                  loading={loading}
                  onClick={handleSubmit}
                >
                  Create Company
                </LoadingButton>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Continue
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanySetup;
