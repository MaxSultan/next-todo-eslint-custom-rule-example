export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Styling an Identifier that is not a styled component will not lead to any style changes",
    },
    schema: [],
    messages: {
      wrong:
        "Don't attempt to style identifiers that are not styled components using interpolation",
    },
  },

  create(context) {
    const identifierWithinTemplate = [];
    const findIdentifierWithinTemplateByName = (name) =>
      identifierWithinTemplate.find((i) => i.name === name);
    return {
      "TaggedTemplateExpression[tag.object.name='styled'] TemplateLiteral Identifier":
        function (node) {
          if (node.name) identifierWithinTemplate.push(node);
        },
      "TaggedTemplateExpression[tag.callee.name='styled'] TemplateLiteral Identifier":
        function (node) {
          if (node.name) identifierWithinTemplate.push(node);
        },
      "Program:exit": function (node) {
        node.body.forEach((node) => {
          if (node.type !== "VariableDeclaration") return;
          node.declarations.forEach((declaration) => {
            if (
              !identifierWithinTemplate
                .map((id) => id.name)
                .includes(declaration.id.name)
            )
              return;
            if (declaration.init.type !== "TaggedTemplateExpression") {
              context.report({
                node: findIdentifierWithinTemplateByName(declaration.id.name),
                messageId: "wrong",
              });
            }
          });
        });
      },
    };
  },
};
