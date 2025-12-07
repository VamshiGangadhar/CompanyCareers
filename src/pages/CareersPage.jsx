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
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Work,
  LocationOn,
  Business,
  ArrowForward,
  Email,
  Phone,
  Language,
  LinkedIn,
  Twitter,
  GitHub,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FiberManualRecord,
} from "@mui/icons-material";

const CareersPage = () => {
  const { slug } = useParams();
  const { company, jobs, fetchCompany, fetchJobs, loading } = useCompanyStore();
  const [jobFilters, setJobFilters] = useState({});
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Get banners array - support both single banner and multiple banners
  const getBanners = () => {
    if (!company?.branding) return [];
    if (company.branding.banners && Array.isArray(company.branding.banners)) {
      return company.branding.banners;
    }
    if (company.branding.banner) {
      return [company.branding.banner];
    }
    return [];
  };

  const banners = getBanners();
  const hasBanners = banners.length > 0;
  const hasMultipleBanners = banners.length > 1;

  useEffect(() => {
    if (slug) {
      fetchCompany(slug);
      fetchJobs(slug);
    }
  }, [slug, fetchCompany, fetchJobs]);

  // Auto-rotate banners every 5 seconds if multiple banners
  useEffect(() => {
    if (hasMultipleBanners) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [hasMultipleBanners, banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length
    );
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
  };

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
        const currentBanner = hasBanners ? banners[currentBannerIndex] : null;

        return (
          <Paper
            key={sectionKey}
            elevation={3}
            sx={{
              ...sectionStyle,
              p: { xs: 4, md: 8 },
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              ...(currentBanner
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentBanner})`,
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
            {/* Banner Carousel Controls */}
            {hasMultipleBanners && (
              <>
                {/* Previous Button */}
                <IconButton
                  onClick={prevBanner}
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.7)",
                    },
                    zIndex: 2,
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>

                {/* Next Button */}
                <IconButton
                  onClick={nextBanner}
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.7)",
                    },
                    zIndex: 2,
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>

                {/* Banner Indicators */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  {banners.map((_, index) => (
                    <IconButton
                      key={index}
                      onClick={() => goToBanner(index)}
                      sx={{
                        p: 0.5,
                        color:
                          index === currentBannerIndex
                            ? "white"
                            : "rgba(255,255,255,0.5)",
                        "&:hover": {
                          color: "white",
                        },
                      }}
                    >
                      <FiberManualRecord sx={{ fontSize: 12 }} />
                    </IconButton>
                  ))}
                </Box>
              </>
            )}

            {/* Content */}
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {branding.logo && !currentBanner && (
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
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  textShadow: currentBanner
                    ? "2px 2px 4px rgba(0,0,0,0.7)"
                    : "none",
                }}
              >
                {section.title || "Join Our Team"}
              </Typography>
              {section.content?.subtitle && (
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    textShadow: currentBanner
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
                    textShadow: currentBanner
                      ? "1px 1px 2px rgba(0,0,0,0.7)"
                      : "none",
                  }}
                >
                  {section.content.description}
                </Typography>
              )}
            </Box>
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
          <Paper
            key={sectionKey}
            elevation={3}
            sx={{
              ...sectionStyle,
              p: 5,
              background: `linear-gradient(135deg, ${
                branding.primaryColor
              }08 0%, ${
                branding.secondaryColor || branding.primaryColor
              }05 100%)`,
              border: `1px solid ${branding.primaryColor}15`,
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: branding.primaryColor,
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", md: "1.8rem" },
                mb: 3,
                textAlign: "center",
              }}
            >
              {section.title || "About Us"}
            </Typography>
            <Divider
              sx={{ mb: 4, borderColor: `${branding.primaryColor}20` }}
            />
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontSize: "1.1rem",
                color: "text.primary",
                textAlign: "justify",
                "& p": { mb: 2 },
              }}
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
          <Paper
            key={sectionKey}
            elevation={3}
            sx={{
              ...sectionStyle,
              p: 5,
              background: `linear-gradient(135deg, ${
                branding.primaryColor
              }08 0%, ${
                branding.secondaryColor || branding.primaryColor
              }05 100%)`,
              border: `1px solid ${branding.primaryColor}15`,
              borderRadius: 3,
              transition: "all 0.3s ease",
              textAlign: "center",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: branding.primaryColor,
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", md: "1.8rem" },
                mb: 3,
                textAlign: "center",
              }}
            >
              {section.title || "Meet Our Team"}
            </Typography>
            <Divider
              sx={{
                mb: 4,
                borderColor: `${branding.primaryColor}20`,
                mx: "auto",
                maxWidth: "200px",
              }}
            />
            {section.content?.content && (
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  fontSize: "1.1rem",
                  mb: 4,
                  color: "text.primary",
                  textAlign: "center",
                }}
              >
                {section.content.content}
              </Typography>
            )}
            {company.team && company.team.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 4,
                  mt: 4,
                }}
              >
                {company.team.map((member, index) => (
                  <Card
                    key={index}
                    sx={{
                      textAlign: "center",
                      width: 280,
                      maxWidth: "100%",
                      borderRadius: 3,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: `1px solid ${branding.primaryColor}10`,
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: `0 20px 40px ${branding.primaryColor}20`,
                        borderColor: branding.primaryColor,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            mx: "auto",
                            mb: 2,
                            border: `4px solid ${branding.primaryColor}20`,
                            background: member.image
                              ? "transparent"
                              : `linear-gradient(135deg, ${
                                  branding.primaryColor
                                }, ${
                                  branding.secondaryColor ||
                                  branding.primaryColor
                                }90)`,
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            color: "white",
                            boxShadow: 4,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                          src={member.image}
                          alt={member.name}
                        >
                          {!member.image && member.name.charAt(0)}
                        </Avatar>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: "bold",
                            color: branding.primaryColor,
                            fontSize: "1.3rem",
                          }}
                        >
                          {member.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                            mb: 2,
                          }}
                        >
                          {member.position}
                        </Typography>
                        {member.department && (
                          <Chip
                            label={member.department}
                            size="medium"
                            sx={{
                              background: `linear-gradient(135deg, ${branding.primaryColor}15, ${branding.primaryColor}25)`,
                              color: branding.primaryColor,
                              fontWeight: 600,
                              mb: 2,
                              border: `1px solid ${branding.primaryColor}30`,
                            }}
                          />
                        )}
                      </Box>
                      <Box
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "space-between",
                          textAlign: "center",
                        }}
                      >
                        {member.bio && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              lineHeight: 1.6,
                              mb: 2,
                              fontStyle: "italic",
                            }}
                          >
                            {member.bio.length > 120
                              ? `${member.bio.substring(0, 120)}...`
                              : member.bio}
                          </Typography>
                        )}
                        {(member.linkedin ||
                          member.twitter ||
                          member.github) && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                              mt: "auto",
                            }}
                          >
                            {member.linkedin && (
                              <IconButton
                                size="small"
                                component="a"
                                href={member.linkedin}
                                target="_blank"
                                sx={{
                                  color: "#0077B5",
                                  "&:hover": { transform: "scale(1.2)" },
                                }}
                              >
                                <LinkedIn />
                              </IconButton>
                            )}
                            {member.twitter && (
                              <IconButton
                                size="small"
                                component="a"
                                href={member.twitter}
                                target="_blank"
                                sx={{
                                  color: "#1DA1F2",
                                  "&:hover": { transform: "scale(1.2)" },
                                }}
                              >
                                <Twitter />
                              </IconButton>
                            )}
                            {member.github && (
                              <IconButton
                                size="small"
                                component="a"
                                href={member.github}
                                target="_blank"
                                sx={{
                                  color: "#333",
                                  "&:hover": { transform: "scale(1.2)" },
                                }}
                              >
                                <GitHub />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
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
              </Box>
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
