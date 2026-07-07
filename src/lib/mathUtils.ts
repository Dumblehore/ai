/**
 * mathUtils.ts
 * Utility to preprocess plain-text mathematical notations (like 2^x, x^2, >=, etc.)
 * into standard LaTeX equations so they render beautifully as superscripts/symbols via KaTeX.
 */

export function preprocessLaTeX(text: string | null | undefined): string {
  if (!text) return '';

  let formatted = text;

  // 1. Convert simple exponents (e.g. 2^x, x^2, 2^(-x)) to LaTeX style inline math $base^{exponent}$
  // Handle bracketed negative exponents first: e.g. 2^(-x) -> $2^{-x}$
  formatted = formatted.replace(/([0-9a-zA-Z\(\)]+)\^\(([^)]+)\)/g, '$$1^{$2}$');
  // Handle plain exponents: e.g. 2^x -> $2^{x}$, x^2 -> $x^{2}$
  formatted = formatted.replace(/([0-9a-zA-Z\(\)]+)\^([0-9a-zA-Z\-]+)/g, '$$1^{$2}$');

  // 2. Convert standard math comparisons/symbols to LaTeX symbols inside $...$
  // E.g. >= -> $\ge$, <= -> $\le$, != -> $\ne$
  formatted = formatted.replace(/\s*>=\s*/g, ' $\\ge$ ');
  formatted = formatted.replace(/\s*<=\s*/g, ' $\\le$ ');
  formatted = formatted.replace(/\s*!=\s*/g, ' $\\ne$ ');

  return formatted;
}
