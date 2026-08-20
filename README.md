# Architecture Mapper

A local code architecture analyser. Architecture Mapper parses JavaScript/TypeScript project's Abstract Syntax Tree (AST) to generate an interactive, visual dependency graph right in browser.

## Features

- **Interactive Visualisation:** Explore codebase through a node graph powered by Cytoscape.js.
- **Smart Analytics:** Click on any file to see its global import score and exactly which functions/variables are being consumed by other files.
- **Orphan Detection:** Instantly spot dead code. Files with zero incoming imports are highlighted in dashed red.
- **Universal Module Support:** Seamlessly parse both modern ES6 (import/export) and legacy CommonJS (require/module.exports) syntaxes.
- **Zero-Config CLI:** Run locally with a lightweight Express server and automatically open the dashboard in default browser.

## Installation

You can run Architecture Mapper directly via npx without installing it globally:

    npx architecture-mapper --dir ./src --port 8888

Alternatively, install it globally to use anywhere:

    npm install -g architecture-mapper

## Usage

Navigate to your project directory and run the tool. You can specify the directory to analyse and the port for the web interface.

    architecture-mapper -d ./src -p 5000

### CLI Options

| Flag     | Short | Description                         | Default |
| :------- | :---- | :---------------------------------- | :------ |
| `--dir`  | `-d`  | The directory to scan and tokenise. | `./`    |
| `--port` | `-p`  | The local port to serve the web UI. | `8888`  |

## How it Works

Architecture Mapper does not rely on heavy third-party AST libraries. It uses a custom, optimised Lexer and Parser written from scratch to tokenise code, map the dependencies, and calculate architectural metrics before serving them to a lightweight React frontend.
