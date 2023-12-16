const parser = require("luaparse");
const fs = require("fs");
const path = require("path");
const parserOptions = {
  encodingMode: "pseudo-latin1",
  luaVersion: "5.4",
  comments: true,
};

const desiredKeys = new Set([
  "name",
  "tag",
  "size",
  "attachment_size",
  "args",
  "exec_arg",
  "category",
]);

for (let i = 2; i < process.argv.length; i++) {
  const file = process.argv[i];
  const contents = fs.readFileSync(file, { encoding: "latin1" });
  const ast = parser.parse(contents, parserOptions);
  const data = {};
  for (const stmt of ast.body) {
    if (stmt.type === "AssignmentStatement") {
      extractAssignment(stmt, data);
    } else if (stmt.type === "CallStatement") {
      extractCall(stmt.expression, data);
    }
  }

  const outfilename = path.basename(file, ".lua") + ".json";
  fs.writeFileSync(outfilename, JSON.stringify(data, null, 2));
}

function extractAssignment(stmt, data) {
  if (stmt.variables.length != 1 || stmt.init.length != 1) {
    return;
  }
  const v = stmt.variables[0];
  if (v.type != "MemberExpression") return;
  const id = v.identifier.name;
  if (v.base.type != "MemberExpression") return;
  const collection = v.base.identifier.name;
  if (v.base.base.type != "Identifier" || v.base.base.name != "data") return;
  if (stmt.init[0].type !== "TableConstructorExpression") return;
  data[collection] ||= {};
  data[collection][id] = {};
  extractTable(
    data[collection][id],
    stmt.init[0],
    collection === "instructions"
  );
}

function extractTable(data, table, includeDesc) {
  for (const field of table.fields) {
    if (field.type === "TableKeyString") {
      const key = field.key.name;
      let value;
      if (
        field.value.type == "StringLiteral" ||
        field.value.type == "NumericLiteral" ||
        field.value.type == "BooleanLiteral" ||
        field.value.type == "NilLiteral"
      ) {
        value = field.value.value;
      } else if (field.value.type == "TableConstructorExpression") {
        value = parseArray(field.value);
      }
      if (desiredKeys.has(key) || (includeDesc && key == "desc")) {
        if (value !== undefined) {
          data[key] = value;
        }
      }
    }
  }
}

function extractCall(stmt, data) {
  if (stmt.type != "CallExpression") return;
  if (stmt.base.type != "MemberExpression") return;
  if (stmt.base.indexer !== ":") return;
  const match = stmt.base.identifier.name.match(/^Register(\w+)$/);
  if (!match) return;
  const collection = match[1].toLowerCase() + "s";
  if (stmt.arguments.length < 2) return;
  if (stmt.arguments[0].type != "StringLiteral") return;
  if (stmt.arguments[1].type != "TableConstructorExpression") return;
  const id = stmt.arguments[0].value;
  data[collection] ||= {};
  data[collection][id] = {};
  extractTable(data[collection][id], stmt.arguments[1]);
}

function parseArray(table) {
  if (table.fields.some((field) => field.type !== "TableValue")) {
    return;
  }
  try {
    return table.fields.map((field) => {
      if (
        field.value.type == "StringLiteral" ||
        field.value.type == "NumericLiteral" ||
        field.value.type == "BooleanLiteral" ||
        field.value.type == "NilLiteral"
      ) {
        return field.value.value;
      } else if (field.value.type == "TableConstructorExpression") {
        return parseArray(field.value);
      }
      throw new Error("Unsupported type: " + field.value.type);
    });
  } catch (e) {}
}

// special instructions:
// count_item
// call
// count_slots
// dodrop
// notify
// build
// produce
// set_signpost
