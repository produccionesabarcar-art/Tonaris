const RANKS = [
  { name: 'Oyente', minMastered: 0 },
  { name: 'Escuchador', minMastered: 1 },
  { name: 'Afinador', minMastered: 3 },
  { name: 'Armonista', minMastered: 5 },
  { name: 'Arquitecto Tonal', minMastered: 7 },
  { name: 'Oído Absoluto', minMastered: 10 },
];

function getRankFromMasteredCount(count) {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (count >= r.minMastered) {
      rank = r.name;
    }
  }
  return rank;
}

module.exports = { RANKS, getRankFromMasteredCount };
