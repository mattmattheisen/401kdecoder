import { classifyFund } from './taxonomy';

// Heuristic parser for common 401k/403b layouts (Vanguard/Fidelity/TIAA/Empower/etc.)
export function parseStatement(text){
  const cleaned = (text || '').replace(/\s+/g,' ').trim();

  // Account value
  const valueMatch = cleaned.match(/(account|total) (value|balance)[^$]*\$([\d,]+\.?\d*)/i);
  const accountValue = valueMatch ? Number(valueMatch[3].replace(/,/g,'')) : 50000;

  // Holdings like: "Vanguard 500 Index Admiral (VFIAX) 25.00% ER 0.04%"
  const holdingRegex = /([A-Za-z][A-Za-z0-9&,.\- ]+?)\s*(\(([A-Z]{2,6})\))?\s*(\d{1,3}\.\d{2})%\s*(?:ER\s*(\d{1,2}\.\d{2})%)?/g;
  const holdings = [];
  let m;
  while ((m = holdingRegex.exec(cleaned)) !== null){
    const name = m[1].trim();
    const symbol = m[3] || '';
    const weight = parseFloat(m[4]);
    const er = m[5] ? parseFloat(m[5]) : inferER(name);
    holdings.push({ name, symbol, weight, er, category: classifyFund(name, symbol) });
  }

  // Admin / plan-level fee
  const adminPctMatch = cleaned.match(/(recordkeeping|admin|plan|advisory) fee[^%]*?(\d{1,2}\.\d{2})%/i);
  const adminFeePct = adminPctMatch ? parseFloat(adminPctMatch[2]) : 0.25; // default 0.25%
  const adminFeeDollar = accountValue * (adminFeePct/100);

  // Compute blended ER & allocation buckets
  let blendedER = 0;
  const allocation = { 'US Stock': 0, 'Intl Stock': 0, 'Bonds': 0, 'Cash': 0, 'Real Assets': 0, 'Target Date': 0, 'Other': 0 };
  holdings.forEach(h=>{
    blendedER += (h.er || 0) * (h.weight/100);
    allocation[h.category] = (allocation[h.category] || 0) + h.weight;
  });

  // Flags
  const flags = [];
  const cash = (allocation['Cash'] || 0);
  if (cash > 10) flags.push(`High cash balance detected (${cash.toFixed(1)}%). Consider deploying idle cash.`);
  const expensive = holdings.filter(h => (h.er || 0) > 0.75);
  if (expensive.length) flags.push(`${expensive.length} high-fee fund(s) over 0.75% ER.`);
  if ((allocation['Target Date'] || 0) > 50 && holdings.length > 3) {
    flags.push('Target-date fund overlap with other holdings. Consider simplification.');
  }

  const totalCostPct = blendedER + adminFeePct;
  const annualCostDollar = accountValue * (totalCostPct/100);

  return {
    meta: { accountValue },
    fees: { blendedER, adminFeePct, adminFeeDollar, totalCostPct, annualCostDollar },
    holdings,
    allocation,
    flags
  };
}

function inferER(name){
  const n = (name || '').toLowerCase();
  if (/(index|collective trust|instl idx|sv fund)/.test(n)) return 0.05;
  if (/(target|retirement)/.test(n)) return 0.35;
  if (/(bond|treasury|aggregate)/.test(n)) return 0.10;
  if (/(growth|value|cap|international|emerging|real estate|reit)/.test(n)) return 0.45;
  if (/(annuity|subaccount|separate account)/.test(n)) return 1.10;
  return 0.40;
}
