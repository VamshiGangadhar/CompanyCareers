import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../utils";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Business,
  Email,
  Visibility,
  VisibilityOff,
  Lock,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        return "";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during login. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (submitAttempted && errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
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
            "radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="xs">
        <Fade in={true} timeout={600}>
          <Card
            elevation={8}
            sx={{
              borderRadius: 4,
              background: "#ffffff",
              border: "1px solid rgba(102, 126, 234, 0.08)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Zoom
                in={true}
                timeout={800}
                style={{ transitionDelay: "200ms" }}
              >
                <Box textAlign="center" mb={3}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <Business
                      sx={{ fontSize: 32, color: "primary.main", mr: 1 }}
                    />
                    <Typography
                      variant="h4"
                      component="h1"
                      fontWeight="bold"
                      sx={{
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      CompanyCareers
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    Welcome back! Sign in to your account
                  </Typography>
                </Box>
              </Zoom>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={!!(submitAttempted && errors.email)}
                  helperText={submitAttempted && errors.email}
                  margin="normal"
                  variant="outlined"
                  autoComplete="email"
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

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={!!(submitAttempted && errors.password)}
                  helperText={submitAttempted && errors.password}
                  margin="normal"
                  variant="outlined"
                  autoComplete="current-password"
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
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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
                  fullWidth
                  variant="contained"
                  size="medium"
                  loading={loading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 16px rgba(79, 70, 229, 0.3)",
                      background:
                        "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
                    },
                  }}
                >
                  Sign In
                </LoadingButton>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      style={{
                        color: "#4f46e5",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Sign Up
                    </Link>
                  </Typography>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: "rgba(79, 70, 229, 0.03)",
                  borderRadius: 2,
                  mt: 2,
                  border: "1px solid rgba(79, 70, 229, 0.08)",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                >
                  <strong>💡 Demo Credentials</strong>
                  <br />
                  📧 Email: admin@demo.com
                  <br />
                  🔒 Password: password123
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
