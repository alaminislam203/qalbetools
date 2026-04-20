import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function TikTokPage() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 selection:text-primary min-h-screen">
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
          <span className="font-mono text-[#000000] font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-black/5 rounded-full">Pro Tool</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            TikTok Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Download TikTok videos without watermark in HD quality instantly. Just paste the link and save.
          </p>
        </div>

        <UniversalDownloader
          serviceName="TikTok"
          apiEndpoint="/api/tiktok"
          placeholder="https://www.tiktok.com/@username/video/..."
          accentColor="slate-900"
          icon="music_note"
        />

        {/* Feature Highlights */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-slate-900 text-4xl mb-4">blur_off</span>
            <h3 className="font-black text-xl mb-3">No Watermark</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Download clean videos without the drifting TikTok logo for professional use.</p>
          </div>
          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-slate-900 text-4xl mb-4">high_quality</span>
            <h3 className="font-black text-xl mb-3">Original Quality</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">We extract the direct source file to ensure you get the best possible resolution.</p>
          </div>
          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-slate-900 text-4xl mb-4">speed</span>
            <h3 className="font-black text-xl mb-3">Instant Fetch</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Our optimized backend processes your request in milliseconds.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
