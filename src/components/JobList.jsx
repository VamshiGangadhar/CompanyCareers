import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Stack,
  Skeleton,
  Slider,
  Checkbox,
  FormControlLabel,
  Autocomplete,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Schedule,
  Business,
  Work,
  TuneRounded,
  FilterList,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const JobList = ({
  jobs = [],
  filters,
  onFiltersChange,
  loading,
  branding,
  showStatus = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [selectedLocation, setSelectedLocation] = useState(
    filters?.location || ""
  );
  const [selectedType, setSelectedType] = useState(filters?.type || "");
  const [selectedDepartment, setSelectedDepartment] = useState(
    filters?.department || ""
  );
  const [selectedExperience, setSelectedExperience] = useState(
    filters?.experience || ""
  );
  const [salaryRange, setSalaryRange] = useState(
    filters?.salaryRange || [0, 200000]
  );
  const [selectedSkills, setSelectedSkills] = useState(filters?.skills || []);
  const [remoteOnly, setRemoteOnly] = useState(filters?.remoteOnly || false);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Temporarily disable automatic filter calls to stop recursion
    // Only call onFiltersChange manually when user actually changes something
    return;
  }, [
    searchTerm,
    selectedLocation,
    selectedType,
    onFiltersChange,
    isInitialized,
  ]);

  const locations = [
    ...new Set(jobs.map((job) => job.location).filter(Boolean)),
  ];
  const jobTypes = [...new Set(jobs.map((job) => job.type).filter(Boolean))];
  const departments = [
    ...new Set(jobs.map((job) => job.department).filter(Boolean)),
  ];
  const experienceLevels = [
    ...new Set(jobs.map((job) => job.experienceLevel).filter(Boolean)),
  ];
  const allSkills = [
    ...new Set(jobs.flatMap((job) => job.skills || []).filter(Boolean)),
  ];

  // Filter jobs based on all criteria
  const filteredJobs = jobs.filter((job) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase());

    // Location filter
    const matchesLocation =
      !selectedLocation || job.location === selectedLocation;

    // Job type filter
    const matchesType = !selectedType || job.type === selectedType;

    // Department filter
    const matchesDepartment =
      !selectedDepartment || job.department === selectedDepartment;

    // Experience level filter
    const matchesExperience =
      !selectedExperience || job.experienceLevel === selectedExperience;

    // Salary range filter
    const jobSalary = job.salaryMax || job.salaryMin || 0;
    const matchesSalary =
      jobSalary === 0 ||
      (jobSalary >= salaryRange[0] && jobSalary <= salaryRange[1]);

    // Skills filter
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => job.skills?.includes(skill));

    // Remote filter
    const matchesRemote =
      !remoteOnly ||
      job.location?.toLowerCase().includes("remote") ||
      job.type?.toLowerCase().includes("remote");

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesDepartment &&
      matchesExperience &&
      matchesSalary &&
      matchesSkills &&
      matchesRemote
    );
  });

  const handleApplyClick = (job) => {
    toast.success(`Application submitted for ${job.title}!`, {
      duration: 4000,
      position: "top-center",
      style: {
        background: branding.primaryColor || "#1976d2",
        color: "white",
      },
      icon: "🎉",
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedType("");
    setSelectedDepartment("");
    setSelectedExperience("");
    setSalaryRange([0, 200000]);
    setSelectedSkills([]);
    setRemoteOnly(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedLocation ||
    selectedType ||
    selectedDepartment ||
    selectedExperience ||
    selectedSkills.length > 0 ||
    remoteOnly;

  if (loading) {
    return (
      <Stack spacing={3}>
        {[...Array(3)].map((_, i) => (
          <Paper key={i} sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="80%" height={60} />
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Clean Search and Filters */}
      <Paper sx={{ p: 3 }}>
        {/* Main Search Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search jobs by title, description, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Quick Filters Row */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Job Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All Types</MenuItem>
              {jobTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Experience"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All Levels</MenuItem>
              {experienceLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Advanced Filters Toggle */}
        {(allSkills.length > 0 ||
          jobs.some((job) => job.salaryMax || job.salaryMin)) && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<TuneRounded />}
              variant="text"
              sx={{ color: "text.secondary" }}
            >
              {showFilters ? "Hide" : "More"} Filters
            </Button>
          </Box>
        )}

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Grid container spacing={3}>
              {/* Skills Filter */}
              {allSkills.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    size="small"
                    options={allSkills}
                    value={selectedSkills}
                    onChange={(event, newValue) => setSelectedSkills(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Skills"
                        placeholder="Select skills..."
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          size="small"
                          sx={{
                            backgroundColor: branding.primaryColor || "#1976d2",
                            color: "white",
                            "& .MuiChip-deleteIcon": {
                              color: "white",
                            },
                          }}
                        />
                      ))
                    }
                  />
                </Grid>
              )}

              {/* Salary Range */}
              {jobs.some((job) => job.salaryMax || job.salaryMin) && (
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      Salary Range: ${(salaryRange[0] / 1000).toFixed(0)}k - $
                      {(salaryRange[1] / 1000).toFixed(0)}k
                    </Typography>
                    <Slider
                      value={salaryRange}
                      onChange={(e, newValue) => setSalaryRange(newValue)}
                      min={0}
                      max={300000}
                      step={5000}
                      size="small"
                      sx={{
                        color: branding.primaryColor || "#1976d2",
                        "& .MuiSlider-thumb": {
                          width: 16,
                          height: 16,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              )}

              {/* Remote Work Checkbox */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      size="small"
                      sx={{
                        color: branding.primaryColor || "#1976d2",
                        "&.Mui-checked": {
                          color: branding.primaryColor || "#1976d2",
                        },
                      }}
                    />
                  }
                  label="Remote work only"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              size="small"
              onClick={clearAllFilters}
              variant="outlined"
              color="inherit"
              sx={{
                borderColor: "text.secondary",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "text.primary",
                  backgroundColor: "action.hover",
                },
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Job Results */}
      <Box>
        {/* Results Summary */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {filteredJobs.length === jobs.length
              ? `${filteredJobs.length} Job${
                  filteredJobs.length !== 1 ? "s" : ""
                }`
              : `${filteredJobs.length} of ${jobs.length} Job${
                  jobs.length !== 1 ? "s" : ""
                }`}
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={`${
                [
                  searchTerm,
                  selectedLocation,
                  selectedType,
                  selectedDepartment,
                  selectedExperience,
                  ...selectedSkills,
                ].filter(Boolean).length + (remoteOnly ? 1 : 0)
              } filter${
                [
                  searchTerm,
                  selectedLocation,
                  selectedType,
                  selectedDepartment,
                  selectedExperience,
                  ...selectedSkills,
                ].filter(Boolean).length +
                  (remoteOnly ? 1 : 0) !==
                1
                  ? "s"
                  : ""
              } active`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: branding.primaryColor || "#1976d2",
                color: branding.primaryColor || "#1976d2",
              }}
            />
          )}
        </Box>

        {/* Job Cards */}
        <Stack spacing={3}>
          {filteredJobs.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Work sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasActiveFilters
                  ? "No jobs match your criteria"
                  : "No jobs available"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {hasActiveFilters
                  ? "Try adjusting your search or clearing some filters"
                  : "Check back later for new opportunities"}
              </Typography>
              {hasActiveFilters && (
                <Button variant="outlined" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              )}
            </Paper>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                branding={branding}
                showStatus={showStatus}
                onApply={handleApplyClick}
              />
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

const JobCard = ({ job, branding = {}, showStatus = false, onApply }) => {
  const primaryColor = branding.primaryColor || "#1976d2";

  const handleApplyClick = () => {
    if (onApply) {
      onApply(job);
    }
  };

  return (
    <Card
      sx={{
        "&:hover": { boxShadow: 4 },
        transition: "all 0.2s",
        opacity: job.isActive === false ? 0.6 : 1,
        border: job.isFeatured ? `2px solid ${primaryColor}` : "none",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" component="h3">
                {job.title}
              </Typography>
              {job.isFeatured && (
                <Chip
                  label="Featured"
                  size="small"
                  sx={{
                    backgroundColor: primaryColor,
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              )}
              {showStatus && (
                <Chip
                  label={job.isActive ? "Published" : "Draft"}
                  size="small"
                  color={job.isActive ? "success" : "default"}
                  variant={job.isActive ? "filled" : "outlined"}
                />
              )}
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              {job.department && (
                <Chip
                  icon={<Business />}
                  label={job.department}
                  size="small"
                  variant="outlined"
                />
              )}
              {job.location && (
                <Chip
                  icon={<LocationOn />}
                  label={job.location}
                  size="small"
                  variant="outlined"
                />
              )}
              {job.type && (
                <Chip
                  icon={<Schedule />}
                  label={job.type}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
            {job.experienceLevel && (
              <Typography variant="body2" color="text.secondary">
                Experience Level: {job.experienceLevel}
              </Typography>
            )}
            {(job.salaryMin || job.salaryMax || job.salary) && (
              <Typography variant="body2" color="text.secondary">
                Salary:{" "}
                {job.salary ||
                  `${job.salaryMin || "N/A"} - ${job.salaryMax || "N/A"}`}{" "}
                {job.currency || "USD"}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={handleApplyClick}
            sx={{
              ml: 2,
              backgroundColor: primaryColor,
              "&:hover": {
                backgroundColor: primaryColor,
                filter: "brightness(0.9)",
              },
              minWidth: 120,
            }}
          >
            Apply Now
          </Button>
        </Box>

        {job.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              "-webkit-line-clamp": 3,
              "-webkit-box-orient": "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {job.description}
          </Typography>
        )}

        {job.skills && job.skills.length > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Skills:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {job.skills.slice(0, 5).map((skill, index) => (
                <Chip key={index} label={skill} size="small" />
              ))}
              {job.skills.length > 5 && (
                <Chip
                  label={`+${job.skills.length - 5} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default JobList;
