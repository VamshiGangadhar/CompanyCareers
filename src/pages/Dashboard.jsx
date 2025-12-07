import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  CardMedia,
  Fade,
  Zoom,
  Skeleton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Add,
  Edit,
  Preview,
  Launch,
  Business,
  AccountCircle,
  Logout,
  Search,
  TrendingUp,
  Group,
  Work,
  Visibility,
  Settings,
  Star,
  Refresh,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchSlug, setSearchSlug] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    console.log("🔄 [DASHBOARD] useEffect triggered, user state:", {
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      authLoading,
      localLoading: loading,
    });

    if (!authLoading) {
      fetchUserCompanies();
    }
  }, [user, authLoading]);

  const fetchUserCompanies = async () => {
    console.log("🔍 [DASHBOARD] fetchUserCompanies called with:", {
      user: user ? { id: user.id, email: user.email } : null,
      authLoading,
      localLoading: loading,
    });

    if (!user) {
      console.log("🚫 [DASHBOARD] No user found, skipping company fetch");
      setLoading(false);
      return;
    }

    console.log("🚀 [DASHBOARD] Starting company fetch for user:", {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    try {
      setLoading(true);
      setError("");

      const requestPayload = {
        step: "GET_USER_COMPANIES",
        payload: {
          userEmail: user.email,
          userId: user.id,
        },
      };

      console.log("📤 [DASHBOARD] Sending API request:", {
        url: `${API_URL}/api/event`,
        payload: requestPayload,
      });

      // Try to get companies based on user email
      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestPayload),
      });

      console.log("📥 [DASHBOARD] API response status:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 [DASHBOARD] API response data:", {
          success: data.success,
          companiesCount: data.data?.companies?.length || 0,
          companies:
            data.data?.companies?.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              created_by: c.created_by,
            })) || [],
        });

        if (data.success && data.data?.companies) {
          console.log(
            "✅ [DASHBOARD] Setting companies:",
            data.data.companies.length
          );
          setCompanies(data.data.companies);

          // Save company slugs for future reference
          const slugs = data.data.companies.map((c) => c.slug);
          localStorage.setItem("userCompanySlugs", JSON.stringify(slugs));
          console.log(
            "💾 [DASHBOARD] Saved company slugs to localStorage:",
            slugs
          );
        } else {
          console.log("❌ [DASHBOARD] No companies found in response");
          setCompanies([]);
        }
      } else {
        const errorText = await response.text();
        console.log("❌ [DASHBOARD] API request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        console.log(
          "🔄 [DASHBOARD] GET_USER_COMPANIES endpoint failed, checking for saved companies"
        );

        // Fallback: Check localStorage for previously saved companies
        const savedCompanySlugs = localStorage.getItem("userCompanySlugs");
        if (savedCompanySlugs) {
          const slugs = JSON.parse(savedCompanySlugs);
          const companiesData = [];

          for (const slug of slugs) {
            try {
              const companyResponse = await fetch(`${API_URL}/api/event`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  step: "GET_COMPANY",
                  payload: { slug },
                }),
              });

              if (companyResponse.ok) {
                const companyData = await companyResponse.json();
                if (companyData.success && companyData.data) {
                  companiesData.push(companyData.data);
                }
              }
            } catch (err) {
              console.error("Error fetching company:", slug, err);
            }
          }

          setCompanies(companiesData);
        } else {
          // No saved companies, show empty state
          setCompanies([]);
        }
      }
    } catch (error) {
      console.error("Dashboard: Error fetching companies:", error);
      setError(error.message);
      toast.error(`Failed to load companies: ${error.message}`);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check localStorage
  const debugLocalStorage = () => {
    console.log("🔍 [DEBUG] LocalStorage contents:");
    console.log("userData:", localStorage.getItem("userData"));
    console.log("token:", localStorage.getItem("token"));
    console.log("userCompanySlugs:", localStorage.getItem("userCompanySlugs"));
    console.log("Current user state:", user);

    // Force reload user from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log("🔄 [DEBUG] Parsed user from localStorage:", parsedUser);
    }
  };

  const searchForCompany = async () => {
    if (!searchSlug.trim()) {
      toast.error("Please enter a company slug");
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          step: "GET_COMPANY",
          payload: { slug: searchSlug.toLowerCase().trim() },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          // Add this company to the user's list
          const updatedCompanies = [...companies, data.data];
          setCompanies(updatedCompanies);

          // Save to localStorage for future sessions
          const slugs = updatedCompanies.map((c) => c.slug);
          localStorage.setItem("userCompanySlugs", JSON.stringify(slugs));

          toast.success("Company found and added to your list!");
          setSearchDialogOpen(false);
          setSearchSlug("");
        } else {
          toast.error("Company not found");
        }
      } else {
        toast.error("Company not found or you don't have access");
      }
    } catch (error) {
      console.error("Error searching for company:", error);
      toast.error("Error searching for company");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
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

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            mb: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: 3,
            p: 4,
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Business
                sx={{
                  fontSize: 32,
                  color: "primary.main",
                  mr: 2,
                }}
              />
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 0,
                }}
              >
                Your Companies
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400 }}
            >
              Manage your company careers pages and job listings with ease
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
              <Chip
                icon={<TrendingUp />}
                label={`${companies.length} Active Companies`}
                color="primary"
                variant="outlined"
              />
              {user && (
                <Chip
                  icon={<AccountCircle />}
                  label={user.name}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Tooltip title="Debug authentication info">
              <Button
                variant="outlined"
                color="secondary"
                onClick={debugLocalStorage}
                startIcon={<Settings />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Debug Info
              </Button>
            </Tooltip>
            {!authLoading && !loading && companies.length > 0 && (
              <Tooltip title="Refresh companies list">
                <Button
                  variant="outlined"
                  onClick={fetchUserCompanies}
                  disabled={loading || authLoading}
                  startIcon={<Refresh />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Refresh
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Create a new company">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/setup")}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                  },
                }}
              >
                Create Company
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {authLoading || loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {authLoading
                ? "Checking authentication..."
                : "Loading companies..."}
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchUserCompanies}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : companies.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              border: "2px dashed",
              borderColor: "grey.300",
              borderRadius: 2,
              backgroundColor: "grey.50",
            }}
          >
            <Business sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No companies yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first company careers page to get started, or find
              your existing company
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => navigate("/setup")}
              >
                Create Your First Company
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Search />}
                onClick={() => setSearchDialogOpen(true)}
              >
                Find My Company
              </Button>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Company Cards */}
            {companies.map((company, index) => (
              <Grid item xs={12} md={6} lg={4} key={company.slug}>
                <Zoom
                  in={true}
                  timeout={300 + index * 100}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      position: "relative",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      borderRadius: 3,
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.15)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {/* Company Header with Gradient */}
                    <Box
                      sx={{
                        height: 80,
                        background: company.branding?.primaryColor
                          ? `linear-gradient(135deg, ${
                              company.branding.primaryColor
                            } 0%, ${
                              company.branding.secondaryColor ||
                              company.branding.primaryColor
                            } 100%)`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        px: 3,
                      }}
                    >
                      {company.branding?.logo ? (
                        <Avatar
                          src={company.branding.logo}
                          sx={{
                            width: 48,
                            height: 48,
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            fontSize: 20,
                            fontWeight: 600,
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                          }}
                        >
                          {company.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      )}

                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "white",
                            fontSize: "1.1rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {company.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "0.8rem",
                          }}
                        >
                          /{company.slug}
                        </Typography>
                      </Box>

                      {/* Status Badge */}
                      <Chip
                        label={company.isActive ? "Active" : "Draft"}
                        size="small"
                        sx={{
                          bgcolor: company.isActive
                            ? "rgba(76, 175, 80, 0.9)"
                            : "rgba(255, 255, 255, 0.9)",
                          color: company.isActive ? "white" : "text.primary",
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "180px",
                        flexGrow: 1,
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        {company.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.5,
                            }}
                          >
                            {company.description}
                          </Typography>
                        )}

                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            Last updated:{" "}
                            {new Date(
                              company.updatedAt || company.createdAt
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: "auto",
                        }}
                      >
                        <Chip
                          icon={<Work />}
                          label={`${
                            Object.keys(company.sections || {}).length
                          } sections`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "primary.main",
                            color: "primary.main",
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          icon={<Group />}
                          label={`${(company.team || []).length} members`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "secondary.main",
                            color: "secondary.main",
                            fontWeight: 500,
                          }}
                        />
                        {company.branding?.primaryColor && (
                          <Chip
                            label="Branded"
                            size="small"
                            sx={{
                              bgcolor: company.branding.primaryColor + "20",
                              color: company.branding.primaryColor,
                              fontWeight: 500,
                              border: `1px solid ${company.branding.primaryColor}30`,
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>

                    <CardActions
                      sx={{
                        p: 3,
                        pt: 0,
                        gap: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
                        <Tooltip title="Edit company">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            component={Link}
                            to={`/company/${company.slug}/edit`}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              flex: 1,
                              "&:hover": {
                                backgroundColor: "rgba(102, 126, 234, 0.04)",
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        <Tooltip title="Preview careers page">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Preview />}
                            component={Link}
                            to={`/company/${company.slug}/preview`}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              flex: 1,
                              borderColor: "secondary.main",
                              color: "secondary.main",
                              "&:hover": {
                                backgroundColor: "rgba(118, 75, 162, 0.04)",
                                borderColor: "secondary.dark",
                              },
                            }}
                          >
                            Preview
                          </Button>
                        </Tooltip>
                      </Box>
                      <Tooltip title="Visit live site">
                        <IconButton
                          component={Link}
                          to={`/${company.slug}/careers`}
                          target="_blank"
                          sx={{
                            color: "success.main",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.08)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s",
                          }}
                        >
                          <Launch />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Search Company Dialog */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Find Your Company</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your company's slug to add it to your dashboard. The slug is
            usually the part that appears in your careers page URL after the
            domain.
          </Typography>
          <TextField
            fullWidth
            label="Company Slug"
            value={searchSlug}
            onChange={(e) => setSearchSlug(e.target.value)}
            placeholder="e.g., demo-company"
            helperText="Enter the company slug (usually found in the URL: yoursite.com/company-slug/careers)"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                searchForCompany();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={searchForCompany}
            disabled={searchLoading || !searchSlug.trim()}
          >
            {searchLoading ? <CircularProgress size={20} /> : "Find Company"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
