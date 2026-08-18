import fs from "node:fs";
import path from "node:path";

const extensions = [".js", ".jsx", ".ts", ".tsx"];
const ignoreDirs = ["node_modules", ".git", "dist", "build", "coverage"];

const findFiles = (dir = "./", fileList = []) => {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        findFiles(fullPath, fileList);
      }
    } else if (
      entry.isFile() &&
      extensions.includes(path.extname(entry.name))
    ) {
      fileList.push(fullPath);
    }
  }

  return fileList;
};

export { findFiles };
