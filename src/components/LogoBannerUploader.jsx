import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { CloudUpload, Delete, Image, Wallpaper } from "@mui/icons-material";
import useCompanyStore from "../context/companyStore";

const LogoBannerUploader = () => {
  const {
    uploadLogo,
    uploadBanner,
    deleteLogo,
    deleteBanner,
    saving,
    company,
  } = useCompanyStore();

  const branding = company?.branding || {};

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogoFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo file size should be less than 5MB");
        return;
      }
      setLogoFile(file);
      setError("");
    }
  };

  const handleBannerFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("Banner file size should be less than 10MB");
        return;
      }
      setBannerFile(file);
      setError("");
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setError("Please select a logo file");
      return;
    }
    try {
      setError("");

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await uploadLogo({
            companySlug: company.slug,
            file: reader.result,
            filename: logoFile.name,
          });
          setSuccess("Logo uploaded successfully!");
          setLogoFile(null);
          // Reset file input
          const fileInput = document.getElementById("logo-file-input");
          if (fileInput) fileInput.value = "";
          setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
          setError(error.message || "Failed to upload logo");
        }
      };
      reader.readAsDataURL(logoFile);
    } catch (error) {
      setError(error.message || "Failed to upload logo");
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) {
      setError("Please select a banner file");
      return;
    }
    try {
      setError("");

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await uploadBanner({
            companySlug: company.slug,
            file: reader.result,
            filename: bannerFile.name,
          });
          setSuccess("Banner uploaded successfully!");
          setBannerFile(null);
          // Reset file input
          const fileInput = document.getElementById("banner-file-input");
          if (fileInput) fileInput.value = "";
          setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
          setError(error.message || "Failed to upload banner");
        }
      };
      reader.readAsDataURL(bannerFile);
    } catch (error) {
      setError(error.message || "Failed to upload banner");
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setError("");
      await deleteLogo({ companySlug: company.slug });
      setSuccess("Logo deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message || "Failed to delete logo");
    }
  };

  const handleDeleteBanner = async () => {
    try {
      setError("");
      await deleteBanner({ companySlug: company.slug });
      setSuccess("Banner deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message || "Failed to delete banner");
    }
  };

  return (
    <Stack spacing={3}>
      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Logo Section */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Image color="primary" />
              <Typography variant="h6">Company Logo</Typography>
              {branding.logo && (
                <Chip label="Active" size="small" color="success" />
              )}
            </Box>

            {/* Current Logo Display */}
            {branding.logo ? (
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={branding.logo}
                  alt="Company Logo"
                  sx={{ width: 80, height: 80 }}
                >
                  <Image />
                </Avatar>
                <Stack flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Current Logo URL:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-all",
                      backgroundColor: "grey.100",
                      p: 1,
                      borderRadius: 1,
                      fontSize: "0.8rem",
                    }}
                  >
                    {branding.logo}
                  </Typography>
                </Stack>
                <IconButton
                  onClick={handleDeleteLogo}
                  color="error"
                  disabled={saving}
                >
                  <Delete />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "grey.50",
                }}
              >
                <Image sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                <Typography color="text.secondary">No logo uploaded</Typography>
              </Box>
            )}

            {/* Logo Upload */}
            <Box>
              <Stack spacing={2}>
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  disabled={saving}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="logo-file-input"
                  startIcon={<CloudUpload />}
                  fullWidth
                  disabled={saving}
                  sx={{
                    py: 2,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    color: "text.secondary",
                    backgroundColor: "grey.50",
                    "&:hover": {
                      backgroundColor: "grey.100",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {logoFile ? `Selected: ${logoFile.name}` : "Choose Logo File"}
                </Button>
                {logoFile && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    File size: {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={handleLogoUpload}
                  disabled={saving || !logoFile}
                  startIcon={
                    saving ? <CircularProgress size={16} /> : <CloudUpload />
                  }
                  fullWidth
                >
                  {saving ? "Uploading..." : "Upload Logo File"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Banner Section */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Wallpaper color="primary" />
              <Typography variant="h6">Company Banner</Typography>
              {branding.banner && (
                <Chip label="Active" size="small" color="success" />
              )}
            </Box>

            {/* Current Banner Display */}
            {branding.banner ? (
              <Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    borderRadius: 2,
                    backgroundImage: `url(${branding.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid",
                    borderColor: "grey.300",
                    position: "relative",
                  }}
                >
                  <IconButton
                    onClick={handleDeleteBanner}
                    color="error"
                    disabled={saving}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Current Banner URL:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: "break-all",
                    backgroundColor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                    fontSize: "0.8rem",
                  }}
                >
                  {branding.banner}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "grey.50",
                  height: 150,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Wallpaper sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                <Typography color="text.secondary">
                  No banner uploaded
                </Typography>
              </Box>
            )}

            {/* Banner Upload */}
            <Box>
              <Stack spacing={2}>
                <input
                  id="banner-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  disabled={saving}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="banner-file-input"
                  startIcon={<CloudUpload />}
                  fullWidth
                  disabled={saving}
                  sx={{
                    py: 2,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    color: "text.secondary",
                    backgroundColor: "grey.50",
                    "&:hover": {
                      backgroundColor: "grey.100",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {bannerFile
                    ? `Selected: ${bannerFile.name}`
                    : "Choose Banner File"}
                </Button>
                {bannerFile && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    File size: {(bannerFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={handleBannerUpload}
                  disabled={saving || !bannerFile}
                  startIcon={
                    saving ? <CircularProgress size={16} /> : <CloudUpload />
                  }
                  fullWidth
                >
                  {saving ? "Uploading..." : "Upload Banner File"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              <strong>Tip:</strong> For best results, use banner images with a
              16:9 aspect ratio (1920x1080px or similar). Max file size: 10MB.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default LogoBannerUploader;
