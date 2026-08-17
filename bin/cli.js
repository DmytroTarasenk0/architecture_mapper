#!/usr/bin/env node

import { findFiles } from "../src/analyser/walker.js";
import { readTheFile } from "../src/analyser/lexer.js";

const files = findFiles("./");
files.forEach((file) => console.log(file, readTheFile(file)));
