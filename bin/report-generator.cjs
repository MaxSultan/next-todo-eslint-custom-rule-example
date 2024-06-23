#!/bin/node

const { once } = require("node:events");
const readline = require("node:readline");
const fs = require("node:fs");
const { exec } = require("node:child_process");

async function processStdInLineByLine() {
  const output = [];
  try {
    const rl = readline.createInterface({
      input: process.stdin,
    });

    rl.on("line", (line) => {
      const isFileName = line.startsWith("/");
      const isError = line.includes(
        "local/styling-non-styled-components-within"
      );

      if (isFileName) output.push([line, 0]);
      else if (isError) {
        output[output.length - 1][1] += 1;
      }
    });

    await once(rl, "close");

    return output;
  } catch (err) {
    process.stderr.write("error reading stdin", err);
  }
}

function getCodeOwnersMap() {
  try {
    const data = fs.readFileSync("./CODEOWNERS", "utf8");
    const map = data
      .split("\n")
      .filter(
        (line) => !line.startsWith("#") && line !== "" && line.includes("@")
      )
      .map((val) => {
        const [filepath, ...owners] = val.split(" ");
        return [filepath, [...owners]];
      })
      .sort(
        (filepathA, filepathB) =>
          filepathB[0].split("/").filter((str) => str !== "").length -
          filepathA[0].split("/").filter((str) => str !== "").length
      )
      .reduce((acc, [filepath, owners]) => {
        if (filepath === "*") return acc;
        return acc.set(filepath.replace("**", "*"), [...owners]);
      }, new Map());
    return map;
  } catch (err) {
    process.stderr.write("error generating codeowners map", err);
  }
}

process.stdout.write("Running report-generator \n");

const addStdOutColor = (output, color) => {
  if (color === "green") return `\x1b[32m${output}\x1b[37m`;
  if (color === "yellow") return `\x1b[33m${output}\x1b[37m`;
  return `\x1b[31m${output}\x1b[37m`;
};

const codeOwnersMap = getCodeOwnersMap();

processStdInLineByLine().then((fileErrors) => {
  const errorsByTeam = {};
  fileErrors.forEach(([filePath, errorCount]) => {
    const key = [...codeOwnersMap.keys()].find((glob) =>
      new RegExp(glob).test(filePath)
    );
    if (key) {
      codeOwnersMap.get(key).forEach((owner) => {
        process.stdout.write(
          `${filePath} has ${errorCount} error(s) assigned to ${owner} \n`
        );
        if (errorsByTeam[owner]) errorsByTeam[owner] += errorCount;
        else errorsByTeam[owner] = errorCount;
      });
    } else {
      process.stdout.write(
        `${filePath} has ${errorCount} error(s) assigned to no team \n`
      );
    }
  });

  process.stdout.write(`\n \nErrors by team:\n`);
  Object.entries(errorsByTeam).forEach(([key, value]) => {
    process.stdout.write(
      `${key}: ${addStdOutColor(
        value,
        value > 10 ? "red" : value > 5 ? "yellow" : "green"
      )} \n`
    );
  });

  const dataRows = Object.entries(errorsByTeam)
    .map(
      ([key, value]) => `<tr>
      <td>${key}</td>
      <td>${value}</td>
  </tr>`
    )
    .join("\n");

  const totalRow = `<tr>
      <td>Total</td>
      <td>${fileErrors.reduce(
        (acc, [_, errorCount]) => (acc += errorCount),
        0
      )}</td>
  </tr>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            svg {
                filter: opacity(0.3);
                position: fixed;
                top: 50%;
                transform: translateY(-50%);
            }
            table {
                border-collapse: separate;
                border-spacing: 16px;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 5vmin;
                text-align: center;
            }
            table tr {
                backdrop-filter:blur(8px);
                border-radius: 8px;
            }
            table tr:nth-of-type(odd):not(:has(> th)) {
                backdrop-filter: invert(80%) blur(8px);
                color:white;
            }
            table td {
                padding: 8px min(128px, 10vw);
                white-space: nowrap;
            }
            caption {
                caption-side: bottom;
                padding: 10px;
                font-size: 24px;
            }
        </style>
    </head>
    <body>
        <table>
            <caption>
                Styling non styled component violations in todo app
            </caption>
            <tr>
                <th>Team</th><th>Violations</th>
            </tr>
            ${dataRows}
            ${totalRow}
        </table>
    </body>
    </html>
  `;

  fs.writeFile("report.html", htmlContent, (err) => {
    if (err) {
      process.stderr.write(
        addStdOutColor("there was an error writing file", "red")
      );
    } else {
      process.stdout.write(`\x1b[32mReport was successfully generated\n`);
      exec("open report.html");
    }
  });
});
