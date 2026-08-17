import fs from "node:fs";
import path from "node:path";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

const findFiles = (dir = "./") => {
  const entries = fs.readdirSync(dir, {
    recursive: true,
    withFileTypes: true,
  });

  const files = entries
    .filter(
      (entry) =>
        entry.isFile() && extensions.includes(path.extname(entry.name)),
    )
    .map((entry) => path.join(entry.parentPath, entry.name));

  return files;
};

export { findFiles };
