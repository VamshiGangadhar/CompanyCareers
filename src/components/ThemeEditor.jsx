import { useState } from "react";
import { ChromePicker } from "react-color";
import useCompanyStore from "../context/companyStore";
import { isValidHexColor } from "../utils";
import { DefaultBranding } from "../constants";
import LogoBannerUploader from "./LogoBannerUploader";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CloudUpload, Close } from "@mui/icons-material";

const ThemeEditor = () => {
  const { company, updateBranding, saving } = useCompanyStore();
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  const branding = company?.branding || {};

  const handleColorChange = (field, color) => {
    updateBranding({ [field]: color.hex });
  };

  const resetToDefaults = () => {
    updateBranding({
      primaryColor: "#3b82f6",
      secondaryColor: "#1f2937",
      backgroundColor: "#ffffff",
      textColor: "#374151",
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
    });
  };

  const colorFields = [
    { key: "primaryColor", label: "Primary Color", defaultValue: "#3b82f6" },
    {
      key: "secondaryColor",
      label: "Secondary Color",
      defaultValue: "#1f2937",
    },
    {
      key: "backgroundColor",
      label: "Background Color",
      defaultValue: "#ffffff",
    },
    { key: "textColor", label: "Text Color", defaultValue: "#374151" },
  ];

  const layoutOptions = [
    {
      key: "containerWidth",
      label: "Container Width",
      options: ["full", "wide", "normal", "narrow"],
    },
    {
      key: "spacing",
      label: "Section Spacing",
      options: ["tight", "normal", "loose"],
    },
    {
      key: "borderRadius",
      label: "Border Radius",
      options: ["none", "small", "medium", "large"],
    },
    {
      key: "layoutStyle",
      label: "Layout Style",
      options: ["modern", "classic", "minimal", "bold"],
    },
  ];

  const fontOptions = [
    {
      key: "fontFamily",
      label: "Font Family",
      options: ["Inter", "Roboto", "Open Sans", "Poppins", "Lato"],
    },
    {
      key: "fontSize",
      label: "Base Font Size",
      options: ["small", "medium", "large"],
    },
    {
      key: "fontWeight",
      label: "Font Weight",
      options: ["light", "normal", "medium", "bold"],
    },
  ];

  const handleLayoutChange = (field, value) => {
    const currentLayout = branding.layout || {};
    updateBranding({
      layout: { ...currentLayout, [field]: value },
    });
  };

  const handleFontChange = (field, value) => {
    const currentTypography = branding.typography || {};
    updateBranding({
      typography: { ...currentTypography, [field]: value },
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              background: "linear-gradient(45deg, #2563eb, #3b82f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Theme Customization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your career page's appearance and branding
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {saving && (
            <Typography variant="body2" color="text.secondary">
              Saving changes...
            </Typography>
          )}
          <Button
            variant="outlined"
            onClick={resetToDefaults}
            size="small"
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Box>

      {/* Color Pickers */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            "&::before": {
              content: '"🎨"',
              fontSize: "1.2rem",
            },
          }}
        >
          Colors
        </Typography>
        <Grid container spacing={3}>
          {colorFields.map((field) => (
            <Grid item xs={12} sm={6} md={3} key={field.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.15)",
                  },
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                }}
                onClick={() => setActiveColorPicker(field.key)}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                    mb: 2,
                    fontSize: "0.875rem",
                  }}
                >
                  {field.label}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 48,
                    backgroundColor: branding[field.key] || field.defaultValue,
                    border: "2px solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    borderRadius: 2,
                    cursor: "pointer",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                      pointerEvents: "none",
                    },
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Layout Options */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            "&::before": {
              content: '"📐"',
              fontSize: "1.2rem",
            },
          }}
        >
          Layout Settings
        </Typography>
        <Grid container spacing={3}>
          {layoutOptions.map((field) => (
            <Grid item xs={12} sm={6} key={field.key}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                    },
                  },
                }}
              >
                <InputLabel sx={{ fontWeight: 500 }}>{field.label}</InputLabel>
                <Select
                  value={
                    (branding.layout && branding.layout[field.key]) ||
                    field.options[1] ||
                    field.options[0]
                  }
                  label={field.label}
                  onChange={(e) =>
                    handleLayoutChange(field.key, e.target.value)
                  }
                >
                  {field.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Typography Options */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            "&::before": {
              content: '"✒️"',
              fontSize: "1.2rem",
            },
          }}
        >
          Typography
        </Typography>
        <Grid container spacing={3}>
          {fontOptions.map((field) => (
            <Grid item xs={12} sm={4} key={field.key}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                    },
                  },
                }}
              >
                <InputLabel sx={{ fontWeight: 500 }}>{field.label}</InputLabel>
                <Select
                  value={
                    (branding.typography && branding.typography[field.key]) ||
                    field.options[1] ||
                    field.options[0]
                  }
                  label={field.label}
                  onChange={(e) => handleFontChange(field.key, e.target.value)}
                >
                  {field.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Color Picker Dialog */}
      <Dialog
        open={!!activeColorPicker}
        onClose={() => setActiveColorPicker(null)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight={600}>
              Choose{" "}
              {colorFields.find((f) => f.key === activeColorPicker)?.label}
            </Typography>
            <IconButton
              onClick={() => setActiveColorPicker(null)}
              sx={{
                backgroundColor: "grey.100",
                "&:hover": { backgroundColor: "grey.200" },
              }}
            >
              <Close />
            </IconButton>
          </Box>
          {activeColorPicker && (
            <Box display="flex" justifyContent="center">
              <ChromePicker
                color={
                  branding[activeColorPicker] ||
                  colorFields.find((f) => f.key === activeColorPicker)
                    ?.defaultValue
                }
                onChange={(color) =>
                  handleColorChange(activeColorPicker, color)
                }
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Logo & Banner Upload */}
      <Box sx={{ mb: 4 }}>
        <LogoBannerUploader />
      </Box>

      {/* Live Preview */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            "&::before": {
              content: '"👀"',
              fontSize: "1.2rem",
            },
          }}
        >
          Live Preview
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 3,
            backgroundColor: branding.backgroundColor || "#ffffff",
            fontFamily: branding.typography?.fontFamily || "Inter",
            fontSize:
              branding.typography?.fontSize === "small"
                ? "14px"
                : branding.typography?.fontSize === "large"
                ? "18px"
                : "16px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '"Preview"',
              position: "absolute",
              top: 12,
              right: 12,
              fontSize: "0.75rem",
              color: "text.secondary",
              backgroundColor: "background.paper",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <Box
            sx={{
              maxWidth:
                branding.layout?.containerWidth === "full"
                  ? "100%"
                  : branding.layout?.containerWidth === "wide"
                  ? "1400px"
                  : branding.layout?.containerWidth === "narrow"
                  ? "800px"
                  : "1200px",
              mx: "auto",
            }}
          >
            {/* Header Preview */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${
                  branding.primaryColor || "#3b82f6"
                }, ${branding.secondaryColor || "#1f2937"})`,
                color: "#ffffff",
                p: 3,
                mb:
                  branding.layout?.spacing === "tight"
                    ? 2
                    : branding.layout?.spacing === "loose"
                    ? 4
                    : 3,
                borderRadius:
                  branding.layout?.borderRadius === "none"
                    ? 0
                    : branding.layout?.borderRadius === "small"
                    ? 1
                    : branding.layout?.borderRadius === "medium"
                    ? 2
                    : 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h4"
                fontWeight={
                  branding.typography?.fontWeight === "light"
                    ? 300
                    : branding.typography?.fontWeight === "bold"
                    ? 700
                    : branding.typography?.fontWeight === "medium"
                    ? 500
                    : 400
                }
                sx={{ mb: 1 }}
              >
                {company?.name || "Your Company"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Welcome to our careers page - Join our amazing team!
              </Typography>
            </Box>

            {/* Content Preview */}
            <Box
              sx={{
                p: 2,
                backgroundColor: branding.secondaryColor || "#1f2937",
                color: branding.textColor || "#374151",
                mb:
                  branding.layout?.spacing === "tight"
                    ? 1
                    : branding.layout?.spacing === "loose"
                    ? 4
                    : 2,
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" sx={{ color: branding.primaryColor }}>
                About Us
              </Typography>
              <Typography variant="body2">
                This is a preview of how your content will look with the current
                theme settings.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
};

export default ThemeEditor;
