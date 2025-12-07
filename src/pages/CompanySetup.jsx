import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCompanyStore from "../context/companyStore";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Step,
  Stepper,
  StepLabel,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Business,
  Palette,
  Article,
  Launch,
  AccountCircle,
  Logout,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const steps = ["Company Details", "Choose Template", "Basic Customization"];

const templates = [
  {
    id: "modern",
    name: "Modern Tech",
    description: "Clean design perfect for tech startups",
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    sections: ["hero", "about", "values", "jobs"],
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional look for established companies",
    primaryColor: "#2c3e50",
    secondaryColor: "#34495e",
    sections: ["hero", "about", "team", "jobs"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold colors for creative agencies",
    primaryColor: "#e74c3c",
    secondaryColor: "#f39c12",
    sections: ["hero", "culture", "values", "jobs"],
  },
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleMenuClose();
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.name) newErrors.name = "Company name is required";
      if (!formData.slug) newErrors.slug = "Company slug is required";
      if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug =
          "Slug can only contain lowercase letters, numbers, and hyphens";
      }
    }

    if (activeStep === 1 && !formData.template) {
      newErrors.template = "Please select a template";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from company name
    if (field === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleTemplateSelect = (template) => {
    setFormData((prev) => ({
      ...prev,
      template: template.id,
      primaryColor: template.primaryColor,
      secondaryColor: template.secondaryColor,
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const selectedTemplate = templates.find(
        (t) => t.id === formData.template
      );

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
                "We are building something amazing. Join us on this exciting journey!",
            },
            visible: true,
            order: 2,
          },
        },
      };

      const company = await createCompany(companyData);

      toast.success("Company created successfully!");
      navigate(`/company/${formData.slug}/edit`);
    } catch (error) {
      toast.error(error.message || "Failed to create company");
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                error={!!errors.slug}
                helperText={
                  errors.slug ||
                  "This will be your careers page URL: yoursite.com/{slug}/careers"
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                multiline
                rows={3}
                placeholder="Tell candidates about your company..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Choose a template to get started
              </Typography>
            </Grid>
            {templates.map((template) => (
              <Grid item xs={12} md={4} key={template.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    border: formData.template === template.id ? 2 : 1,
                    borderColor:
                      formData.template === template.id
                        ? "primary.main"
                        : "grey.300",
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block">
                        Includes:
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {template.sections.map((section) => (
                          <Chip
                            key={section}
                            label={section}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: template.primaryColor,
                          borderRadius: 1,
                        }}
                      />
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: template.secondaryColor,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {errors.template && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.template}</Alert>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Customize your colors
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose colors that represent your brand. These will be used
                throughout your careers page.
              </Typography>
            </Grid>

            {/* Primary Color */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  Primary Color
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Main brand color for headers and buttons
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: formData.primaryColor,
                      borderRadius: 2,
                      border: "3px solid",
                      borderColor: "grey.300",
                      cursor: "pointer",
                      position: "relative",
                      boxShadow: 2,
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                    onClick={() =>
                      document.getElementById("primary-color-input").click()
                    }
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        right: 4,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        P
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      id="primary-color-input"
                      fullWidth
                      label="Primary Color"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        handleInputChange("primaryColor", e.target.value)
                      }
                      sx={{
                        '& input[type="color"]': {
                          height: 56,
                          cursor: "pointer",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {formData.primaryColor.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Secondary Color */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  Secondary Color
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Supporting color for accents and highlights
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: formData.secondaryColor,
                      borderRadius: 2,
                      border: "3px solid",
                      borderColor: "grey.300",
                      cursor: "pointer",
                      position: "relative",
                      boxShadow: 2,
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                    onClick={() =>
                      document.getElementById("secondary-color-input").click()
                    }
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        right: 4,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        S
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      id="secondary-color-input"
                      fullWidth
                      label="Secondary Color"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        handleInputChange("secondaryColor", e.target.value)
                      }
                      sx={{
                        '& input[type="color"]': {
                          height: 56,
                          cursor: "pointer",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {formData.secondaryColor.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Color Preview */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  Preview
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: formData.primaryColor,
                      "&:hover": {
                        backgroundColor: formData.primaryColor,
                        filter: "brightness(0.9)",
                      },
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
                        borderColor: formData.secondaryColor,
                        backgroundColor: `${formData.secondaryColor}10`,
                      },
                    }}
                  >
                    Secondary Button
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

            <Grid item xs={12}>
              <Alert severity="info" sx={{ backgroundColor: "blue.50" }}>
                <Typography variant="body2">
                  💡 <strong>Tip:</strong> You can customize more details like
                  logo, sections, and content after creating your company.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        }}
      >
        <Toolbar>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate("/")}
          >
            <Business sx={{ mr: 2 }} />
            <Typography variant="h6" component="div">
              Company Career
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={user?.email}
              variant="outlined"
              sx={{ color: "white", borderColor: "white" }}
            />
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Create Your Careers Page
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Let's set up your company's branded careers page in just a few
              steps
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    loading={loading}
                    startIcon={<Launch />}
                  >
                    Create Company
                  </LoadingButton>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default CompanySetup;
