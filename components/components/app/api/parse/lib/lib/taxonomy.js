// Map common fund name fragments → canonical asset class
const rules = [
  [/target.*\d{4}/i, 'Target Date'],
  [/\b(tdf|retirement fund)\b/i, 'Target Date'],
  [/\b500|total stock|s&p|sp\b|index fund/i, 'US Stock'],
  [/\b(russell|mid cap|small cap|extended market)\b/i, 'US Stock'],
  [/\b(international|intl|eafe|developed ex|emerging)\b/i, 'Intl Stock'],
  [/\b(bond|treasury|aggregate|total bond|credit|tips)\b/i, 'Bonds'],
  [/\b(stable value|money market|cash|capital preservation)\b/i, 'Cash'],
  [/\b(reit|real estate|commodit(y|ies)|natural resources)\b/i, 'Real Assets']
];

export function classifyFund(name, symbol = ''){
  for (const [re, cls] of rules){
    if (re.test(name) || re.test(symbol)) return cls;
  }
  return 'Other';
}
