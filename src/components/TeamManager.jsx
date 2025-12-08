import React, { useState } from "react";
import AIEnhancedTextField from "./AIEnhancedTextField";
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            boxShadow: "0px 8px 28px rgba(0,0,0,0.12)",
          },
        }}
      >
        {/* --- STRIPE ONBOARDING HEADER --- */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {editingMember ? "Edit Team Member" : "Add Team Member"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Provide profile + details to showcase your team member.
          </Typography>
        </Box>

        {/* --- CONTENT AREA --- */}
        <DialogContent sx={{ px: 4, py: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* ------------------------------
        TOP ROW: CONTACT (LEFT) + PHOTO (RIGHT)
    ------------------------------- */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Contact Information
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />

                <TextField
                  label="Phone"
                  fullWidth
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />

                <TextField
                  label="Location"
                  fullWidth
                  value={formData.location || ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              </Stack>
            </Grid>

            {/* PROFILE PHOTO ON THE RIGHT */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Profile Photo
              </Typography>

              <Box
                sx={{
                  border: "1px dashed #ccc",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    background: "rgba(99,91,255,0.03)",
                  },
                }}
                onClick={() =>
                  document.getElementById("image-upload-input").click()
                }
              >
                {imagePreview ? (
                  <>
                    <Avatar
                      src={imagePreview}
                      sx={{
                        width: 110,
                        height: 110,
                        mx: "auto",
                        mb: 2,
                        border: "3px solid #635bff29",
                      }}
                    />
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={() =>
                        document.getElementById("image-upload-input").click()
                      }
                    >
                      Change Photo
                    </Button>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={removeImage}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <PhotoCamera
                      sx={{ fontSize: 45, color: "text.secondary", mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload a profile photo
                    </Typography>
                  </>
                )}

                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </Box>
            </Grid>

            {/* -----------------------------------------
        BASIC INFORMATION (UNDER CONTACT + PHOTO)
    ------------------------------------------ */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Basic Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <AIEnhancedTextField
                    fullWidth
                    required
                    label="Full Name *"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    contentType="title"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <AIEnhancedTextField
                    fullWidth
                    required
                    label="Job Title *"
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    contentType="title"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ minWidth: 180 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      label="Department"
                      value={formData.department || ""}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                    >
                      {[
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
                      ].map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
            </Grid>

            {/* BIO */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Bio
              </Typography>

              <AIEnhancedTextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                placeholder="Short description…"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                contentType="description"
              />
            </Grid>

            {/* SKILLS */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Skills
              </Typography>

              <TextField
                fullWidth
                placeholder="React, Node.js, Figma"
                value={formData.skills?.join(", ") || ""}
                onChange={handleSkillsChange}
              />
            </Grid>

            {/* SOCIAL LINKS */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Social Profiles
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={formData.linkedin || ""}
                    onChange={(e) =>
                      handleInputChange("linkedin", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={formData.twitter || ""}
                    onChange={(e) =>
                      handleInputChange("twitter", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.website || ""}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        {/* --- FOOTER --- */}
        <DialogActions
          sx={{
            px: 4,
            py: 3,
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleCloseDialog}>Cancel</Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSaveMember}
            sx={{ borderRadius: 2 }}
          >
            {saving
              ? "Saving..."
              : editingMember
              ? "Update Member"
              : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManager;
