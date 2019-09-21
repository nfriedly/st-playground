const INT_MAX = Math.pow(2, 20) - 1;
const INT_MIN = 0;
function runOperations(S) {
  const stack = [];
  const operations = S.split(" ");
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const intOp = parseInt(op, 10);
    if (!isNaN(intOp)) {
      stack.push(intOp);
    } else if (op === "POP" && stack.length >= 1) {
      stack.pop();
    } else if (op === "DUP" && stack.length >= 1) {
      stack.push(stack[stack.length - 1]);
    } else if (op === "+" && stack.length >= 2) {
      const a = stack.pop();
      const b = stack.pop();
      const result = a + b;
      if (result > INT_MAX) {
        return -1;
      }
      stack.push(result);
    } else if (op === "-" && stack.length >= 2) {
      const a = stack.pop();
      const b = stack.pop();
      const result = a - b;
      if (result < INT_MIN) {
        return -1;
      }
      stack.push(result);
    } else {
      return -1;
    }
  }
  if (stack.length) {
    return stack.pop();
  }
  return -1;
}

function runOperationsSwitch(S) {
  const stack = [];
  const operations = S.split(" ");
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const intOp = parseInt(op, 10);
    switch (true) {
      case !isNaN(intOp):
        stack.push(intOp);
        break;
      case op === "POP" && stack.length >= 1:
        stack.pop();
        break;
      case op === "DUP" && stack.length >= 1:
        stack.push(stack[stack.length - 1]);
        break;
      case op === "+" && stack.length >= 2:
        {
          const a = stack.pop();
          const b = stack.pop();
          const result = a + b;
          if (result > INT_MAX) {
            return -1;
          }
          stack.push(result);
        }
        break;
      case op === "-" && stack.length >= 2:
        {
          const a = stack.pop();
          const b = stack.pop();
          const result = a - b;
          if (result < INT_MIN) {
            return -1;
          }
          stack.push(result);
        }
        break;
      default:
        return -1;
    }
  }
  if (stack.length) {
    return stack.pop();
  }
  return -1;
}

describe.each([
  ["original, correct", runOperations],
  ["switch version", runOperationsSwitch]
])("%s", (name, runOperations) => {
  test.each([
    ["", -1],
    ["13 DUP 4 POP 5 DUP + DUP + -", 7],
    ["5 6 + -", -1],
    ["3 DUP 5 - -", -2]
  ])("input: %s, expected: %i", () => {
    expect(runOperations("")).toBe(-1);
  });
});
