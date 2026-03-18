/**
 * Escape a single CSV field value according to RFC 4180:
 * - If the value contains commas, double quotes, or newlines, wrap it in double quotes.
 * - Any existing double quotes within the value are escaped by doubling them.
 */
function escapeField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = Array.isArray(value) ? value.join("; ") : String(value);

  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export interface CsvColumn {
  key: string;
  header: string;
}

/**
 * Convert an array of response data objects to a CSV string.
 *
 * @param columns - Column definitions with key (field accessor) and header (display name).
 * @param rows - Array of row objects where each object maps column keys to values.
 * @returns A complete CSV string with header row and data rows.
 */
export function toCsv(columns: CsvColumn[], rows: Record<string, unknown>[]): string {
  const headerRow = columns.map((col) => escapeField(col.header)).join(",");

  const dataRows = rows.map((row) =>
    columns.map((col) => escapeField(row[col.key])).join(",")
  );

  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Convert form response data into a flat CSV export.
 * Each row is one response; columns are the question titles plus metadata.
 *
 * @param questions - Array of objects with id and title for each question.
 * @param responses - Array of response objects, each containing an answers map keyed by question_id.
 * @returns A CSV string ready for download.
 */
export function responsesToCsv(
  questions: { id: string; title: string }[],
  responses: {
    id: string;
    completed_at?: string | null;
    started_at: string;
    answers: Record<string, unknown>;
  }[]
): string {
  const columns: CsvColumn[] = [
    { key: "_response_id", header: "Response ID" },
    { key: "_started_at", header: "Started At" },
    { key: "_completed_at", header: "Completed At" },
    ...questions.map((q) => ({ key: q.id, header: q.title })),
  ];

  const rows = responses.map((response) => {
    const row: Record<string, unknown> = {
      _response_id: response.id,
      _started_at: response.started_at,
      _completed_at: response.completed_at ?? "",
    };
    for (const question of questions) {
      row[question.id] = response.answers[question.id] ?? "";
    }
    return row;
  });

  return toCsv(columns, rows);
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
