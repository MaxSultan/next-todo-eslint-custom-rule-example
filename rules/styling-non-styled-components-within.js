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
