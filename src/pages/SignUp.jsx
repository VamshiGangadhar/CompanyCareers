import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  LinearProgress,
  Fade,
  Zoom,
  Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Business,
  Email,
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const getPasswordStrengthLabel = (score) => {
    if (score < 2) return { label: "Weak", color: "error" };
    if (score < 4) return { label: "Fair", color: "warning" };
    if (score < 5) return { label: "Good", color: "info" };
    return { label: "Strong", color: "success" };
  };

  const validateField = (name, value, allData = formData) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== allData.password) return "Passwords do not match";
        return "";
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Please enter your full name";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    console.log("🔍 [SIGNUP] Form submission started with data:", {
      ...formData,
      password: "[REDACTED]",
      confirmPassword: "[REDACTED]",
    });

    if (!validateForm()) {
      console.log("❌ [SIGNUP] Validation failed:", errors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    console.log("✅ [SIGNUP] Validation passed, attempting signup...");
    setLoading(true);
    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      });

      console.log("📝 [SIGNUP] Signup result:", result);

      if (result.success) {
        toast.success("🎉 Account created successfully! Welcome aboard!");
        navigate("/dashboard");
      } else {
        console.error("❌ [SIGNUP] Signup failed:", result.error);
        toast.error(
          result.error || "Failed to create account. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ [SIGNUP] Registration error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(
      `📝 [SIGNUP] Field ${name} changed to:`,
      value.length > 0 ? `[${value.length} chars]` : "empty"
    );

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    if (submitAttempted) {
      const error = validateField(name, value, { ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
      if (error) {
        console.log(`⚠️ [SIGNUP] Validation error for ${name}:`, error);
      }
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={600}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Zoom
                in={true}
                timeout={800}
                style={{ transitionDelay: "200ms" }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Business
                      sx={{ fontSize: 40, color: "primary.main", mr: 1 }}
                    />
                    <Typography
                      variant="h3"
                      component="h1"
                      fontWeight="bold"
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Join Us
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    Create your account to get started
                  </Typography>
                </Box>
              </Zoom>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    name="fullName"
                    label="Full Name"
                    type="text"
                    fullWidth
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={!!(submitAttempted && errors.fullName)}
                    helperText={submitAttempted && errors.fullName}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                      },
                    }}
                  />

                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!(submitAttempted && errors.email)}
                    helperText={submitAttempted && errors.email}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                      },
                    }}
                  />

                  <Box>
                    <TextField
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={formData.password}
                      onChange={handleInputChange}
                      error={!!(submitAttempted && errors.password)}
                      helperText={submitAttempted && errors.password}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                          },
                        },
                      }}
                    />
                    {formData.password && (
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Password strength:
                          </Typography>
                          <Typography
                            variant="caption"
                            color={strengthInfo.color + ".main"}
                            sx={{ fontWeight: 600 }}
                          >
                            {strengthInfo.label}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(passwordStrength / 6) * 100}
                          color={strengthInfo.color}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    )}
                  </Box>

                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={!!(submitAttempted && errors.confirmPassword)}
                    helperText={submitAttempted && errors.confirmPassword}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {formData.confirmPassword &&
                            (formData.password === formData.confirmPassword ? (
                              <CheckCircle color="success" sx={{ mr: 1 }} />
                            ) : (
                              <Cancel color="error" sx={{ mr: 1 }} />
                            ))}
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                      },
                    }}
                  />

                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={loading}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.5)",
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                    }}
                  >
                    Create Account
                  </LoadingButton>
                </Box>
              </form>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: "rgba(76, 175, 80, 0.05)",
                  borderRadius: 2,
                  mt: 3,
                  border: "1px solid rgba(76, 175, 80, 0.1)",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  display="block"
                  sx={{ fontWeight: 500 }}
                >
                  🔒 Your data is secure and encrypted
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default SignUp;
