import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import useCompanyStore from "../context/companyStore";
import JobList from "../components/JobList";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Backdrop,
  Alert,
  Fab,
  Grid,
} from "@mui/material";
import {
  Work,
  LocationOn,
  Business,
  ArrowForward,
  Email,
  Phone,
  Language,
} from "@mui/icons-material";

const CareersPage = () => {
  const { slug } = useParams();
  const { company, jobs, fetchCompany, fetchJobs, loading } = useCompanyStore();
  const [jobFilters, setJobFilters] = useState({});

  useEffect(() => {
    if (slug) {
      fetchCompany(slug);
      fetchJobs(slug);
    }
  }, [slug, fetchCompany, fetchJobs]);

  const handleFiltersChange = useCallback(
    (newFilters) => {
      setJobFilters(newFilters);
      fetchJobs(slug, newFilters);
    },
    [slug, fetchJobs]
  );

  const branding = company?.branding || {};
  const sections = company?.sections || {};

  if (loading) {
    return (
      <Backdrop
        open={true}
        sx={{
          zIndex: 1200,
          backgroundColor: branding.backgroundColor || "#f9fafb",
        }}
      >
        <Box textAlign="center">
          <CircularProgress
            size={60}
            sx={{ color: branding.primaryColor || "#3b82f6" }}
          />
          <Typography
            variant="h6"
            sx={{ mt: 2, color: branding.textColor || "#374151" }}
          >
            Loading careers page...
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!company) {
    return (
      <Box sx={{ backgroundColor: "#f9fafb", minHeight: "100vh", py: 8 }}>
        <Container maxWidth="md" textAlign="center">
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Careers Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This company's careers page is not available or doesn't exist.
            </Typography>
          </Alert>
          <Button variant="contained" component={Link} to="/">
            Go Home
          </Button>
        </Container>
      </Box>
    );
  }

  const renderSection = (sectionKey, section) => {
    if (!section || !section.visible) return null;

    const sectionStyle = {
      backgroundColor: branding.backgroundColor || "#ffffff",
      color: branding.textColor || "#374151",
      fontFamily: branding.typography?.fontFamily || "Inter",
      fontSize:
        branding.typography?.fontSize === "small"
          ? "14px"
          : branding.typography?.fontSize === "large"
          ? "18px"
          : "16px",
      fontWeight: branding.typography?.fontWeight || "normal",
      borderRadius:
        branding.layout?.borderRadius === "none"
          ? 0
          : branding.layout?.borderRadius === "small"
          ? 1
          : branding.layout?.borderRadius === "large"
          ? 3
          : 2,
      marginBottom:
        branding.layout?.spacing === "tight"
          ? 2
          : branding.layout?.spacing === "loose"
          ? 6
          : 4,
    };

    switch (section.type) {
      case "hero":
        return (
          <Paper
            key={sectionKey}
            elevation={3}
            sx={{
              ...sectionStyle,
              p: { xs: 4, md: 8 },
              textAlign: "center",
              ...(branding.banner
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${branding.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }
                : {
                    background: `linear-gradient(135deg, ${
                      branding.primaryColor || "#3b82f6"
                    } 0%, ${branding.secondaryColor || "#1f2937"} 100%)`,
                  }),
              color: "#ffffff",
            }}
          >
            {branding.logo && !branding.banner && (
              <Box
                component="img"
                src={branding.logo}
                alt={company.name}
                sx={{
                  height: { xs: 60, md: 80 },
                  mb: 3,
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)", // Make logo white on colored background
                }}
              />
            )}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                textShadow: branding.banner
                  ? "2px 2px 4px rgba(0,0,0,0.7)"
                  : "none",
              }}
            >
              {section.title || "Join Our Team"}
            </Typography>
            {section.content?.subtitle && (
              <Typography
                variant="h4"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  textShadow: branding.banner
                    ? "1px 1px 2px rgba(0,0,0,0.7)"
                    : "none",
                }}
              >
                {section.content.subtitle}
              </Typography>
            )}
            {section.content?.description && (
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 800,
                  mx: "auto",
                  mb: 4,
                  opacity: 0.8,
                  textShadow: branding.banner
                    ? "1px 1px 2px rgba(0,0,0,0.7)"
                    : "none",
                }}
              >
                {section.content.description}
              </Typography>
            )}
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#ffffff",
                color: branding.primaryColor || "#3b82f6",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                },
                px: 4,
                py: 1.5,
              }}
              href="#jobs"
            >
              View Open Positions
            </Button>
          </Paper>
        );

      case "about":
        return (
          <Paper key={sectionKey} elevation={2} sx={{ ...sectionStyle, p: 4 }}>
            <Typography
              variant="h3"
              sx={{ color: branding.primaryColor, mb: 3, fontWeight: "bold" }}
            >
              {section.title || "About Us"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
            >
              {section.content?.content ||
                "Learn more about our company culture and mission."}
            </Typography>
          </Paper>
        );

      case "values":
        return (
          <Paper key={sectionKey} elevation={2} sx={{ ...sectionStyle, p: 4 }}>
            <Typography
              variant="h3"
              sx={{ color: branding.primaryColor, mb: 3, fontWeight: "bold" }}
            >
              {section.title || "Our Values"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
            >
              {section.content?.content ||
                "Our core values guide everything we do."}
            </Typography>
          </Paper>
        );

      case "benefits":
        return (
          <Paper key={sectionKey} elevation={2} sx={{ ...sectionStyle, p: 4 }}>
            <Typography
              variant="h3"
              sx={{ color: branding.primaryColor, mb: 3, fontWeight: "bold" }}
            >
              {section.title || "Why Work With Us"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
            >
              {section.content?.content ||
                "Discover the benefits of joining our team."}
            </Typography>
          </Paper>
        );

      case "team":
        return (
          <Paper key={sectionKey} elevation={2} sx={{ ...sectionStyle, p: 4 }}>
            <Typography
              variant="h3"
              sx={{ color: branding.primaryColor, mb: 3, fontWeight: "bold" }}
            >
              {section.title || "Meet Our Team"}
            </Typography>
            {section.content?.content && (
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.8, fontSize: "1.1rem", mb: 4 }}
              >
                {section.content.content}
              </Typography>
            )}
            {company.team && company.team.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                  mt: 4,
                }}
              >
                {company.team.map((member, index) => (
                  <Card
                    key={index}
                    sx={{ textAlign: "center", height: "100%" }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          mx: "auto",
                          mb: 2,
                          backgroundColor: member.image
                            ? "transparent"
                            : "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {member.image ? (
                          <Box
                            component="img"
                            src={member.image}
                            alt={member.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Typography variant="h4" color="text.secondary">
                            {member.name.charAt(0)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {member.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {member.position}
                      </Typography>
                      {member.department && (
                        <Chip
                          label={member.department}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                      {member.bio && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, lineHeight: 1.5 }}
                        >
                          {member.bio.length > 100
                            ? `${member.bio.substring(0, 100)}...`
                            : member.bio}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "text.secondary",
                }}
              >
                Team information will be displayed here once team members are
                added.
              </Typography>
            )}
          </Paper>
        );

      default:
        return (
          <Paper key={sectionKey} elevation={2} sx={{ ...sectionStyle, p: 4 }}>
            <Typography
              variant="h4"
              sx={{ color: branding.primaryColor, mb: 2 }}
            >
              {section.title || "Section"}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {section.content?.content || "Section content goes here."}
            </Typography>
          </Paper>
        );
    }
  };

  const containerMaxWidth =
    branding.layout?.containerWidth === "full"
      ? false
      : branding.layout?.containerWidth === "wide"
      ? "xl"
      : branding.layout?.containerWidth === "narrow"
      ? "md"
      : "lg";

  return (
    <Box
      sx={{
        backgroundColor: branding.backgroundColor || "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* Company Header */}
      <Box sx={{ backgroundColor: "#ffffff", boxShadow: 1, py: 2, mb: 2 }}>
        <Container maxWidth={containerMaxWidth}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              {branding.logo && (
                <Box
                  component="img"
                  src={branding.logo}
                  alt={company.name}
                  sx={{ height: 40, mr: 2 }}
                />
              )}
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: branding.primaryColor }}
              >
                {company.name}
              </Typography>
            </Box>
            <Chip
              label={`${jobs?.length || 0} Open Positions`}
              color="primary"
              icon={<Work />}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth={containerMaxWidth}>
        <Stack
          spacing={
            branding.layout?.spacing === "tight"
              ? 3
              : branding.layout?.spacing === "loose"
              ? 8
              : 5
          }
        >
          {/* Render sections in order */}
          {Object.entries(sections)
            .filter(([, section]) => section && section.visible)
            .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
            .map(([key, section]) => renderSection(key, section))}

          {/* Jobs Section */}
          <Paper
            id="jobs"
            elevation={3}
            sx={{ p: 4, backgroundColor: "#ffffff" }}
          >
            <Typography
              variant="h3"
              sx={{ color: branding.primaryColor, mb: 4, fontWeight: "bold" }}
            >
              Open Positions
            </Typography>

            {jobs && jobs.length > 0 ? (
              <JobList
                jobs={jobs.filter((job) => job.isActive !== false)} // Only show published jobs
                onFiltersChange={handleFiltersChange}
                branding={branding}
              />
            ) : (
              <Box textAlign="center" py={6}>
                <Work sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.secondary">
                  No Open Positions
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  We're not actively hiring right now, but we're always looking
                  for talented individuals.
                </Typography>
                <Button variant="outlined" size="large">
                  Join Our Talent Pool
                </Button>
              </Box>
            )}
          </Paper>

          {/* Footer/Contact Section */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              backgroundColor: branding.secondaryColor || "#1f2937",
              color: "#ffffff",
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  Ready to Join {company.name}?
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  We're excited to hear from you. If you don't see a position
                  that fits, feel free to reach out anyway - we're always
                  looking for exceptional talent.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    backgroundColor: branding.primaryColor || "#3b82f6",
                    "&:hover": {
                      backgroundColor: branding.primaryColor
                        ? `${branding.primaryColor}dd`
                        : "#2563eb",
                    },
                  }}
                  href="mailto:careers@company.com"
                >
                  Get In Touch
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default CareersPage;
