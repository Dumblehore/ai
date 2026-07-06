// Statistical scoring mapping based on actual CAT score distributions
// CAT total marks is 198 (66 questions). Our simulator adapts to varying mock question counts.
// We model score percentage (achieved score / max possible score).
export function calculateCatPercentile(score: number, maxScore: number): number {
  if (maxScore <= 0) return 90.0;
  
  const ratio = score / maxScore;

  if (ratio >= 0.65) {
    // 99.7%ile to 99.99%ile
    return +(99.7 + (ratio - 0.65) * 0.85).toFixed(2);
  }
  if (ratio >= 0.45) {
    // 99.0%ile to 99.7%ile
    return +(99.0 + ((ratio - 0.45) / 0.20) * 0.7).toFixed(2);
  }
  if (ratio >= 0.30) {
    // 95.0%ile to 99.0%ile
    return +(95.0 + ((ratio - 0.30) / 0.15) * 4.0).toFixed(2);
  }
  if (ratio >= 0.20) {
    // 90.0%ile to 95.0%ile
    return +(90.0 + ((ratio - 0.20) / 0.10) * 5.0).toFixed(2);
  }
  if (ratio >= 0.10) {
    // 80.0%ile to 90.0%ile
    return +(80.0 + ((ratio - 0.10) / 0.10) * 10.0).toFixed(2);
  }
  
  // Under 80%ile range
  return Math.max(50.0, +(50.0 + (ratio / 0.10) * 30.0).toFixed(2));
}
