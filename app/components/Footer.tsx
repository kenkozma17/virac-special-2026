export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white px-6 py-[100px] text-slate-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-4">
              <h2 className="footer-title sm:text-2xl text-lg font-semibold text-slate-900">Virac Special</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Pages</p>
              <ul className="space-y-2 text-base text-slate-700">
                <li>
                  <a href="/" className="transition hover:text-slate-900">Home</a>
                </li>
                <li>
                  <a href="/stories" className="transition hover:text-slate-900">Stories</a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Legal</p>
              <p className="text-base leading-7 text-slate-700">© 2026 Virac Special. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-500">Virac Special: A Curated Editorial Archive</p>
        </div>
      </div>
    </footer>
  );
}
