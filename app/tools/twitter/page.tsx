import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function TwitterPage() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-sky-500/20 selection:text-sky-600 min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf8ff]/80 backdrop-blur-xl">
        <div className="flex justify-between items-center h-16 px-8 max-w-screen-2xl mx-auto">
          <Link className="text-xl font-black tracking-tighter text-slate-900" href="/">
            Syntactic
          </Link>
          <div className="hidden md:flex space-x-8 items-center font-sans text-sm font-medium tracking-tight">
            <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/#docs">Docs</Link>
            <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/#pricing">Pricing</Link>
          </div>
          <Link href="/" className="bg-surface-container text-on-surface px-4 py-2 rounded-md hover:bg-surface-container-high transition-colors text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
        <div className="bg-slate-100/50 h-[1px] w-full absolute bottom-0"></div>
      </nav>

      <main className="pt-32 pb-16 px-8">
        <div className="max-w-screen-2xl mx-auto text-center mb-16">
          <span className="font-mono text-sky-600 font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-sky-600/10 rounded-full">X Utility</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            Twitter (X) Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Download high-quality videos and GIFs from Twitter (X) directly to your device. Support for multiple resolutions.
          </p>
        </div>

        <UniversalDownloader
          serviceName="Twitter"
          apiEndpoint="/api/twitter"
          placeholder="https://twitter.com/username/status/..."
          accentColor="sky-500"
          icon="twitter"
        />

        {/* Feature Grid */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-sky-500/30 transition-all group">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sky-600">high_quality</span>
            </div>
            <div>
              <h4 className="font-black text-xl mb-2 text-on-surface">HD Video Support</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Always pulls the highest bitrate stream available on X for crisp video quality.</p>
            </div>
          </div>
          <div className="flex gap-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-sky-500/30 transition-all group">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sky-600">gif</span>
            </div>
            <div>
              <h4 className="font-black text-xl mb-2 text-on-surface">GIF Extraction</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Save Twitter GIFs as MP4 files for easy sharing across all messaging apps.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
