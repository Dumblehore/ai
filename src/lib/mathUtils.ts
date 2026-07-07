/**
 * mathUtils.ts
 * Utility to preprocess plain-text mathematical notations (like 2^x, x^2, >=, etc.)
 * into standard LaTeX equations so they render beautifully as superscripts/symbols via KaTeX.
 *
 * NOTE on JS regex replacement strings:
 *   $$ → literal "$"
 *   $1 → capture group 1
 *   So to output "$<group1>^{<group2>}$" we need the replacement string: '$$$1^{$2}$'
 *     ^^  ^^  = "$" (escaped dollar)
 *       ^^    = capture group 1
 *                     ^^  = capture group 2
 *                           ^  = trailing literal "$"
 */

export function preprocessLaTeX(text: string | null | undefined): string {
  if (!text) return '';

  let formatted = text;

  // Skip text that already contains LaTeX delimiters
  if (formatted.includes('$') || formatted.includes('\\(') || formatted.includes('\\[')) {
    return formatted;
  }

  // 1. Handle bracketed negative exponents first: e.g. 2^(-x) -> $2^{-x}$
  formatted = formatted.replace(/([0-9a-zA-Z\(\)]+)\^\(([^)]+)\)/g, '$$$1^{$2}$');

  // 2. Handle plain exponents: e.g. 2^x -> $2^{x}$, x^2 -> $x^{2}$
  formatted = formatted.replace(/([0-9a-zA-Z\(\)]+)\^([0-9a-zA-Z\-]+)/g, '$$$1^{$2}$');

  // 3. Convert comparison symbols to LaTeX
  formatted = formatted.replace(/\s*>=\s*/g, ' $\\ge$ ');
  formatted = formatted.replace(/\s*<=\s*/g, ' $\\le$ ');
  formatted = formatted.replace(/\s*!=\s*/g, ' $\\ne$ ');

  return formatted;
}
