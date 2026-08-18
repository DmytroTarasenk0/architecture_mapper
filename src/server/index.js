import express from "express";
import open from "open";
import chalk from "chalk";
import { buildGraph } from "../analyser/parser.js";

const startServer = (dir, port) => {
  const app = express();

  app.get("/graph", (req, res) => {
    const graphData = buildGraph(dir);
    res.json(graphData);
  });

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
    await open(`http://localhost:${port}/graph`);
  });
};

export { startServer };
