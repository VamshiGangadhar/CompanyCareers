import { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  AutoFixHigh as AIIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  LocalHospital as BenefitsIcon,
  List as ListIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const AIEnhancedListField = ({
  label,
  value = "",
  onChange,
  contentType = "list",
  placeholder = "Enter items, one per line",
  helperText = "Enter each item on a new line",
  disabled = false,
  required = false,
  icon: CustomIcon,
  ...props
}) => {
  const [enhancing, setEnhancing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [enhancedItems, setEnhancedItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);

  // Convert string to array for processing
  const stringToArray = (str) => {
    return str
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Convert array back to string for display
  const arrayToString = (arr) => {
    return arr.join("\n");
  };

  const enhanceItems = async () => {
    const items = stringToArray(value);

    if (items.length === 0) {
      toast.error("Please enter some items before enhancing");
      return;
    }

    setEnhancing(true);
    setOriginalItems(items);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "ENHANCE_TEXT_ARRAY",
          payload: {
            items: items,
            contentType: contentType,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to enhance items");
      }

      const { enhancedItems: enhanced } = result.data;
      setEnhancedItems(enhanced);
      setShowDialog(true);

      toast.success("Items enhanced successfully! 🎉");
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error(`Failed to enhance items: ${error.message}`);
    } finally {
      setEnhancing(false);
    }
  };

  const acceptEnhancement = () => {
    onChange({ target: { value: arrayToString(enhancedItems) } });
    setShowDialog(false);
    toast.success("Enhancement applied!");
  };

  const rejectEnhancement = () => {
    setShowDialog(false);
    toast("Enhancement rejected", { icon: "🤷‍♂️" });
  };

  const tryAgain = async () => {
    setShowDialog(false);
    await enhanceItems();
  };

  // Get appropriate icon based on content type
  const getIcon = (type) => {
    if (CustomIcon) return <CustomIcon />;

    switch (type) {
      case "values":
        return <StarIcon color="warning" />;
      case "benefits":
        return <BenefitsIcon color="success" />;
      default:
        return <ListIcon />;
    }
  };

  const items = stringToArray(value);

  return (
    <>
      <Box>
        <Box sx={{ position: "relative" }}>
          <TextField
            label={label}
            fullWidth
            multiline
            rows={4}
            value={value}
            onChange={onChange}
            variant="outlined"
            helperText={helperText}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            {...props}
            InputProps={{
              ...props.InputProps,
              endAdornment: (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {props.InputProps?.endAdornment}
                  <Tooltip title="Enhance list with AI">
                    <span>
                      <IconButton
                        onClick={enhanceItems}
                        disabled={enhancing || disabled || items.length === 0}
                        size="small"
                        sx={{
                          color: "primary.main",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            backgroundColor: "primary.50",
                          },
                          "&.Mui-disabled": {
                            color: "grey.400",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                          },
                        }}
                      >
                        {enhancing ? (
                          <CircularProgress size={20} />
                        ) : (
                          <AIIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ),
            }}
          />

          {!disabled && (
            <Chip
              label="✨ AI Enhanced List"
              size="small"
              variant="outlined"
              color="primary"
              sx={{
                position: "absolute",
                top: -8,
                right: 8,
                fontSize: "0.7rem",
                height: 20,
                backgroundColor: "background.paper",
              }}
            />
          )}
        </Box>

        {/* Preview List */}
        {items.length > 0 && !disabled && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview:
            </Typography>
            <List dense>
              {items.slice(0, 5).map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getIcon(contentType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      variant: "body2",
                    }}
                  />
                </ListItem>
              ))}
              {items.length > 5 && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }} />
                  <ListItemText
                    primary={`... and ${items.length - 5} more items`}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontStyle: "italic",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </Box>

      {/* Enhancement Dialog */}
      <Dialog
        open={showDialog}
        onClose={rejectEnhancement}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundImage:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "white",
          }}
        >
          <AIIcon />
          AI List Enhancement Preview
          <Chip
            label="AI Powered"
            size="small"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              ml: 1,
            }}
          />
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "& .MuiAlert-icon": { color: "white" },
            }}
          >
            Compare your original list with the AI-enhanced version below.
          </Alert>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {/* Original Items */}
            <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: 2,
                }}
              >
                📝 Original Items
              </Typography>
              <List dense>
                {originalItems.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        {getIcon(contentType)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "white",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Enhanced Items */}
            <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: 2,
                }}
              >
                ✨ AI Enhanced Items
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    backgroundColor: "success.main",
                    color: "white",
                    height: 18,
                    fontSize: "0.6rem",
                  }}
                />
              </Typography>
              <List dense>
                {enhancedItems.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box sx={{ color: "white" }}>{getIcon(contentType)}</Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "white",
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={tryAgain}
            startIcon={<RefreshIcon />}
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.6)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            variant="outlined"
            disabled={enhancing}
          >
            Try Again
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            onClick={rejectEnhancement}
            startIcon={<RejectIcon />}
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.6)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            variant="outlined"
          >
            Keep Original
          </Button>

          <Button
            onClick={acceptEnhancement}
            startIcon={<AcceptIcon />}
            variant="contained"
            sx={{
              backgroundColor: "success.main",
              "&:hover": {
                backgroundColor: "success.dark",
              },
            }}
          >
            Use Enhanced
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIEnhancedListField;
