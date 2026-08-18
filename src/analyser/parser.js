import { findFiles } from "./walker.js";
import { readTheFile } from "./lexer.js";

const parseTokens = (tokens, filePath) => {
  let current = 0;

  const fileData = {
    file: filePath,
    imports: [],
    exports: [],
  };

  const isEOF = () => current >= tokens.length;
  const consume = () => tokens[current++];
  const peek = () => (isEOF() ? { type: null, value: null } : tokens[current]);

  while (!isEOF()) {
    const token = consume();

    // ES6 part
    if (token.type === "Keyword" && token.value === "import") {
      const importedItems = [];

      while (!isEOF() && peek().value !== "from") {
        const nextToken = consume();
        if (nextToken.type === "Identifier") {
          importedItems.push(nextToken.value);
          if (peek().value === "as") {
            consume();
            consume();
          }
        }
      }

      if (peek().value === "from") {
        consume();
        if (peek().type === "StringLiteral") {
          const pathToken = consume();
          const cleanPath = pathToken.value.slice(1, -1);
          fileData.imports.push({ source: cleanPath, items: importedItems });
        }
      }
    }

    if (token.type === "Keyword" && token.value === "export") {
      if (isEOF()) continue;
      const nextToken = consume();

      // export default
      if (nextToken.value === "default") {
        fileData.exports.push("default");
      }
      // export { a, b }
      else if (nextToken.value === "{") {
        while (!isEOF() && peek().value !== "}") {
          const item = consume();
          if (item.type === "Identifier") {
            fileData.exports.push(item.value);
            if (peek().value === "as") {
              consume();
              consume();
            }
          }
        }
        if (!isEOF()) consume();
      }
      // export const/let/var/function/class
      else if (
        ["const", "let", "var", "function", "class"].includes(nextToken.value)
      ) {
        if (peek().type === "Identifier") {
          fileData.exports.push(consume().value);
        }
      }
    }

    // COMMONJS part
    if (token.type === "Keyword" && token.value === "require") {
      if (peek().value === "(") {
        consume();

        if (peek().type === "StringLiteral") {
          const pathToken = consume();
          const cleanPath = pathToken.value.slice(1, -1);

          fileData.imports.push({
            source: cleanPath,
            items: ["*(CommonJS)"],
          });
        }
      }
    }

    // module.exports
    if (token.type === "Identifier" && token.value === "module") {
      if (peek().value === ".") {
        consume();
        if (peek().value === "exports") {
          consume();
          if (peek().value === "=") {
            consume();

            // module.exports = { a, b }
            if (peek().value === "{") {
              consume(); // eat '{'
              while (!isEOF() && peek().value !== "}") {
                const item = consume();
                if (item.type === "Identifier")
                  fileData.exports.push(item.value);
              }
            }
            // module.exports = function
            else if (peek().type === "Identifier") {
              fileData.exports.push(consume().value);
            }
          }
        }
      }
    }

    // exports.function
    if (token.type === "Identifier" && token.value === "exports") {
      if (peek().value === ".") {
        consume();
        if (peek().type === "Identifier") {
          const exportName = consume();
          if (peek().value === "=") {
            fileData.exports.push(exportName.value);
          }
        }
      }
    }
  }

  return fileData;
};

const buildGraph = (dir = "./") => {
  const files = findFiles(dir);
  const graph = [];

  for (const file of files) {
    const tokens = readTheFile(file);
    const parsedData = parseTokens(tokens, file);
    graph.push(parsedData);
  }

  return graph;
};

// console.log(JSON.stringify(buildGraph("./"), null, 2));

export { buildGraph };
