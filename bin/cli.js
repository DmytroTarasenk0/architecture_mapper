#!/usr/bin/env node

import ora from "ora";
import chalk from "chalk";
import { parseArgs } from "node:util";
import { buildGraph } from "../src/analyser/parser.js";
import { startServer } from "../src/server/index.js";

const options = {
  port: {
    type: "string",
    short: "p",
  },
  dir: {
    type: "string",
    short: "d",
  },
};

const { values } = parseArgs({ options, strict: false });

const targetPort = values.port ? parseInt(values.port, 10) : 8888;
const targetDir = values.dir || "./";

console.log(chalk.bold.magenta("\nStarting Architecture Analysis...\n"));

const spinner = ora("Scanning directories and tokenising files...").start();

try {
  setTimeout(() => {
    const graphData = buildGraph(targetDir);

    spinner.succeed(
      chalk.green(`Successfully parsed ${graphData.length} files.`),
    );

    startServer(targetDir, targetPort);
  }, 1000);
} catch (error) {
  spinner.fail(chalk.red("Failed to build the architecture graph."));
  console.error(error);
}
