// Packages are now fetched from the API — no hardcoded array needed.

// Find the package with the lowest price per vote (best value)
export function getBestValueId(packages = []) {
  let best = null;
  let bestRate = Infinity;
  for (const pkg of packages) {
    const rate = pkg.price / pkg.votes;
    if (rate < bestRate) {
      bestRate = rate;
      best = pkg.id;
    }
  }
  return best;
}

// Find the most popular package (middle-high tier)
export const MOST_POPULAR_ID = 5; // 1,000 votes

export const REACTION_TYPES = [
  { id: 'whimsical', label: 'Whimsical', emoji: '🧙‍♂️' },
  { id: 'amaze', label: 'Amaze', emoji: '🤩' },
  { id: 'cool', label: 'Cool', emoji: '😎' },
  { id: 'love', label: 'Love', emoji: '😍' },
];
