ESLINT install - https://eslint.org/docs/latest/use/getting-started

Show the start:
- pages/index.jsx lines 13-26
- components/descructive-action-button.jsx line 4,36
- CODEOWNERS

What is styled components?
How does it work in 30 seconds
 
Explain the styling non styled components rule

1) run `npm init @eslint/config@latest`
2) answer questions in the CLI
3) Show the Config and explain options

```js
// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";
import local from "./rules/index.js";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
];
```
4) Add ignores to config

```js
// eslint.config.js
  {
    ignores: [".next/", "node_modules/"],
  },
```

5) Run the linter

```bash
npx eslint **/*.{js,jsx}
```
6) Turn off the react rule errors

```js
// eslint.config.js
{
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
```

7) TDD - Write tests
```js
// rules/styling-non-styled-components-within.test.js
import { RuleTester } from "eslint";
import fooBarRule from "./styling-non-styled-components-within.js";

// RuleTester.setDefaultConfig({
//   languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
// });

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020 },
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  "styling-non-styled-components-within", // rule name
  fooBarRule, // rule code
  {
    // checks
    // 'valid' checks cases that should pass
    valid: [
      {
        code: `
            const StyledButton = styled.button\`
                background-color: green;
            \`

            const StyledForm = styled.form\`
                display: grid;

                & > \${StyledButton} {
                    align-self: end;
                }
            \`

            const TodoForm = () => {
                return (
                    <StyledForm>
                        Mark Todo as completed?
                        <StyledButton>Yes!</StyledButton>
                    </StyledForm>
                )
            }
        `,
      },
    ],
    // 'invalid' checks cases that should not pass
    invalid: [
      {
        code: `
        const StyledButton = ({children, onClick}) => {
            return (
                <button onClick={onClick}>{children}</button>
            )
        }

        const StyledForm = styled.form\`
            display: grid;

            & > \${StyledButton} {
                align-self: end;
            }
        \`

        const TodoForm = () => {
            return (
                <StyledForm>
                    Mark Todo as completed?
                    <StyledButton>Yes!</StyledButton>
                </StyledForm>
            )
        }
    `,
        errors: [
          "Don't attempt to style identifiers that are not styled components using interpolation",
        ],
      },
    ],
  }
);

console.log("All tests passed!");

```
8) Move to AST Explorer - https://astexplorer.net/
9)  Add test cases to AST explorer

```js

// good
const StyledButton = styled.button`
    background-color: green;
`;

const StyledForm = styled.form`
    display: grid;

    & > ${StyledButton} {
        align-self: end;
    }
`;

const TodoForm = () => {
    return (
        <StyledForm>
            Mark Todo as completed?
            <StyledButton>Yes!</StyledButton>
        </StyledForm>
    )
};

//bad
const StyledButton = ({children, onClick}) => {
    return (
        <button onClick={onClick}>{children}</button>
    )
};

const StyledForm = styled.form`
    display: grid;

    & > ${StyledButton} {
        align-self: end;
    }
`;

const TodoForm = () => {
    return (
        <StyledForm>
            Mark Todo as completed?
            <StyledButton>Yes!</StyledButton>
        </StyledForm>
    )
};
```

10) Write the rule (https://eslint.org/docs/latest/extend/custom-rule-tutorial)

```js
// rules/styling-non-styled-components-within.js
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Styling an Identifier that is not a styled component will not lead to any style changes",
    },
    schema: [],
  },
  create(context) {
    const identifiersToCheck = [];
    return {
      "TaggedTemplateExpression[tag.object.name='styled'] TemplateLiteral Identifier":
        function (node) {
          if (node.name) identifiersToCheck.push(node);
        },
      "TaggedTemplateExpression[tag.callee.name='styled'] TemplateLiteral Identifier":
        function (node) {
          if (node.name) identifiersToCheck.push(node);
        },
      "Program:exit": function (node) {
        node.body.forEach((node) => {
          node?.declarations?.forEach((declaration) => {
            if (
              declaration.id &&
              !identifiersToCheck
                .map((identifier) => identifier.name)
                .includes(declaration.id.name)
            )
              return;
            if (declaration.init.type === "TaggedTemplateExpression") return;
            context.report({
              node: identifiersToCheck.find(
                (i) => i.name === declaration.id.name
              ),
              message:
                "Don't attempt to style identifiers that are not styled components using interpolation",
            });
          });
        });
      },
    };
  },
};
```

11) Move it back to the local plugin
12) Run the Tests Locally (configure the RuleTester) - `node styling-non-styled-components-within.test.js`

```js
// rules/styling-non-styled-components-within.test.js

RuleTester.setDefaultConfig({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020 },
});
```

13) Configure the local plugin

```js
// rules/index.js
import rule from "./styling-non-styled-components-within.js";

export default {
  meta: {}, // information about the plugin 
  configs: {}, // an object containing named configurations
  rules: {
    "styling-non-styled-components-within": rule,
  }, // an object containing the definitions of custom rules
  processors: {}, // an object containing named processors
};
```
14) Update the config
    
```js
// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";
import local from "./rules/index.js";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  {
    plugins: {
      local,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "local/styling-non-styled-components-within": "warn",
    },
  },
  {
    ignores: [".next/", "node_modules/"],
  },
];
```
15) Run eslint to show the warning `npx eslint **/*.{js,jsx}`
16) Show the CODEOWNERS File
17) Write the report generator
```js
// bin/report-generator.cjs

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

  process.stdout.write(`\nErrors by team:\n`);
  Object.entries(errorsByTeam).forEach(([key, value]) => {
    process.stdout.write(
      `${key}: ${value}\n`
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
      process.stderr.write("\x1b[31m there was an error writing file \x1b[37m");
    } else {
      process.stdout.write(`\x1b[32mReport was successfully generated\n`);
      exec("open report.html");
    }
  });
});

```
18)  ignore the report.html in .gitignore


What do we get?
- inline feedback from eslint if we have the eslint plugin
- CI feedback if we have lint in CI
- individual team feedback from our report