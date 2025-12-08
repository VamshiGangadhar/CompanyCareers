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
} from "@mui/material";
import {
  AutoFixHigh as AIIcon,
  CompareArrows as CompareIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const AIEnhancedTextField = ({
  label,
  value,
  onChange,
  contentType = "general",
  multiline = false,
  rows = 1,
  placeholder,
  variant = "outlined",
  fullWidth = true,
  disabled = false,
  helperText,
  required = false,
  ...props
}) => {
  const [enhancing, setEnhancing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [enhancedText, setEnhancedText] = useState("");
  const [originalText, setOriginalText] = useState("");

  const enhanceText = async () => {
    if (!value || !value.trim()) {
      toast.error("Please enter some text before enhancing");
      return;
    }

    setEnhancing(true);
    setOriginalText(value);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "ENHANCE_TEXT",
          payload: {
            text: value,
            contentType: contentType,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to enhance text");
      }

      const { enhancedText: enhanced } = result.data;
      setEnhancedText(enhanced);
      setShowDialog(true);

      toast.success("Text enhanced successfully! 🎉");
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error(`Failed to enhance text: ${error.message}`);
    } finally {
      setEnhancing(false);
    }
  };

  const acceptEnhancement = () => {
    onChange({ target: { value: enhancedText } });
    setShowDialog(false);
    toast.success("Enhancement applied!");
  };

  const rejectEnhancement = () => {
    setShowDialog(false);
    toast("Enhancement rejected", { icon: "🤷‍♂️" });
  };

  const tryAgain = async () => {
    setShowDialog(false);
    await enhanceText();
  };

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <TextField
          label={label}
          value={value}
          onChange={onChange}
          multiline={multiline}
          rows={rows}
          placeholder={placeholder}
          variant={variant}
          fullWidth={fullWidth}
          disabled={disabled}
          helperText={helperText}
          required={required}
          {...props}
          InputProps={{
            ...props.InputProps,
            endAdornment: (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {props.InputProps?.endAdornment}
                <Tooltip title="Enhance with AI">
                  <span>
                    <IconButton
                      onClick={enhanceText}
                      disabled={enhancing || disabled || !value?.trim()}
                      size="small"
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.50",
                        },
                        "&.Mui-disabled": {
                          color: "grey.400",
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
            label="✨ AI Enhanced"
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
          AI Enhancement Preview
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
            Compare the original and AI-enhanced versions below. Choose the one
            you prefer.
          </Alert>

          {/* Original Text */}
          <Paper
            sx={{ p: 2, mb: 2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              📝 Original Text
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "white",
                fontStyle: originalText ? "normal" : "italic",
              }}
            >
              {originalText || "No text provided"}
            </Typography>
          </Paper>

          {/* Enhanced Text */}
          <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              ✨ AI Enhanced Text
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
            <Typography
              variant="body1"
              sx={{ color: "white", fontWeight: 500 }}
            >
              {enhancedText}
            </Typography>
          </Paper>
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

export default AIEnhancedTextField;
