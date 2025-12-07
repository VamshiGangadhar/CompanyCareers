import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCompanyStore from "../context/companyStore";
import JobList from "../components/JobList";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Paper,
  Card,
  CardContent,
  Fab,
} from "@mui/material";
import {
  ArrowBack,
  Visibility,
  Launch,
  Edit,
  Business,
} from "@mui/icons-material";

const CompanyPreview = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { company, jobs, fetchCompany, fetchJobs, loading } = useCompanyStore();
  const [sections, setSections] = useState({});

  useEffect(() => {
    if (slug) {
      fetchCompany(slug);
      fetchJobs(slug);
    }
  }, [slug, fetchCompany, fetchJobs]);

  useEffect(() => {
    if (company?.sections) {
      // company.sections is already an object, not an array
      setSections(company.sections);
    }
  }, [company]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Company not found</Typography>
      </Box>
    );
  }

  const branding = company.branding || {};
  const containerMaxWidth =
    branding.layout?.width === "narrow"
      ? "md"
      : branding.layout?.width === "wide"
      ? "xl"
      : "lg";

  const renderSection = (key, section) => {
    if (!section || !section.visible) return null;

    const commonSx = {
      py:
        branding.layout?.spacing === "tight"
          ? 2
          : branding.layout?.spacing === "loose"
          ? 6
          : 4,
      backgroundColor:
        section.type === "values" || section.type === "team"
          ? branding.layout?.backgroundColor || "#f9fafb"
          : "transparent",
    };

    switch (section.type) {
      case "hero":
        return (
          <Paper
            key={key}
            elevation={0}
            sx={{
              ...commonSx,
              ...(branding.banner && {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${branding.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "white",
              }),
            }}
          >
            <Container maxWidth={containerMaxWidth}>
              <Box textAlign="center">
                {branding.logo && !branding.banner && (
                  <Box
                    component="img"
                    src={branding.logo}
                    alt={company.name}
                    sx={{
                      height: 80,
                      mb: 3,
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontFamily: branding.typography?.headingFont || "inherit",
                    color: branding.banner
                      ? "white"
                      : branding.primaryColor || "inherit",
                    textShadow: branding.banner
                      ? "2px 2px 4px rgba(0,0,0,0.5)"
                      : "none",
                  }}
                >
                  {section.title}
                </Typography>
                {section.content?.subtitle && (
                  <Typography
                    variant="h5"
                    sx={{
                      mt: 2,
                      maxWidth: "800px",
                      mx: "auto",
                      color: branding.banner
                        ? "rgba(255,255,255,0.9)"
                        : "text.secondary",
                      textShadow: branding.banner
                        ? "1px 1px 2px rgba(0,0,0,0.5)"
                        : "none",
                    }}
                  >
                    {section.content.subtitle}
                  </Typography>
                )}
              </Box>
            </Container>
          </Paper>
        );

      case "about":
        const hasHeroSection = sections.hero && sections.hero.visible;
        return (
          <Paper key={key} elevation={0} sx={commonSx}>
            <Container maxWidth={containerMaxWidth}>
              <Box>
                {!hasHeroSection && branding.logo && (
                  <Box textAlign="center" sx={{ mb: 4 }}>
                    <Box
                      component="img"
                      src={branding.logo}
                      alt={company.name}
                      sx={{
                        height: 60,
                        mb: 2,
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    mb: 4,
                    fontFamily: branding.typography?.headingFont || "inherit",
                  }}
                >
                  {section.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    maxWidth: "800px",
                    mx: "auto",
                    textAlign: "center",
                  }}
                >
                  {section.content?.content}
                </Typography>
              </Box>
            </Container>
          </Paper>
        );

      case "values":
        return (
          <Paper key={key} elevation={0} sx={commonSx}>
            <Container maxWidth={containerMaxWidth}>
              <Box>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    mb: 4,
                    fontFamily: branding.typography?.headingFont || "inherit",
                  }}
                >
                  {section.title}
                </Typography>
                {section.content?.items && (
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    justifyContent="center"
                  >
                    {section.content.items.map((value, index) => (
                      <Card
                        key={index}
                        sx={{ flex: 1, textAlign: "center", maxWidth: 300 }}
                      >
                        <CardContent>
                          <Typography variant="h6" component="h3">
                            {value}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </Container>
          </Paper>
        );

      case "benefits":
        return (
          <Paper key={key} elevation={0} sx={commonSx}>
            <Container maxWidth={containerMaxWidth}>
              <Box>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    mb: 4,
                    fontFamily: branding.typography?.headingFont || "inherit",
                  }}
                >
                  {section.title}
                </Typography>
                {section.content?.items && (
                  <Box sx={{ maxWidth: 600, mx: "auto" }}>
                    <Stack spacing={2}>
                      {section.content.items.map((benefit, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                branding.primaryColor || "#2563eb",
                            }}
                          />
                          <Typography variant="body1">{benefit}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Container>
          </Paper>
        );

      case "team":
        return (
          <Paper key={key} elevation={0} sx={commonSx}>
            <Container maxWidth={containerMaxWidth}>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{
                    mb: 3,
                    fontFamily: branding.typography?.headingFont || "inherit",
                  }}
                >
                  {section.title}
                </Typography>
                {section.content?.description && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
                  >
                    {section.content.description}
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
                      <Card key={index} sx={{ textAlign: "center" }}>
                        <CardContent>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
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
                              sx={{ mb: 1 }}
                            />
                          )}
                          {member.bio && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {member.bio}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Card sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
                    <Typography color="text.secondary">
                      No team members added yet. Add team members in the editor
                      to display them here.
                    </Typography>
                  </Card>
                )}
              </Box>
            </Container>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: branding.backgroundColor || "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* Preview Header */}
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
          <IconButton
            color="inherit"
            onClick={() => navigate(`/company/${slug}/edit`)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Visibility sx={{ mr: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {branding.logo && (
              <Box
                component="img"
                src={branding.logo}
                alt={company.name}
                sx={{ height: 32, mr: 2 }}
              />
            )}
            <Typography variant="h6">Preview: {company.name}</Typography>
          </Box>
          <Chip
            label="PREVIEW MODE"
            color="warning"
            variant="filled"
            sx={{ mr: 2 }}
          />
          <Button
            color="inherit"
            startIcon={<Launch />}
            onClick={() => window.open(`/${slug}/careers`, "_blank")}
            sx={{ mr: 1 }}
          >
            View Live
          </Button>
          <Button
            color="inherit"
            startIcon={<Edit />}
            onClick={() => navigate(`/company/${slug}/edit`)}
          >
            Edit
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={containerMaxWidth} sx={{ py: 4 }}>
        <Stack
          spacing={
            branding.layout?.spacing === "tight"
              ? 2
              : branding.layout?.spacing === "loose"
              ? 6
              : 4
          }
        >
          {/* Render sections in order */}
          {Object.entries(sections)
            .filter(([, section]) => section && section.visible)
            .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
            .map(([key, section]) => renderSection(key, section))}

          {/* Jobs Section - Always show if jobs exist */}
          {jobs && jobs.length > 0 && (
            <Paper elevation={0} sx={{ py: 4 }}>
              <Container maxWidth={containerMaxWidth}>
                <Box>
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{
                      textAlign: "center",
                      mb: 4,
                      fontFamily: branding.typography?.headingFont || "inherit",
                    }}
                  >
                    Open Positions
                  </Typography>
                  <JobList
                    jobs={jobs}
                    loading={loading}
                    branding={branding}
                    showStatus={true} // Show publish status in preview
                    onFiltersChange={() => {}}
                  />
                </Box>
              </Container>
            </Paper>
          )}

          {/* No Content Message */}
          {Object.keys(sections).length === 0 && (
            <Paper elevation={1} sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Sections Added Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Start building your careers page by adding sections.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/company/${slug}/edit`)}
              >
                Add Sections
              </Button>
            </Paper>
          )}
        </Stack>
      </Container>

      {/* Floating Action Buttons */}
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <Stack spacing={1}>
          <Fab
            color="primary"
            onClick={() => navigate(`/company/${slug}/edit`)}
            size="small"
          >
            <Edit />
          </Fab>
          <Fab
            color="secondary"
            onClick={() => window.open(`/${slug}/careers`, "_blank")}
            size="small"
          >
            <Launch />
          </Fab>
        </Stack>
      </Box>
    </Box>
  );
};

export default CompanyPreview;
