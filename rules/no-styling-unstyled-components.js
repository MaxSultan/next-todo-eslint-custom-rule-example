export default {
  meta: {
    type: "problem",
    fixable: false,
    name: "Dont attempt to style components that are not styled components using interpolation",
    messages: {
      bad: "applying styles to components that are not styled components in a template literal has no effect",
    },
  },
  create: function (context) {
    const identifiersInStyledTemplateLiterals = [];
    const findIdentifier = (name) =>
      identifiersInStyledTemplateLiterals.find((i) => i.name === name);
    return {
      "TaggedTemplateExpression TemplateLiteral Identifier": function (node) {
        if (node.name) identifiersInStyledTemplateLiterals.push(node);
      },
      "Program:exit": function (node) {
        node.body.forEach((node) => {
          if (node.type !== "VariableDeclaration") return;
          node.declarations.forEach((declaration) => {
            if (
              !identifiersInStyledTemplateLiterals
                .map((id) => id.name)
                .includes(declaration.id.name)
            )
              return;
            if (declaration.init.type !== "TaggedTemplateExpression") {
              context.report({
                messageId: "bad",
                node: findIdentifier(declaration.id.name),
              });
            }
          });
        });
      },
    };
  },
};
