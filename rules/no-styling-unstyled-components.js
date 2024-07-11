export default {
  meta: {
    type: "problem",
    fixable: false,
    name: "Dont attempt to style components that are not styled components using interpolation",
    messages: {
      bad: "you cant do this",
    },
  },
  create: function (context) {
    const identifiersToCheck = [];
    return {
      "TaggedTemplateExpression TemplateLiteral Identifier": function (node) {
        if (node.name) identifiersToCheck.push(node);
      },
      "Program:exit": function (node) {
        node.body.forEach((node) => {
          if (node.type !== "VariableDeclaration") return;
          node.declarations.forEach((declaration) => {
            if (
              !identifiersToCheck
                .map((id) => id.name)
                .includes(declaration.id.name)
            )
              return;
            if (declaration.init.type !== "TaggedTemplateExpression") {
              context.report({
                messageId: "bad",
                node: identifiersToCheck.find(
                  (i) => i.name === declaration.id.name
                ),
              });
            }
          });
        });
      },
    };
  },
};
