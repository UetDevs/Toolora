import { dump, load } from "js-yaml";

export function parseCsv(text: string) {
  const rows = parseCsvRows(text);
  if (!rows.length) return [];
  const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? "";
      });
      return record;
    });
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const source = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

export function jsonToCsv(value: unknown) {
  const rows = Array.isArray(value) ? value : [value];
  if (!rows.length) return "";
  const objects: Record<string, unknown>[] = rows.map((row) =>
    row && typeof row === "object" && !Array.isArray(row)
      ? (row as Record<string, unknown>)
      : { value: row },
  );
  const headers: string[] = [];
  for (const object of objects) {
    for (const key of Object.keys(object)) {
      if (!headers.includes(key)) headers.push(key);
    }
  }
  const escape = (cell: unknown) => {
    const text = cell == null ? "" : typeof cell === "object" ? JSON.stringify(cell) : String(cell);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(","), ...objects.map((object) => headers.map((header) => escape(object[header])).join(","))].join("\n");
}

export function xmlToJson(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const error = document.querySelector("parsererror");
  if (error) throw new Error(error.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML");
  if (!document.documentElement) throw new Error("Invalid XML");
  return elementToJson(document.documentElement);
}

function elementToJson(node: Element): unknown {
  const result: Record<string, unknown> = {};
  for (const attr of Array.from(node.attributes)) {
    result[`@${attr.name}`] = attr.value;
  }
  const children = Array.from(node.childNodes);
  const elements = children.filter((child): child is Element => child.nodeType === 1);
  const texts = children
    .filter((child) => child.nodeType === 3)
    .map((child) => child.textContent?.trim() ?? "")
    .filter(Boolean);

  if (!elements.length) {
    const text = texts.join(" ") || node.textContent?.trim() || "";
    if (!Object.keys(result).length) return text;
    if (text) result["#text"] = text;
    return result;
  }

  const grouped: Record<string, unknown[]> = {};
  for (const element of elements) {
    const name = element.tagName;
    grouped[name] ??= [];
    grouped[name].push(elementToJson(element));
  }
  for (const [name, items] of Object.entries(grouped)) {
    result[name] = items.length === 1 ? items[0] : items;
  }
  return result;
}

export function formatXml(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const error = document.querySelector("parsererror");
  if (error) throw new Error(error.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML");
  if (!document.documentElement) throw new Error("Invalid XML");
  return serializeXml(document.documentElement, 0);
}

function serializeXml(element: Element, depth: number): string {
  const pad = "  ".repeat(depth);
  const attrs = Array.from(element.attributes)
    .map((attr) => ` ${attr.name}="${escapeXml(attr.value)}"`)
    .join("");
  const children = Array.from(element.childNodes);
  const elements = children.filter((child): child is Element => child.nodeType === 1);
  const text = children
    .filter((child) => child.nodeType === 3)
    .map((child) => child.textContent ?? "")
    .join("")
    .trim();

  if (!elements.length) {
    return text
      ? `${pad}<${element.tagName}${attrs}>${escapeXml(text)}</${element.tagName}>`
      : `${pad}<${element.tagName}${attrs}/>`;
  }

  const inner = elements.map((child) => serializeXml(child, depth + 1)).join("\n");
  return `${pad}<${element.tagName}${attrs}>\n${inner}\n${pad}</${element.tagName}>`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function yamlToValue(text: string) {
  return load(text);
}

export function valueToYaml(value: unknown) {
  return dump(value, { lineWidth: 100, noRefs: true });
}
