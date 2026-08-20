import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";

export default function App() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [itemAnalytics, setItemAnalytics] = useState({});

  useEffect(() => {
    fetch("/graph")
      .then((res) => res.json())
      .then((data) => {
        const elements = [];
        const knownNodes = new Set();

        const fileImportCount = {}; // {"path/file": 1, "node:fs": 2}
        const functionImportCount = {};
        /*
          "node:fs": {
            fs: 2,
            readFileSync: 1,
          },
          "path/file": {
            function: 1
          }
        };
        */

        // counters
        data.forEach((fileNode) => {
          fileImportCount[fileNode.file] = 0;
          functionImportCount[fileNode.file] = {};
        });

        data.forEach((fileNode) => {
          fileNode.imports.forEach((imp) => {
            fileImportCount[imp.source] =
              (fileImportCount[imp.source] || 0) + 1;

            if (!functionImportCount[imp.source])
              functionImportCount[imp.source] = {};
            imp.items.forEach((item) => {
              functionImportCount[imp.source][item] =
                (functionImportCount[imp.source][item] || 0) + 1;
            });
          });
        });

        setItemAnalytics(functionImportCount);

        const fileNameCounts = {};
        data.forEach((fileNode) => {
          const fileName = fileNode.file.split(/[/\\]/).pop();
          fileNameCounts[fileName] = (fileNameCounts[fileName] || 0) + 1;
        });

        // local graph nodes
        data.forEach((fileNode) => {
          knownNodes.add(fileNode.file);

          const pathParts = fileNode.file.split(/[/\\]/);
          const fileName = pathParts.pop();

          // if the filename appears more than once add its parent directory
          const label =
            fileNameCounts[fileName] > 1 && pathParts.length > 0
              ? `${pathParts.pop()}/${fileName}`
              : fileName;

          const isOrphan = fileImportCount[fileNode.file] === 0;

          elements.push({
            data: {
              id: fileNode.file,
              label: label,
              importScore: fileImportCount[fileNode.file] || 0,
            },
            classes: isOrphan ? "orphan" : "",
          });
        });

        // external nodes and edges
        data.forEach((fileNode) => {
          fileNode.imports.forEach((imp) => {
            if (!knownNodes.has(imp.source)) {
              knownNodes.add(imp.source);
              elements.push({
                data: { id: imp.source, label: imp.source },
                classes: "external",
              });
            }

            elements.push({
              data: {
                id: `${fileNode.file}=>${imp.source}`,
                source: fileNode.file,
                target: imp.source,
                importedItems: imp.items.join(", "),
                isCircular: imp.circular || false,
              },
              classes: imp.circular ? "circular" : "",
            });
          });
        });

        // graph
        const cy = cytoscape({
          container: containerRef.current,
          elements: elements,
          style: [
            {
              selector: "node",
              style: {
                "background-color": "#007acc",
                label: "data(label)",
                color: "#fff",
                "text-valign": "bottom",
                "text-margin-y": 5,
                "font-size": "12px",
                "text-outline-width": 2,
                "text-outline-color": "#1e1e1e",
                "min-zoomed-font-size": 8,
              },
            },
            {
              selector: "node.external",
              style: { "background-color": "#555", shape: "diamond" },
            },
            {
              selector: "node.orphan",
              style: {
                "background-color": "#e06c75",
                "border-width": 3,
                "border-color": "#ff0000",
                "border-style": "dashed",
              },
            },
            {
              selector: "edge",
              style: {
                width: 1.5,
                opacity: 0.4,
                "line-color": "#888",
                "target-arrow-color": "#888",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
              },
            },
            {
              selector: "edge.circular",
              style: {
                "line-color": "#ff0000",
                "target-arrow-color": "#ff0000",
                width: 3,
                opacity: 1,
                "line-style": "dashed",
                "z-index": 50,
              },
            },
            {
              selector: ":selected",
              style: {
                "background-color": "#ff00ea",
                "line-color": "#ff00ea",
                "target-arrow-color": "#ff00ea",
                opacity: 1,
                "z-index": 100,
              },
            },
          ],
          layout: {
            name: "cose",
            padding: 50,
            nodeRepulsion: function (node) {
              return 400000;
            },
            idealEdgeLength: function (edge) {
              return 100;
            },
            nodeOverlap: 20,
          },
        });

        // interactivity
        cy.on("tap", "node", (evt) => {
          const node = evt.target;
          setDetails({
            type: "File",
            id: node.id(),
            label: node.data("label"),
            score: node.data("importScore"),
          });
        });

        cy.on("tap", "edge", (evt) => {
          const edge = evt.target;
          setDetails({
            type: "Dependency",
            source: edge.data("source"),
            target: edge.data("target"),
            items: edge.data("importedItems"),
            isCircular: edge.data("isCircular"),
          });
        });

        cy.on("tap", (evt) => {
          if (evt.target === cy) setDetails(null);
        });

        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        {loading && (
          <div style={{ position: "absolute", padding: "20px", color: "#fff" }}>
            Mapping architecture...
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* legend */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            backgroundColor: "rgba(37, 37, 38, 0.85)",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #444",
            color: "#ccc",
            fontSize: "0.85rem",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#fff" }}>Graph Legend</h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#007acc",
                marginRight: "10px",
              }}
            ></span>
            Internal File
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: "2px dashed #ff0000",
                backgroundColor: "#e06c75",
                marginRight: "10px",
              }}
            ></span>
            Unused or Root Entry (0 Imports)
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                transform: "rotate(45deg)",
                backgroundColor: "#555",
                marginRight: "10px",
              }}
            ></span>
            External NPM Package
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "20px",
                height: "3px",
                borderBottom: "3px dashed #ff0000",
                marginRight: "10px",
              }}
            ></span>
            Circular Dependency Loop
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                color: "#888",
                marginRight: "10px",
                fontSize: "1.2rem",
                lineHeight: "0",
              }}
            >
              &rarr;
            </span>
            Arrow points to the Dependency
          </div>
        </div>
      </div>

      {/* side panel */}
      {details && (
        <div
          style={{
            minWidth: "350px",
            maxWidth: "350px",
            flexShrink: 0,
            backgroundColor: "#252526",
            borderLeft: "1px solid #333",
            padding: "20px",
            color: "#ccc",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>
            {details.type} Details
          </h2>
          <hr style={{ borderColor: "#444" }} />

          {details.type === "File" && (
            <div>
              <p>
                <strong>Label:</strong> {details.label}
              </p>
              <p>
                <strong>Full Path:</strong>
                <br />
                <span style={{ color: "#9cdcfe", fontSize: "0.9em" }}>
                  {details.id}
                </span>
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  backgroundColor: "#1e1e1e",
                  borderRadius: "4px",
                }}
              >
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Global Import Score:</strong> {details.score}
                </p>
                {details.score === 0 && (
                  <span style={{ color: "#e06c75", fontSize: "0.9em" }}>
                    This file is never imported (Orphan or Root Entry).
                  </span>
                )}
              </div>

              {/* function analytics */}
              {itemAnalytics[details.id] &&
                Object.keys(itemAnalytics[details.id]).length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <p>
                      <strong>Times Imported:</strong>
                    </p>
                    <ul
                      style={{
                        paddingLeft: "20px",
                        color: "#ce9178",
                        fontFamily: "monospace",
                      }}
                    >
                      {Object.entries(itemAnalytics[details.id]).map(
                        ([funcName, count]) => (
                          <li key={funcName}>
                            {funcName}:{" "}
                            <span style={{ color: "#4ec9b0" }}>{count}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {details.type === "Dependency" && (
            <div>
              <p>
                <strong>Importing File:</strong>
                <br />
                <span style={{ fontSize: "0.9em" }}>{details.source}</span>
              </p>
              <p>
                <strong>Dependency:</strong>
                <br />
                <span style={{ fontSize: "0.9em" }}>{details.target}</span>
              </p>

              {details.isCircular && (
                <div
                  style={{
                    backgroundColor: "#4a1111",
                    padding: "10px",
                    borderRadius: "4px",
                    margin: "15px 0",
                    border: "1px solid #ff0000",
                  }}
                >
                  <strong style={{ color: "#ff6666" }}>
                    Circular Dependency Detected.
                  </strong>
                  <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>
                    This file imports a module that eventually imports it back,
                    creating a loop.
                  </p>
                </div>
              )}

              <p>
                <strong>Imported Functions/Variables:</strong>
              </p>
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  padding: "10px",
                  borderRadius: "4px",
                  color: "#ce9178",
                  fontFamily: "monospace",
                }}
              >
                {details.items || "Side-effect import (entire file executed)"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
