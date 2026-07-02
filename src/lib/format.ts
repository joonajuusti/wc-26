type Values = Record<string, string | number>;

export function t(template: string) {
  return {
    format(values: Values = {}) {
      return parseSegment(template, values, null);
    },
  };
}

function parseSegment(
  text: string,
  values: Values,
  currentNumber: number | null,
): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "{") {
      const { content, end } = readBraced(text, i);
      result += resolveArgument(content, values);
      i = end + 1;
    } else if (ch === "#" && currentNumber !== null) {
      result += String(currentNumber);
      i++;
    } else {
      result += ch;
      i++;
    }
  }
  return result;
}

function readBraced(text: string, start: number): {
  content: string;
  end: number;
} {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        return { content: text.slice(start + 1, i), end: i };
      }
    }
  }
  throw new Error("Unbalanced braces in message");
}

function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function resolveArgument(
  arg: string,
  values: Values,
): string {
  const parts = splitTopLevel(arg);
  const name = parts[0].trim();
  if (parts.length === 1) {
    const v = values[name];
    return v === undefined ? "" : String(v);
  }
  const type = parts[1].trim();
  if (type !== "plural") {
    throw new Error(`Unsupported message type: ${type}`);
  }
  const n = Number(values[name]);
  const branches = parsePluralBranches(parts.slice(2).join(","));
  const keyword = n === 1 ? "one" : "other";
  const body = branches[keyword] ?? branches.other ?? "";
  return parseSegment(body, values, n);
}

function parsePluralBranches(spec: string): Record<string, string> {
  const branches: Record<string, string> = {};
  let i = 0;
  while (i < spec.length) {
    while (i < spec.length && /\s/.test(spec[i])) i++;
    if (i >= spec.length) break;
    let kw = "";
    while (i < spec.length && /[a-zA-Z=]/.test(spec[i])) {
      kw += spec[i];
      i++;
    }
    while (i < spec.length && /\s/.test(spec[i])) i++;
    if (spec[i] !== "{") break;
    const { content, end } = readBraced(spec, i);
    branches[kw] = content;
    i = end + 1;
  }
  return branches;
}
