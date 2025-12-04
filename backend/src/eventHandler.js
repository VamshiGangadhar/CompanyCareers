import { authHandlers } from "./handlers/authHandlers.js";
import { dataHandlers } from "./handlers/dataHandlers.js";

// Response helpers
export const successResponse = (data, message = "Success") => ({
  success: true,
  data,
  message,
});

export const errorResponse = (message, code = 400) => {
  const error = new Error(message);
  error.statusCode = code;
  throw error;
};

// Main event handler - routes events to appropriate handlers
export const handleEvent = async (step, payload) => {
  // Auth-related steps
  if (step.startsWith("AUTH_")) {
    return await authHandlers[step](payload);
  }

  // Data-related steps
  if (
    step.startsWith("GET_") ||
    step.startsWith("ADD_") ||
    step.startsWith("UPDATE_") ||
    step.startsWith("DELETE_")
  ) {
    return await dataHandlers[step](payload);
  }

  // Unknown step
  throw errorResponse(`Unknown step: ${step}`, 400);
};
