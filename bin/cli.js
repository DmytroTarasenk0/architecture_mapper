#!/usr/bin/env node

import ora from "ora";
import chalk from "chalk";
import { buildGraph } from "../src/analyser/parser.js";

console.log(chalk.bold.magenta("\nStarting Architecture Analysis...\n"));

const spinner = ora("Scanning directories and tokenising files...").start();

try {
  setTimeout(() => {
    const graphData = buildGraph("./");

    spinner.succeed(
      chalk.green(`Successfully parsed ${graphData.length} files.`),
    );
    console.log(chalk.gray("Ready to launch the web interface..."));

    // todo: launch server and webpage
  }, 1000);
} catch (error) {
  spinner.fail(chalk.red("Failed to build the architecture graph."));
  console.error(error);
}
