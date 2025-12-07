import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useCompanyStore from "../context/companyStore";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Fab,
  Tooltip,
  Badge,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as SalaryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  DateRange as DateIcon,
  Business as DepartmentIcon,
  WorkOutline as JobTypeIcon,
  CheckCircle as StatusIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const JobManager = () => {
  const { user } = useAuth();
  const { company } = useCompanyStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    location: "",
    locationType: "",
    type: "",
    experienceLevel: "",
    description: "",
    responsibilities: [],
    requirements: [],
    skills: [],
    benefits: [],
    perks: [],
    salary: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    isActive: true,
    isFeatured: false,
    applicationUrl: "",
    deadline: null,
  });

  const locationTypes = ["Remote", "On-site", "Hybrid"];
  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
  const experienceLevels = ["Entry", "Mid", "Senior", "Lead"];
  const currencies = ["USD", "EUR", "GBP", "INR"];

  useEffect(() => {
    console.log("JobManager: Company changed:", {
      hasCompany: !!company,
      companyId: company?.id,
      companySlug: company?.slug,
    });

    if (company?.id && company?.slug) {
      fetchJobs();
    } else if (company === null) {
      console.log("JobManager: Company is null, waiting for load");
    }
  }, [company?.id, company?.slug]);

  const fetchJobs = async () => {
    if (!company?.slug) {
      console.log("Company not loaded yet, skipping fetch jobs");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          step: "GET_JOBS",
          payload: {
            companySlug: company.slug,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data?.jobs || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error(`Failed to load jobs: ${error.message}`);
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        ...job,
        responsibilities: job.responsibilities || [],
        requirements: job.requirements || [],
        skills: job.skills || [],
        benefits: job.benefits || [],
        perks: job.perks || [],
        deadline: job.deadline ? dayjs(job.deadline) : null,
      });
    } else {
      setEditingJob(null);
      setJobForm({
        title: "",
        department: "",
        location: "",
        locationType: "",
        type: "",
        experienceLevel: "",
        description: "",
        responsibilities: [],
        requirements: [],
        skills: [],
        benefits: [],
        perks: [],
        salary: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        isActive: true,
        isFeatured: false,
        applicationUrl: "",
        deadline: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingJob(null);
  };

  const handleSubmit = async () => {
    if (!company?.id) {
      toast.error("Company information not loaded. Please refresh the page.");
      return;
    }

    if (!jobForm.title?.trim()) {
      toast.error("Job title is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("JobManager: Submitting job:", {
        editing: !!editingJob,
        hasToken: !!token,
        companyId: company.id,
        title: jobForm.title,
      });

      const submitData = {
        ...jobForm,
        deadline: jobForm.deadline ? jobForm.deadline.toISOString() : null,
        salaryMin: jobForm.salaryMin ? parseInt(jobForm.salaryMin) : null,
        salaryMax: jobForm.salaryMax ? parseInt(jobForm.salaryMax) : null,
        companyId: company.id,
      };

      const step = editingJob ? "UPDATE_JOB" : "ADD_JOB";
      if (editingJob) {
        submitData.id = editingJob.id;
      }

      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          step,
          payload: submitData,
        }),
      });

      if (response.ok) {
        toast.success(
          editingJob ? "Job updated successfully!" : "Job created successfully!"
        );
        handleCloseDialog();
        fetchJobs();
      } else {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to save job");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!jobId) {
      toast.error("Invalid job ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          step: "DELETE_JOB",
          payload: { id: jobId },
        }),
      });

      if (response.ok) {
        toast.success("Job deleted successfully!");
        fetchJobs();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(`Failed to delete job: ${error.message}`);
    }
  };

  const handleToggleStatus = async (jobId) => {
    if (!jobId) {
      toast.error("Invalid job ID");
      return;
    }

    try {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) {
        toast.error("Job not found");
        return;
      }

      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          step: "UPDATE_JOB",
          payload: {
            id: jobId,
            isActive: !job.isActive,
          },
        }),
      });

      if (response.ok) {
        toast.success("Job status updated!");
        fetchJobs();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to update job status"
        );
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error(`Failed to update job status: ${error.message}`);
    }
  };

  const handleArrayFieldChange = (field, value) => {
    const items = value.split("\n").filter((item) => item.trim());
    setJobForm((prev) => ({ ...prev, [field]: items }));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !filterDepartment || job.department === filterDepartment;
    const matchesType = !filterType || job.type === filterType;
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && job.isActive) ||
      (filterActive === "inactive" && !job.isActive);

    return matchesSearch && matchesDepartment && matchesType && matchesActive;
  });

  const departments = [
    ...new Set(jobs.map((job) => job.department).filter(Boolean)),
  ];

  // Early return if company is not loaded
  if (!company) {
    return (
      <Box textAlign="center" py={8}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading company information...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please wait while we load your company data
        </Typography>
      </Box>
    );
  }

  if (!company.id) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error" gutterBottom>
          Error: Company data incomplete
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Company information is missing required fields. Please try refreshing
          the page.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Enhanced Header with Stats */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Job Management Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Create, manage, and track job postings for{" "}
                {company?.name || "your company"}
              </Typography>
              <Box display="flex" gap={4}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {jobs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Jobs
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {jobs.filter((job) => job.isActive).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {jobs.filter((job) => job.isFeatured).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Featured
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {new Set(jobs.map((job) => job.department)).size}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Departments
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  Create New Job
                </Button>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Last updated: {jobs.length > 0 ? "Today" : "No jobs yet"}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Filters */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <FilterIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Search & Filter
            </Typography>
            <Chip
              label={`${filteredJobs.length} results`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2.5}>
              <FormControl
                fullWidth
                sx={{
                  minWidth: 140,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <FormControl
                fullWidth
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              >
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <FormControl
                fullWidth
                sx={{
                  minWidth: 100,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Jobs</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={0.5}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDepartment("");
                    setFilterType("");
                    setFilterActive("all");
                  }}
                  sx={{
                    minWidth: "auto",
                    px: 1,
                    py: 1.5,
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Quick Filter Chips */}
          {(searchTerm ||
            filterDepartment ||
            filterType ||
            filterActive !== "all") && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => setSearchTerm("")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filterDepartment && (
                  <Chip
                    label={`Department: ${filterDepartment}`}
                    onDelete={() => setFilterDepartment("")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filterType && (
                  <Chip
                    label={`Type: ${filterType}`}
                    onDelete={() => setFilterType("")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filterActive !== "all" && (
                  <Chip
                    label={`Status: ${filterActive}`}
                    onDelete={() => setFilterActive("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Enhanced Jobs Grid */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading jobs...
            </Typography>
          </Box>
        ) : filteredJobs.length === 0 ? (
          <Paper
            elevation={3}
            sx={{ p: 8, textAlign: "center", backgroundColor: "#fafafa" }}
          >
            <WorkIcon sx={{ fontSize: 80, color: "grey.400", mb: 3 }} />
            <Typography variant="h4" gutterBottom color="text.secondary">
              {jobs.length === 0
                ? "No Jobs Created Yet"
                : "No Jobs Match Your Filters"}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
            >
              {jobs.length === 0
                ? "Start building your team by creating your first job posting. Attract talented candidates and grow your company."
                : "Try adjusting your search criteria or clearing some filters to see more results."}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              {jobs.length === 0 ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                >
                  Create Your First Job
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterDepartment("");
                      setFilterType("");
                      setFilterActive("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Create New Job
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card
                  elevation={job.isFeatured ? 4 : 2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: job.isFeatured ? "2px solid" : "1px solid",
                    borderColor: job.isFeatured ? "warning.main" : "grey.200",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  {job.isFeatured && (
                    <Chip
                      label="FEATURED"
                      color="warning"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        fontWeight: "bold",
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {job.title}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ mb: 2 }}
                      >
                        <Chip
                          label={job.department}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={job.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {!job.isActive && (
                          <Chip label="INACTIVE" size="small" color="error" />
                        )}
                      </Stack>
                    </Box>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center">
                        <LocationIcon
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {job.location} • {job.locationType}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <ScheduleIcon
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {job.experienceLevel} Level
                        </Typography>
                      </Box>
                      {job.salary && (
                        <Box display="flex" alignItems="center">
                          <SalaryIcon
                            sx={{
                              fontSize: 16,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {job.salary}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                      }}
                    >
                      {job.description || "No description provided"}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Box>
                      <Tooltip title={job.isActive ? "Deactivate" : "Activate"}>
                        <IconButton onClick={() => handleToggleStatus(job.id)}>
                          {job.isActive ? (
                            <VisibilityIcon color="success" />
                          ) : (
                            <VisibilityOffIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Job">
                        <IconButton onClick={() => handleOpenDialog(job)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton onClick={() => handleDelete(job.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Created {dayjs(job.createdAt).format("MMM DD")}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add job"
          sx={{ position: "fixed", bottom: 32, right: 32 }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>

        {/* Job Form Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { maxHeight: "90vh" } }}
        >
          <DialogTitle>
            {editingJob ? "Edit Job" : "Create New Job"}
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Typography variant="h6" color="primary">
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title *"
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={jobForm.department}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Location Type</InputLabel>
                    <Select
                      value={jobForm.locationType}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          locationType: e.target.value,
                        }))
                      }
                      label="Location Type"
                    >
                      {locationTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={jobForm.type}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      label="Job Type"
                    >
                      {jobTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Experience Level</InputLabel>
                    <Select
                      value={jobForm.experienceLevel}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          experienceLevel: e.target.value,
                        }))
                      }
                      label="Experience Level"
                    >
                      {experienceLevels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider />

              {/* Job Description */}
              <Typography variant="h6" color="primary">
                Job Description
              </Typography>
              <TextField
                fullWidth
                label="Job Description"
                multiline
                rows={4}
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                helperText="Describe the role and what the candidate will be doing"
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Responsibilities"
                    multiline
                    rows={4}
                    value={jobForm.responsibilities.join("\n")}
                    onChange={(e) =>
                      handleArrayFieldChange("responsibilities", e.target.value)
                    }
                    helperText="One responsibility per line"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Requirements"
                    multiline
                    rows={4}
                    value={jobForm.requirements.join("\n")}
                    onChange={(e) =>
                      handleArrayFieldChange("requirements", e.target.value)
                    }
                    helperText="One requirement per line"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Skills"
                    multiline
                    rows={3}
                    value={jobForm.skills.join("\n")}
                    onChange={(e) =>
                      handleArrayFieldChange("skills", e.target.value)
                    }
                    helperText="One skill per line"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Benefits"
                    multiline
                    rows={3}
                    value={jobForm.benefits.join("\n")}
                    onChange={(e) =>
                      handleArrayFieldChange("benefits", e.target.value)
                    }
                    helperText="One benefit per line"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Perks & Additional Benefits"
                multiline
                rows={2}
                value={jobForm.perks.join("\n")}
                onChange={(e) =>
                  handleArrayFieldChange("perks", e.target.value)
                }
                helperText="One perk per line (e.g., flexible hours, free lunch)"
              />

              <Divider />

              {/* Compensation & Application */}
              <Typography variant="h6" color="primary">
                Compensation & Application
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Salary Range (Text)"
                    value={jobForm.salary}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        salary: e.target.value,
                      }))
                    }
                    helperText="e.g., Competitive, DOE"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Min Salary"
                    type="number"
                    value={jobForm.salaryMin}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        salaryMin: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Max Salary"
                    type="number"
                    value={jobForm.salaryMax}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        salaryMax: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={jobForm.currency}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      label="Currency"
                    >
                      {currencies.map((curr) => (
                        <MenuItem key={curr} value={curr}>
                          {curr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Application URL"
                    type="url"
                    value={jobForm.applicationUrl}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        applicationUrl: e.target.value,
                      }))
                    }
                    helperText="External application link (optional)"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Application Deadline"
                    value={jobForm.deadline}
                    onChange={(date) =>
                      setJobForm((prev) => ({ ...prev, deadline: date }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              {/* Settings */}
              <Typography variant="h6" color="primary">
                Job Settings
              </Typography>
              <Stack direction="row" spacing={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={jobForm.isActive}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      color="success"
                    />
                  }
                  label="Active (visible on careers page)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={jobForm.isFeatured}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          isFeatured: e.target.checked,
                        }))
                      }
                      color="warning"
                    />
                  }
                  label="Featured (highlighted on careers page)"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={loading}
              disabled={!jobForm.title.trim()}
            >
              {editingJob ? "Update Job" : "Create Job"}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default JobManager;
