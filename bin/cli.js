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
};

const { values } = parseArgs({ options, strict: false });

const targetPort = values.port ? parseInt(values.port, 10) : 8888;

console.log(chalk.bold.magenta("\nStarting Architecture Analysis...\n"));

const spinner = ora("Scanning directories and tokenising files...").start();

try {
  setTimeout(() => {
    const graphData = buildGraph("./");

    spinner.succeed(
      chalk.green(`Successfully parsed ${graphData.length} files.`),
    );

    startServer("./", targetPort);
  }, 1000);
} catch (error) {
  spinner.fail(chalk.red("Failed to build the architecture graph."));
  console.error(error);
}
