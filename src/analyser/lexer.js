import fs from "node:fs";

const readTheFile = (path) => {
  const fileString = fs.readFileSync(path, "utf-8");

  let cursor = 0;
  const tokens = [];

  const keywords = [
    "import",
    "from",
    "export",
    "default",
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "class",
    "require",
  ];

  while (cursor < fileString.length) {
    let char = fileString[cursor];

    // skip the whitespaces
    if (/\s/.test(char)) {
      cursor++;
      continue;
    }

    // skip the comments
    if (char === "/" && fileString[cursor + 1] === "/") {
      cursor += 2;
      while (cursor < fileString.length && fileString[cursor] !== "\n") {
        cursor++;
      }
      continue;
    }

    // multiline also
    if (char === "/" && fileString[cursor + 1] === "*") {
      cursor += 2;
      while (
        cursor < fileString.length &&
        !(fileString[cursor] === "*" && fileString[cursor + 1] === "/")
      ) {
        cursor++;
      }
      cursor += 2;
      continue;
    }

    // add the strings
    if (char === '"' || char === "'" || char === "`") {
      let stringValue = char;
      let quoteType = char;
      cursor++;

      while (cursor < fileString.length && fileString[cursor] !== quoteType) {
        stringValue += fileString[cursor];
        cursor++;
      }

      stringValue += fileString[cursor];
      cursor++;
      tokens.push({ type: "StringLiteral", value: stringValue });
      continue;
    }

    // numbers
    if (/[0-9]/.test(char)) {
      let num = "";
      while (cursor < fileString.length && /[0-9.]/.test(fileString[cursor])) {
        num += fileString[cursor];
        cursor++;
      }
      tokens.push({ type: "NumericLiteral", value: num });
      continue;
    }

    // identifiers (and keywords)
    if (/[a-zA-Z_$]/.test(char)) {
      let word = "";
      while (
        cursor < fileString.length &&
        /[a-zA-Z0-9_$]/.test(fileString[cursor])
      ) {
        word += fileString[cursor];
        cursor++;
      }
      tokens.push({
        type: keywords.includes(word) ? "Keyword" : "Identifier",
        value: word,
      });
      continue;
    }

    // punctuators and operators
    const punc3 = fileString.substring(cursor, cursor + 3);
    if (["===", "!==", "...", ">>>"].includes(punc3)) {
      tokens.push({ type: "Punctuator", value: punc3 });
      cursor += 3;
      continue;
    }

    const punc2 = fileString.substring(cursor, cursor + 2);
    if (
      [
        "=>",
        "==",
        "!=",
        "<=",
        ">=",
        "&&",
        "||",
        "++",
        "--",
        "+=",
        "-=",
        "*=",
        "/=",
        "?.",
      ].includes(punc2)
    ) {
      tokens.push({ type: "Punctuator", value: punc2 });
      cursor += 2;
      continue;
    }

    if (/[()[\]{};=<>+\-*/%&|!^~?:.,]/.test(char)) {
      tokens.push({ type: "Punctuator", value: char });
      cursor++;
      continue;
    }

    cursor++;
  }
  return tokens;
};

console.log(readTheFile("src\\analyser\\lexer.js"));

export { readTheFile };
