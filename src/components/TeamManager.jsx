import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Person,
  DragIndicator,
  LinkedIn,
  Twitter,
  Language,
  Email,
  Phone,
  CloudUpload,
  PhotoCamera,
  ViewList,
  ViewModule,
  TableChart,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useCompanyStore from "../context/companyStore";

const TeamManager = () => {
  const { company, updateCompany, saving } = useCompanyStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  // Get current team members from company data
  const teamMembers = company?.team || [];

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    department: "",
    bio: "",
    image: "",
    email: "",
    phone: "",
    linkedin: "",
    twitter: "",
    website: "",
    skills: [],
    joinDate: "",
    location: "",
  });

  const departments = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "Customer Success",
    "Leadership",
  ];

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({ ...member });
      setImagePreview(member.image || "");
      setImageFile(null);
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        title: "",
        department: "",
        bio: "",
        image: "",
        email: "",
        phone: "",
        linkedin: "",
        twitter: "",
        website: "",
        skills: [],
        joinDate: "",
        location: "",
      });
      setImagePreview("");
      setImageFile(null);
    }
    setIsDialogOpen(true);
    setError("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMember(null);
    setFormData({});
    setError("");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (event) => {
    const skills = event.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image file size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData((prev) => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    // Reset file input
    const fileInput = document.getElementById("image-upload-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSaveMember = async () => {
    try {
      // Validation
      if (!formData.name || !formData.title) {
        setError("Name and title are required");
        return;
      }

      setError(""); // Clear any previous errors

      const updatedTeam = [...teamMembers];
      const memberData = {
        ...formData,
        id: editingMember?.id || `team-${Date.now()}`,
        order: editingMember?.order || updatedTeam.length,
      };

      if (editingMember) {
        const index = updatedTeam.findIndex((m) => m.id === editingMember.id);
        updatedTeam[index] = memberData;
      } else {
        updatedTeam.push(memberData);
      }

      await updateCompany(company.slug, { team: updatedTeam });
      handleCloseDialog();
    } catch (error) {
      setError(error.message || "Failed to save team member");
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const updatedTeam = teamMembers.filter((m) => m.id !== memberId);
      await updateCompany(company.slug, { team: updatedTeam });
    } catch (error) {
      setError("Failed to delete team member");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedTeam = Array.from(teamMembers);
    const [removed] = reorderedTeam.splice(result.source.index, 1);
    reorderedTeam.splice(result.destination.index, 0, removed);

    // Update order property
    const updatedTeam = reorderedTeam.map((member, index) => ({
      ...member,
      order: index,
    }));

    try {
      await updateCompany(company.slug, { team: updatedTeam });
    } catch (error) {
      setError("Failed to reorder team members");
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Person /> Team Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add and manage your team members ({teamMembers.length} members)
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="table">
              <TableChart fontSize="small" />
            </ToggleButton>
            <ToggleButton value="cards">
              <ViewModule fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Team Member
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {teamMembers.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <Person sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No team members added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start building your team by adding the first member
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add First Team Member
          </Button>
        </Paper>
      ) : viewMode === "table" ? (
        // Table View
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Photo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Skills</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((member, index) => (
                  <TableRow
                    key={member.id}
                    sx={{
                      "&:hover": { bgcolor: "grey.50" },
                      borderLeft: "3px solid transparent",
                      "&:hover": {
                        borderLeftColor: "primary.main",
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    <TableCell>
                      <Avatar src={member.image} sx={{ width: 50, height: 50 }}>
                        {member.name?.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {member.name}
                      </Typography>
                      {member.joinDate && (
                        <Typography variant="caption" color="text.secondary">
                          Since {new Date(member.joinDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={500}
                      >
                        {member.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.department}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.location || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        {member.email && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Email fontSize="small" color="action" />
                            <Typography variant="caption" noWrap>
                              {member.email}
                            </Typography>
                          </Box>
                        )}
                        {member.phone && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Phone fontSize="small" color="action" />
                            <Typography variant="caption">
                              {member.phone}
                            </Typography>
                          </Box>
                        )}
                        <Stack direction="row" spacing={0.5}>
                          {member.linkedin && (
                            <Tooltip title="LinkedIn">
                              <IconButton
                                size="small"
                                href={member.linkedin}
                                target="_blank"
                                sx={{ color: "#0077b5" }}
                              >
                                <LinkedIn fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {member.twitter && (
                            <Tooltip title="Twitter">
                              <IconButton
                                size="small"
                                href={member.twitter}
                                target="_blank"
                                sx={{ color: "#1da1f2" }}
                              >
                                <Twitter fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {member.website && (
                            <Tooltip title="Website">
                              <IconButton
                                size="small"
                                href={member.website}
                                target="_blank"
                                color="primary"
                              >
                                <Language fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {member.skills
                          ?.slice(0, 2)
                          .map((skill, idx) => (
                            <Chip
                              key={idx}
                              label={skill}
                              size="small"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          )) || []}
                        {member.skills?.length > 2 && (
                          <Tooltip title={member.skills.slice(2).join(", ")}>
                            <Chip
                              label={`+${member.skills.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(member)}
                            sx={{ color: "primary.main" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMember(member.id)}
                            sx={{ color: "error.main" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Card View (Original)
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="team-members">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {teamMembers
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((member, index) => (
                    <Draggable
                      key={member.id}
                      draggableId={member.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 2,
                            border: snapshot.isDragging
                              ? "2px solid"
                              : "1px solid",
                            borderColor: snapshot.isDragging
                              ? "primary.main"
                              : "divider",
                            transform: snapshot.isDragging
                              ? "rotate(5deg)"
                              : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item>
                                <Box {...provided.dragHandleProps}>
                                  <DragIndicator
                                    sx={{
                                      color: "text.secondary",
                                      cursor: "grab",
                                    }}
                                  />
                                </Box>
                              </Grid>
                              <Grid item>
                                <Avatar
                                  src={member.image}
                                  sx={{ width: 60, height: 60 }}
                                >
                                  {member.name?.charAt(0)}
                                </Avatar>
                              </Grid>
                              <Grid item xs>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {member.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="primary"
                                  gutterBottom
                                >
                                  {member.title}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Chip
                                    label={member.department}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {member.location && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      📍 {member.location}
                                    </Typography>
                                  )}
                                </Stack>
                                {member.skills?.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    {member.skills
                                      .slice(0, 3)
                                      .map((skill, idx) => (
                                        <Chip
                                          key={idx}
                                          label={skill}
                                          size="small"
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      ))}
                                    {member.skills.length > 3 && (
                                      <Chip
                                        label={`+${
                                          member.skills.length - 3
                                        } more`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                )}
                              </Grid>
                              <Grid item>
                                <Stack direction="row" spacing={1}>
                                  <IconButton
                                    onClick={() => handleOpenDialog(member)}
                                    sx={{ color: "primary.main" }}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    onClick={() =>
                                      handleDeleteMember(member.id)
                                    }
                                    sx={{ color: "error.main" }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Stack>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: "70vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          {editingMember ? "✏️ Edit Team Member" : "➕ Add Team Member"}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontWeight: 500,
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  👤 Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name *"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Job Title *"
                      value={formData.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={formData.department || ""}
                        label="Department"
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="e.g., San Francisco, CA"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Profile Image
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign: "center",
                        border: "2px dashed",
                        borderColor: "divider",
                        backgroundColor: "grey.50",
                        "&:hover": {
                          borderColor: "primary.main",
                          backgroundColor: "primary.50",
                        },
                      }}
                    >
                      {imagePreview ? (
                        <Box>
                          <Avatar
                            src={imagePreview}
                            sx={{
                              width: 100,
                              height: 100,
                              mx: "auto",
                              mb: 2,
                              border: "3px solid",
                              borderColor: "primary.main",
                            }}
                          />
                          <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="center"
                          >
                            <input
                              id="image-upload-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              style={{ display: "none" }}
                            />
                            <Button
                              variant="outlined"
                              startIcon={<PhotoCamera />}
                              onClick={() =>
                                document
                                  .getElementById("image-upload-input")
                                  .click()
                              }
                              size="small"
                            >
                              Change Photo
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={removeImage}
                              size="small"
                            >
                              Remove
                            </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Box>
                          <CloudUpload
                            sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
                          />
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                          >
                            Upload Profile Image
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            Click to browse or drag and drop an image
                          </Typography>
                          <input
                            id="image-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                          <Button
                            variant="contained"
                            startIcon={<CloudUpload />}
                            onClick={() =>
                              document
                                .getElementById("image-upload-input")
                                .click()
                            }
                          >
                            Choose Image
                          </Button>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 1, color: "text.secondary" }}
                          >
                            Supported formats: JPG, PNG, GIF (Max 5MB)
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio/Description"
                      multiline
                      rows={3}
                      value={formData.bio || ""}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Brief description about the team member..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Skills (comma-separated)"
                      value={formData.skills?.join(", ") || ""}
                      onChange={handleSkillsChange}
                      placeholder="React, JavaScript, Node.js, Python"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Contact & Social Information Section */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📞 Contact & Social
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="e.g., +1 (555) 123-4567"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="LinkedIn URL"
                      value={formData.linkedin || ""}
                      onChange={(e) =>
                        handleInputChange("linkedin", e.target.value)
                      }
                      placeholder="https://linkedin.com/in/username"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Twitter URL"
                      value={formData.twitter || ""}
                      onChange={(e) =>
                        handleInputChange("twitter", e.target.value)
                      }
                      placeholder="https://twitter.com/username"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Website URL"
                      value={formData.website || ""}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Join Date"
                      type="date"
                      value={formData.joinDate || ""}
                      onChange={(e) =>
                        handleInputChange("joinDate", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            backgroundColor: "grey.50",
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 2,
          }}
        >
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveMember}
            disabled={saving}
            sx={{ borderRadius: 2 }}
          >
            {saving
              ? "Saving..."
              : (editingMember ? "Update" : "Add") + " Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManager;
