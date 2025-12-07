require("dotenv").config();

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { handleEvent } = require("./routes/eventHandler");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://company-careers.vercel.app",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200
  })
);

// Increase payload size limits for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Handle preflight OPTIONS requests explicitly
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "CompanyCareers Backend API is running!",
    status: "healthy",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// REST API endpoint for frontend compatibility
app.post("/api/event", handleEvent);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = req.headers["x-user-id"];

    console.log("Auth context:", {
      hasToken: !!token,
      userId: userId,
      headers: req.headers,
    });

    return {
      userId: userId || null,
      token: token || null,
    };
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  }
}

startServer();

module.exports = app;
