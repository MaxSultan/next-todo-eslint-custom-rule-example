ESLINT install

https://eslint.org/docs/latest/use/getting-started

Show the start:
- pages/index.jsx
- components/descructive-action-button.jsx
- CODEOWNERS

1) run `npm init @eslint/config@9.5.0`
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

4) Run the linter

```bash
npx eslint **/*.{js,jsx}
```

5) TDD - Write tests
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
6) Move to AST Parser- https://astexplorer.net/
7) Write the rule (https://eslint.org/docs/latest/extend/custom-rule-tutorial)

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

8) Move it back to the local plugin
9)  Run the Tests Locally (configure the RuleTester) - `node styling-non-styled-components-within.test.js`

```js
// rules/styling-non-styled-components-within.test.js

RuleTester.setDefaultConfig({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020 },
});
```

10) Configure the local plugin

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

11)  Show the CODEOWNERS File
12)  Write the report generator
13)  ignore the report.html in .gitignore


What do we get?
- inline feedback from eslint if we have the eslint plugin
- CI feedback if we have lint in CI
- individual team feedback from our report