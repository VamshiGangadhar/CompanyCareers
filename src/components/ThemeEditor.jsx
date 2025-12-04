import { useState } from "react";
import { ChromePicker } from "react-color";
import { useDropzone } from "react-dropzone";
import useCompanyStore from "../context/companyStore";
import { isValidHexColor } from "../utils";
import { DefaultBranding } from "../constants";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import { CloudUpload, Close } from "@mui/icons-material";

const ThemeEditor = () => {
  const { company, updateBranding } = useCompanyStore();
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  const branding = company?.branding || {};

  const handleColorChange = (field, color) => {
    updateBranding({ [field]: color.hex });
  };

  const { getRootProps: getLogoProps, getInputProps: getLogoInputProps } =
    useDropzone({
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            updateBranding({ logo: reader.result });
          };
          reader.readAsDataURL(file);
        }
      },
    });

  const { getRootProps: getBannerProps, getInputProps: getBannerInputProps } =
    useDropzone({
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            updateBranding({ banner: reader.result });
          };
          reader.readAsDataURL(file);
        }
      },
    });

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

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="medium">
        Theme Customization
      </Typography>

      {/* Color Pickers */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Grid container spacing={2}>
          {colorFields.map((field) => (
            <Grid item xs={12} sm={6} key={field.key}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {field.label}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: 60,
                    height: 40,
                    backgroundColor: branding[field.key] || field.defaultValue,
                    "&:hover": {
                      backgroundColor:
                        branding[field.key] || field.defaultValue,
                    },
                  }}
                  onClick={() =>
                    setActiveColorPicker(
                      activeColorPicker === field.key ? null : field.key
                    )
                  }
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Color Picker Dialog */}
        <Dialog
          open={!!activeColorPicker}
          onClose={() => setActiveColorPicker(null)}
          maxWidth="sm"
        >
          <DialogContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                Choose{" "}
                {colorFields.find((f) => f.key === activeColorPicker)?.label}
              </Typography>
              <IconButton onClick={() => setActiveColorPicker(null)}>
                <Close />
              </IconButton>
            </Box>
            {activeColorPicker && (
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
            )}
          </DialogContent>
        </Dialog>
      </Box>

      {/* Logo Upload */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Logo
        </Typography>
        <Paper
          {...getLogoProps()}
          elevation={0}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: "grey.300",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "grey.50",
            },
          }}
        >
          <input {...getLogoInputProps()} />
          {branding.logo ? (
            <Box>
              <img
                src={branding.logo}
                alt="Logo preview"
                style={{ height: 64, maxWidth: "100%", objectFit: "contain" }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click to change logo
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drag & drop or click to upload logo
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Banner Upload */}
      <Box>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Banner Image
        </Typography>
        <Paper
          {...getBannerProps()}
          elevation={0}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: "grey.300",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "grey.50",
            },
          }}
        >
          <input {...getBannerInputProps()} />
          {branding.banner ? (
            <Box>
              <img
                src={branding.banner}
                alt="Banner preview"
                style={{
                  height: 96,
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click to change banner
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drag & drop or click to upload banner
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Paper>
  );
};

export default ThemeEditor;
