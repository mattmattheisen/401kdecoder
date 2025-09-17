'use client';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Results({ data }){
  const { meta, fees, holdings, allocation, flags } = data;

  const pieData = {
    labels: Object.keys(allocation),
    datasets: [{ data: Object.values(allocation) }]
  };

  function downloadPDF(){
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Plan Decoder Report', 14, 18);
    doc.setFontSize(11);
    doc.text(`Account Value: $${meta.accountValue.toLocaleString()}`, 14, 28);
    doc.text(`Blended Expense Ratio: ${fees.blendedER.toFixed(2)}%`, 14, 36);
    doc.text(`Admin Fee: ${fees.adminFeePct.toFixed(2)}%  ($${fees.adminFeeDollar.toFixed(2)})`, 14, 44);
    doc.text(`Estimated Annual Cost: $${fees.annualCostDollar.toFixed(2)}`, 14, 52);
    doc.text('Top Holdings:', 14, 64);
    let y = 72;
    holdings.slice(0,10).forEach(h=>{
      doc.text(`• ${h.name} — ${h.weight.toFixed(2)}% (ER ${(h.er ?? 0).toFixed(2)}%)`, 16, y);
      y+=8;
    });
    doc.save('plan-decoder-report.pdf');
  }

  function downloadCSV(){
    const header = 'Name,Symbol,Weight %,Expense Ratio %,Category\n';
    const rows = holdings.map(h=>[
      '"' + h.name.replaceAll('"','""') + '"',
      h.symbol||'',
      h.weight.toFixed(2),
      (h.er||0).toFixed(2),
      h.category
    ].join(','));
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'holdings.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid md:grid-cols-3 gap-6">
      <div className="card p-6 md:col-span-2 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="text-sm text-slate-400">Decoded from your statement</p>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={downloadPDF}>Download PDF</button>
            <button className="btn" onClick={downloadCSV}>CSV</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Metric label="Account Value" value={`$${meta.accountValue.toLocaleString()}`} />
          <Metric label="Est. Annual Cost" value={`$${fees.annualCostDollar.toFixed(0)}`} sub={`${fees.totalCostPct.toFixed(2)}% of assets`} />
          <Metric label="Blended Expense Ratio" value={`${fees.blendedER.toFixed(2)}%`} />
          <Metric label="Admin Fee" value={`${fees.adminFeePct.toFixed(2)}%`} sub={`$${fees.adminFeeDollar.toFixed(0)}`} />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Flags</h4>
          {(!flags || flags.length === 0)
            ? <p className="text-slate-400 text-sm">No major issues detected.</p>
            : <ul className="list-disc pl-5 space-y-1 text-sm">{flags.map((f,i)=> <li key={i}>{f}</li>)}</ul>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-300">
              <tr className="border-b border-slate-800">
                <th className="text-left py-2">Holding</th>
                <th className="text-right">Weight %</th>
                <th className="text-right">ER %</th>
                <th className="text-right">$ Cost</th>
                <th className="text-right">Class</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h,i)=> (
                <tr key={i} className="border-b border-slate-800/60">
                  <td className="py-2 pr-2">{h.name}</td>
                  <td className="text-right">{h.weight.toFixed(2)}</td>
                  <td className="text-right">{(h.er||0).toFixed(2)}</td>
                  <td className="text-right">
                    ${(((h.er||0)/100) * meta.accountValue * (h.weight/100)).toFixed(0)}
                  </td>
                  <td className="text-right">{h.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold">Allocation</h3>
        <Pie data={pieData} />
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(allocation).map(([k,v])=> (
            <div key={k} className="flex items-center justify-between">
              <span className="text-slate-300">{k}</span>
              <span>{v.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({label, value, sub}){
  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
