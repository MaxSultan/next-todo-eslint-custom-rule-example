import { RuleTester } from "eslint";
import fooBarRule from "./styling-non-styled-components-within.js";

RuleTester.setDefaultConfig({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

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
