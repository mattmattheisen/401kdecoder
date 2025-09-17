import './globals.css';

export const metadata = {
  title: 'Plan Decoder',
  description: 'Scan a 401(k)/403(b) statement to decode fees & allocation.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-8">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Plan Decoder</h1>
            <a
              href="https://decoderuniverse.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Decoder Universe
            </a>
          </header>
          {children}
          <footer className="mt-12 text-xs text-slate-500">
            <p>For education only. Not investment advice. Accuracy not guaranteed. Verify with your plan documents.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
