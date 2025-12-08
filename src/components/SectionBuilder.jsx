import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useCompanyStore from "../context/companyStore";
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Stack,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Fade,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Star as StarIcon,
  LocalHospital as BenefitsIcon,
  Group as TeamIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const SectionBuilder = ({ slug }) => {
  const { company, updateSections, loading } = useCompanyStore();
  const [newSectionType, setNewSectionType] = useState("");

  // Convert sections object to array if needed
  const sectionsData = company?.sections || {};

  // Handle both object and array formats
  const sections = Array.isArray(sectionsData)
    ? sectionsData
    : Object.values(sectionsData).map((section) => ({
        id: section.id || `section-${section.type}`,
        ...section,
      }));

  // Show loading or error state if no company
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading company data...</Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            No company data loaded
          </Typography>
          <Typography variant="body2">
            The company "{slug}" doesn't exist yet. Let's create it for you.
          </Typography>
        </Alert>
        <Stack spacing={2} direction="row">
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                console.log("Testing connection...");
                const API_URL =
                  import.meta.env.VITE_API_URL || "http://localhost:5000";
                const response = await fetch(`${API_URL}/api/event`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    step: "TEST_CONNECTION",
                    payload: {},
                  }),
                });
                const result = await response.json();
                alert(
                  `Connection test: ${
                    result.success ? "SUCCESS" : "FAILED"
                  }\n${JSON.stringify(result, null, 2)}`
                );
              } catch (error) {
                alert(`Connection error: ${error.message}`);
              }
            }}
          >
            Test Connection
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const API_URL =
                  import.meta.env.VITE_API_URL || "http://localhost:5000";
                const response = await fetch(`${API_URL}/api/event`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    step: "CREATE_DEMO_COMPANY",
                    payload: {},
                  }),
                });
                const result = await response.json();

                if (result.success) {
                  alert("Demo company created successfully! Reloading page...");
                  window.location.reload();
                } else {
                  alert(
                    `Error: ${result.error}\nDetails: ${
                      result.details || "No additional details"
                    }`
                  );
                }
              } catch (error) {
                alert(`Network error: ${error.message}`);
              }
            }}
          >
            Create Demo Company
          </Button>
        </Stack>
      </Box>
    );
  }

  const sectionTypes = [
    {
      value: "hero",
      label: "Hero Section",
      icon: <HomeIcon />,
      color: "primary",
      description: "Main landing section with title and call-to-action",
      defaultContent: {
        title: "Welcome to Our Company",
        subtitle: "Join our amazing team",
      },
    },
    {
      value: "about",
      label: "About Us",
      icon: <InfoIcon />,
      color: "info",
      description: "Company overview and mission statement",
      defaultContent: {
        title: "About Our Company",
        content: "We are a leading company in our industry...",
      },
    },
    {
      value: "values",
      label: "Company Values",
      icon: <StarIcon />,
      color: "warning",
      description: "Core values and principles",
      defaultContent: {
        title: "Our Values",
        items: ["Innovation", "Excellence", "Integrity"],
      },
    },
    {
      value: "benefits",
      label: "Benefits",
      icon: <BenefitsIcon />,
      color: "success",
      description: "Employee benefits and perks",
      defaultContent: {
        title: "Why Work With Us",
        items: ["Health Insurance", "Flexible Hours", "Growth Opportunities"],
      },
    },
    {
      value: "team",
      label: "Team",
      icon: <TeamIcon />,
      color: "secondary",
      description: "Team introduction and culture",
      defaultContent: {
        title: "Meet Our Team",
        description: "Get to know the people you'll work with",
      },
    },
  ];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Convert back to object format
    const sectionsObject = {};
    items.forEach((section, index) => {
      sectionsObject[section.type + (index > 0 ? `_${index}` : "")] = {
        ...section,
        order: index + 1,
      };
    });

    updateSections(sectionsObject);
  };

  const addSection = () => {
    if (!newSectionType) {
      return;
    }

    const sectionTemplate = sectionTypes.find(
      (type) => type.value === newSectionType
    );

    const newSection = {
      id: `section-${Date.now()}`,
      type: newSectionType,
      title: sectionTemplate.defaultContent.title,
      content: sectionTemplate.defaultContent,
      visible: true,
      order: sections.length + 1,
    };

    const updatedSections = [...sections, newSection];

    // Create a simpler object format for sections
    const sectionsObject = {};
    updatedSections.forEach((section) => {
      // Use a unique key for each section type
      let key = section.type;
      let counter = 1;
      while (sectionsObject[key]) {
        key = `${section.type}_${counter}`;
        counter++;
      }
      sectionsObject[key] = {
        type: section.type,
        title: section.title,
        content: section.content,
        visible: section.visible,
        order: section.order || updatedSections.indexOf(section) + 1,
      };
    });

    updateSections(sectionsObject);
    setNewSectionType("");
  };

  const removeSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);

    // Convert back to object format
    const sectionsObject = {};
    newSections.forEach((section, idx) => {
      sectionsObject[section.type + (idx > 0 ? `_${idx}` : "")] = {
        ...section,
        order: idx + 1,
      };
    });

    updateSections(sectionsObject);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newSections[index] = {
        ...newSections[index],
        content: {
          ...newSections[index].content,
          [child]: value,
        },
      };
    } else {
      newSections[index] = {
        ...newSections[index],
        [field]: value,
      };
    }

    // Convert back to object format
    const sectionsObject = {};
    newSections.forEach((section, idx) => {
      sectionsObject[section.type + (idx > 0 ? `_${idx}` : "")] = {
        ...section,
        order: idx + 1,
      };
    });

    updateSections(sectionsObject);
  };

  const toggleSectionVisibility = (index) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      visible: !newSections[index].visible,
    };

    // Convert back to object format
    const sectionsObject = {};
    newSections.forEach((section, idx) => {
      sectionsObject[section.type + (idx > 0 ? `_${idx}` : "")] = {
        ...section,
        order: idx + 1,
      };
    });

    updateSections(sectionsObject);
  };

  const getSectionTypeInfo = (type) => {
    return sectionTypes.find((st) => st.value === type);
  };

  return (
    <Box>
      {/* Save Reminder */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Remember to save your changes! Sections are updated locally until you
        click Save.
      </Alert>

      {/* Add Section Panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <AddIcon color="primary" />
          Add New Section
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Select Section Type</InputLabel>
            <Select
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value)}
              label="Select Section Type"
            >
              {sectionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {type.icon}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {type.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={addSection}
            disabled={!newSectionType}
            startIcon={<AddIcon />}
            size="large"
          >
            Add Section
          </Button>
        </Stack>
      </Paper>

      {/* Section List */}
      {sections.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {sections.map((section, index) => {
                  const sectionTypeInfo = getSectionTypeInfo(section.type);
                  return (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Fade in={true} timeout={300}>
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            elevation={snapshot.isDragging ? 8 : 2}
                            sx={{
                              mb: 2,
                              transition: "all 0.2s ease",
                              transform: snapshot.isDragging
                                ? "rotate(3deg)"
                                : "none",
                              border: snapshot.isDragging
                                ? "2px solid"
                                : "1px solid",
                              borderColor: snapshot.isDragging
                                ? "primary.main"
                                : "grey.200",
                            }}
                          >
                            <Accordion defaultExpanded>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                {...provided.dragHandleProps}
                                sx={{
                                  bgcolor: `${sectionTypeInfo?.color}.50`,
                                  "&:hover": {
                                    bgcolor: `${sectionTypeInfo?.color}.100`,
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <DragIcon sx={{ mr: 1, color: "grey.400" }} />
                                  {sectionTypeInfo?.icon}
                                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                                    <Typography
                                      variant="h6"
                                      fontWeight="medium"
                                    >
                                      {section.title ||
                                        `${sectionTypeInfo?.label} Section`}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mt: 0.5,
                                      }}
                                    >
                                      <Chip
                                        size="small"
                                        label={sectionTypeInfo?.label}
                                        color={sectionTypeInfo?.color}
                                        variant="outlined"
                                      />
                                      <Chip
                                        size="small"
                                        icon={
                                          section.visible ? (
                                            <VisibilityIcon />
                                          ) : (
                                            <VisibilityOffIcon />
                                          )
                                        }
                                        label={
                                          section.visible ? "Visible" : "Hidden"
                                        }
                                        color={
                                          section.visible
                                            ? "success"
                                            : "default"
                                        }
                                        variant="outlined"
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </AccordionSummary>

                              <AccordionDetails sx={{ pt: 0 }}>
                                <Stack spacing={3}>
                                  {/* Controls */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={section.visible}
                                          onChange={() =>
                                            toggleSectionVisibility(index)
                                          }
                                          color="success"
                                        />
                                      }
                                      label="Section Visible"
                                    />

                                    <IconButton
                                      onClick={() => removeSection(index)}
                                      color="error"
                                      sx={{
                                        bgcolor: "error.50",
                                        "&:hover": { bgcolor: "error.100" },
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>

                                  <Divider />

                                  {/* Section Content Fields */}
                                  <TextField
                                    label="Section Title"
                                    fullWidth
                                    value={section.title || ""}
                                    onChange={(e) =>
                                      updateSection(
                                        index,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    variant="outlined"
                                  />

                                  {section.type === "hero" && (
                                    <TextField
                                      label="Subtitle"
                                      fullWidth
                                      value={section.content.subtitle || ""}
                                      onChange={(e) =>
                                        updateSection(
                                          index,
                                          "content.subtitle",
                                          e.target.value
                                        )
                                      }
                                      variant="outlined"
                                    />
                                  )}

                                  {(section.type === "about" ||
                                    section.type === "team") && (
                                    <TextField
                                      label="Content"
                                      fullWidth
                                      multiline
                                      rows={4}
                                      value={
                                        section.content.content ||
                                        section.content.description ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        updateSection(
                                          index,
                                          `content.${
                                            section.type === "about"
                                              ? "content"
                                              : "description"
                                          }`,
                                          e.target.value
                                        )
                                      }
                                      variant="outlined"
                                    />
                                  )}

                                  {(section.type === "values" ||
                                    section.type === "benefits") && (
                                    <Box>
                                      <TextField
                                        label="Items (one per line)"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={
                                          section.content.items?.join("\n") ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          updateSection(
                                            index,
                                            "content.items",
                                            e.target.value
                                              .split("\n")
                                              .filter((item) => item.trim())
                                          )
                                        }
                                        variant="outlined"
                                        helperText="Enter each item on a new line"
                                      />

                                      {section.content.items &&
                                        section.content.items.length > 0 && (
                                          <Box sx={{ mt: 2 }}>
                                            <Typography
                                              variant="subtitle2"
                                              gutterBottom
                                            >
                                              Preview:
                                            </Typography>
                                            <List dense>
                                              {section.content.items.map(
                                                (item, itemIndex) => (
                                                  <ListItem key={itemIndex}>
                                                    <ListItemIcon>
                                                      {section.type ===
                                                      "values" ? (
                                                        <StarIcon color="warning" />
                                                      ) : (
                                                        <BenefitsIcon color="success" />
                                                      )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                      primary={item}
                                                    />
                                                  </ListItem>
                                                )
                                              )}
                                            </List>
                                          </Box>
                                        )}
                                    </Box>
                                  )}
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          </Card>
                        </Fade>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Paper
          elevation={1}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
            border: "2px dashed",
            borderColor: "grey.300",
          }}
        >
          <AddIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No sections yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start building your careers page by adding your first section above.
            <br />
            You can drag and drop sections to reorder them.
          </Typography>
          <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
            <Typography variant="body2">
              <strong>Pro tip:</strong> Start with a Hero section to make a
              great first impression, then add About Us, Values, and Benefits
              sections to showcase your company culture.
            </Typography>
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default SectionBuilder;
