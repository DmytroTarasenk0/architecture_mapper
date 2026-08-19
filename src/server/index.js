import express from "express";
import open from "open";
import chalk from "chalk";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGraph } from "../analyser/parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = (dir, port) => {
  const app = express();

  app.get("/graph", (req, res) => {
    const graphData = buildGraph(dir);
    res.json(graphData);
  });

  const uiPath = path.join(__dirname, "../../dist");
  app.use(express.static(uiPath));

  const server = app.listen(port);

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(chalk.yellow(`Port ${port} is busy, trying ${port + 1}...`));
      startServer(dir, port + 1);
    } else {
      console.error(chalk.red("Server error:"), err);
    }
  });

  server.once("listening", async () => {
    console.log(chalk.green(`Server running at http://localhost:${port}`));
    await open(`http://localhost:${port}/`);
  });
};

export { startServer };
