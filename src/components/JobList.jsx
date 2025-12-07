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
} from "@mui/material";
import {
  Search,
  LocationOn,
  Schedule,
  Business,
  Work,
} from "@mui/icons-material";

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
      {/* Search and Filters */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Location Filter */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Job Type Filter */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Job Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Schedule />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {jobTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Job Results */}
      <Stack spacing={3}>
        {jobs.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Work sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No jobs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedLocation || selectedType
                ? "Try adjusting your filters"
                : "No job openings at this time"}
            </Typography>
          </Paper>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              branding={branding}
              showStatus={showStatus}
            />
          ))
        )}
      </Stack>

      {/* Results count */}
      {jobs.length > 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}
        </Typography>
      )}
    </Stack>
  );
};

const JobCard = ({ job, branding = {}, showStatus = false }) => {
  const primaryColor = branding.primaryColor || "#1976d2";

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
            sx={{
              ml: 2,
              backgroundColor: primaryColor,
              "&:hover": {
                backgroundColor: primaryColor,
                filter: "brightness(0.9)",
              },
            }}
            href={job.applicationUrl || "#"}
            target={job.applicationUrl ? "_blank" : "_self"}
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
