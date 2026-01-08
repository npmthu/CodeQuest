/**
 * Utility functions for formatting test case input/output in a more readable way
 * Instead of showing raw JSON, display it as clean parameter assignments
 */

/**
 * Format a test case input object as readable parameter assignments
 * Example: { "nums": [2, 7, 11, 15], "target": 9 } becomes:
 *   nums = [2, 7, 11, 15]
 *   target = 9
 */
export function formatTestCaseInput(input: any): string {
  if (input === null || input === undefined) {
    return '(empty)';
  }

  // If it's a primitive, just return it as string
  if (typeof input !== 'object') {
    return formatValue(input);
  }

  // If it's an array at top level, format as single value
  if (Array.isArray(input)) {
    return formatValue(input);
  }

  // For objects, format as parameter assignments
  const entries = Object.entries(input);
  if (entries.length === 0) {
    return '(empty)';
  }

  return entries
    .map(([key, value]) => `${key} = ${formatValue(value)}`)
    .join('\n');
}

/**
 * Format a test case output value in a readable way
 */
export function formatTestCaseOutput(output: any): string {
  if (output === null || output === undefined) {
    return '(empty)';
  }
  return formatValue(output);
}

/**
 * Format a value for display - handles arrays, objects, and primitives
 */
function formatValue(value: any): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }

  // Strings should be shown with quotes
  if (typeof value === 'string') {
    return `"${value}"`;
  }

  // Booleans and numbers as-is
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  // Arrays - format inline if short, or multi-line if long
  if (Array.isArray(value)) {
    return formatArray(value);
  }

  // Objects (non-array) - format as JSON-like but cleaner
  if (typeof value === 'object') {
    return formatObject(value);
  }

  return String(value);
}

/**
 * Format an array - compact if small, multi-line if large
 */
function formatArray(arr: any[]): string {
  if (arr.length === 0) {
    return '[]';
  }

  // For nested arrays (2D arrays), format nicely
  if (arr.length > 0 && Array.isArray(arr[0])) {
    const innerArrays = arr.map(inner => 
      Array.isArray(inner) ? `  [${inner.map(v => formatPrimitive(v)).join(', ')}]` : `  ${formatValue(inner)}`
    );
    return `[\n${innerArrays.join(',\n')}\n]`;
  }

  // For simple arrays, check length
  const simpleFormat = `[${arr.map(v => formatPrimitive(v)).join(', ')}]`;
  
  // If the simple format is short enough (< 60 chars), use it
  if (simpleFormat.length < 60) {
    return simpleFormat;
  }

  // Otherwise, format each element on its own line
  const elements = arr.map(v => `  ${formatPrimitive(v)}`);
  return `[\n${elements.join(',\n')}\n]`;
}

/**
 * Format an object with key-value pairs
 */
function formatObject(obj: Record<string, any>): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  // For simple objects, try inline
  const simpleFormat = `{ ${entries.map(([k, v]) => `${k}: ${formatPrimitive(v)}`).join(', ')} }`;
  if (simpleFormat.length < 60) {
    return simpleFormat;
  }

  // Otherwise multi-line
  const lines = entries.map(([k, v]) => `  ${k}: ${formatValue(v)}`);
  return `{\n${lines.join(',\n')}\n}`;
}

/**
 * Format a primitive value (used for inline formatting)
 */
function formatPrimitive(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    // For nested arrays in inline format, keep them compact
    return `[${value.map(v => formatPrimitive(v)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    return `{ ${entries.map(([k, v]) => `${k}: ${formatPrimitive(v)}`).join(', ')} }`;
  }
  return String(value);
}

/**
 * Format problem I/O schema for display (simplified view)
 * Instead of showing full JSON schema, show parameter list with types
 */
export function formatProblemIOInput(io: any): string {
  if (!io || !io.params) {
    return '(no parameters defined)';
  }

  const params = io.params;
  if (!Array.isArray(params) || params.length === 0) {
    return '(no parameters defined)';
  }

  return params.map((param: any) => {
    const typeStr = formatTypeString(param);
    const constraintStr = formatConstraints(param.constraints);
    return `${param.name}: ${typeStr}${constraintStr ? ` ${constraintStr}` : ''}`;
  }).join('\n');
}

/**
 * Format problem I/O output schema for display
 */
export function formatProblemIOOutput(io: any): string {
  if (!io) {
    return '(no output defined)';
  }

  const typeStr = formatTypeString(io);
  const constraintStr = formatConstraints(io.constraints);
  const comparator = io.comparator ? `(${io.comparator} comparison)` : '';
  
  return `${typeStr}${constraintStr ? ` ${constraintStr}` : ''} ${comparator}`.trim();
}

/**
 * Format type string from IO parameter
 */
function formatTypeString(param: any): string {
  if (!param.type) return 'any';

  if (param.type === 'array') {
    const elementType = param.element_type || 'any';
    return `${elementType}[]`;
  }

  return param.type;
}

/**
 * Format constraints in a readable way
 */
function formatConstraints(constraints: any): string {
  if (!constraints) return '';

  const parts: string[] = [];

  if (constraints.min_length !== undefined && constraints.max_length !== undefined) {
    parts.push(`length: ${constraints.min_length}-${constraints.max_length}`);
  } else if (constraints.min_length !== undefined) {
    parts.push(`min length: ${constraints.min_length}`);
  } else if (constraints.max_length !== undefined) {
    parts.push(`max length: ${constraints.max_length}`);
  } else if (constraints.length !== undefined) {
    parts.push(`length: ${constraints.length}`);
  }

  if (constraints.value_range) {
    const [min, max] = constraints.value_range;
    parts.push(`range: [${min}, ${max}]`);
  }

  if (parts.length === 0) return '';
  return `(${parts.join(', ')})`;
}
