import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCompanyStore from "../context/companyStore";
import ThemeEditor from "../components/ThemeEditor";
import SectionBuilder from "../components/SectionBuilder";
import JobManager from "../components/JobManager";
import TeamManager from "../components/TeamManager";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Paper,
  CircularProgress,
  Backdrop,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Palette,
  Article,
  Work,
  Preview,
  Launch,
  Save,
  AccountCircle,
  Logout,
  Group,
  Business,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import toast from "react-hot-toast";

const CompanyEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company, fetchCompany, updateCompany, loading } = useCompanyStore();
  const [activeTab, setActiveTab] = useState("design");
  const [saving, setSaving] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    console.log("CompanyEditor: slug =", slug);
    if (slug) {
      console.log("CompanyEditor: Fetching company with slug:", slug);
      fetchCompany(slug)
        .then((data) => {
          console.log("CompanyEditor: Company fetched successfully:", data);
        })
        .catch((error) => {
          console.error("CompanyEditor: Failed to fetch company:", error);
          toast.error("Failed to load company data");
        });
    }
  }, [slug, fetchCompany]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompany(slug, company);
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const tabs = [
    {
      id: "design",
      label: "Design & Branding",
      icon: <Palette />,
      color: "primary",
    },
    {
      id: "content",
      label: "Content & Sections",
      icon: <Article />,
      color: "secondary",
    },
    {
      id: "team",
      label: "Team Management",
      icon: <Group />,
      color: "info",
    },
    { id: "jobs", label: "Job Management", icon: <Work />, color: "success" },
  ];

  if (loading) {
    return (
      <Backdrop
        open={true}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading company data...
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
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
            <Typography variant="h6" component="h1" fontWeight="bold">
              {company?.name || "Company"} Editor
            </Typography>
            <Chip
              label={slug}
              size="small"
              variant="outlined"
              sx={{ bgcolor: "white", color: "primary.main" }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={Link}
              to={`/company/${slug}/preview`}
              variant="outlined"
              startIcon={<Preview />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": { borderColor: "grey.300" },
              }}
            >
              Preview
            </Button>
            <Button
              component={Link}
              to={`/${slug}/careers`}
              target="_blank"
              variant="outlined"
              startIcon={<Launch />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": { borderColor: "grey.300" },
              }}
            >
              View Live
            </Button>
            <LoadingButton
              variant="contained"
              startIcon={<Save />}
              loading={saving}
              onClick={handleSave}
              sx={{
                bgcolor: "secondary.main",
                "&:hover": { bgcolor: "secondary.dark" },
              }}
            >
              Save Changes
            </LoadingButton>

            <IconButton onClick={handleMenuClick} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <AccountCircle sx={{ mr: 1 }} />
                {user?.email}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "grey.200",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            EDITOR SECTIONS
          </Typography>
          <List>
            {tabs.map((tab) => (
              <ListItem key={tab.id} disablePadding>
                <ListItemButton
                  selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&.Mui-selected": {
                      bgcolor: `${tab.color}.50`,
                      color: `${tab.color}.main`,
                      "& .MuiListItemIcon-root": {
                        color: `${tab.color}.main`,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{tab.icon}</ListItemIcon>
                  <ListItemText
                    primary={tab.label}
                    primaryTypographyProps={{
                      fontWeight: activeTab === tab.id ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "grey.50",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {activeTab === "design" && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  fontWeight="bold"
                >
                  Design & Branding
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Customize your careers page appearance, colors, and visual
                  elements
                </Typography>
              </Box>
              <ThemeEditor />
            </Box>
          )}

          {activeTab === "content" && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  fontWeight="bold"
                >
                  Content & Sections
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Build and organize your careers page content sections
                </Typography>
              </Box>
              <SectionBuilder slug={slug} />
            </Box>
          )}

          {activeTab === "team" && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  fontWeight="bold"
                >
                  Team Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Add, edit, and organize your team members with drag-and-drop
                  functionality
                </Typography>
              </Box>
              <TeamManager />
            </Box>
          )}

          {activeTab === "jobs" && <JobManager />}
        </Container>
      </Box>
    </Box>
  );
};

export default CompanyEditor;
