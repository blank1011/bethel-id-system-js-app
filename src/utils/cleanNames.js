/**
 * Clean a parent name:
 *  - Remove titles (Mr., Mrs., Ms., Dr., Prof., etc.)
 *  - Extract FIRST NAME only
 *  - Trim whitespace
 *
 * @param {string} name - Raw parent name
 * @returns {string} Cleaned first name, or empty string
 */
export function cleanParentName(name) {
  if (!name || typeof name !== 'string') return '';

  let cleaned = name.trim();

  // Remove common titles at the start (case-insensitive)
  const titles = /^(mr\.?|mrs\.?|ms\.?|miss|dr\.?|prof\.?|sir|madam|engr\.?|atty\.?|hon\.?|gov\.?|mayor|dra\.?|ing\.?|arch\.?|advoc\.?)\s+/i;
  cleaned = cleaned.replace(titles, '').trim();

  // Extract FIRST NAME ONLY (first word)
  const words = cleaned.split(/\s+/);
  const firstName = words[0];

  return firstName || '';
}

/**
 * Process parent names array, cleaning each and filtering out empty values.
 * @param {Array<string>} names - Array like [fatherName, motherName]
 * @returns {Array<string>} Cleaned, non-empty first names
 */
export function cleanParentNames(names) {
  return names
    .map(cleanParentName)
    .filter(n => n.length > 0);
}
