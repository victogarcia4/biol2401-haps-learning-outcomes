/**
 * CSV Parser Module
 * Parses CSV files with support for quoted fields containing commas
 */

/**
 * Parse a single CSV line, handling quoted fields with commas
 * @param {string} line - A single line from the CSV file
 * @returns {string[]} Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote (two quotes in a row)
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (only when not in quotes)
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Parse a CSV file into an array of objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array<Object>>} Array of objects with headers as keys
 */
export async function parseCSV(filePath) {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split(/\r?\n/); // Handle both Unix and Windows line endings

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and copyright notice
      if (!line || line.startsWith('©') || line.startsWith('#')) {
        continue;
      }

      const values = parseCSVLine(line);

      // Create object from headers and values
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

/**
 * Filter CSV data by a specific field value
 * @param {Array<Object>} data - Parsed CSV data
 * @param {string} field - Field name to filter by
 * @param {*} value - Value to match
 * @returns {Array<Object>} Filtered data
 */
export function filterByField(data, field, value) {
  return data.filter(row => row[field] === value);
}

/**
 * Group CSV data by a specific field
 * @param {Array<Object>} data - Parsed CSV data
 * @param {string} field - Field name to group by
 * @returns {Object} Object with field values as keys and arrays of rows as values
 */
export function groupByField(data, field) {
  const grouped = {};

  data.forEach(row => {
    const key = row[field];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  return grouped;
}
