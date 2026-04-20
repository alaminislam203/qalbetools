import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function PinterestPage() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-red-500/20 selection:text-red-700 min-h-screen">
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
          <span className="font-mono text-red-700 font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-red-700/10 rounded-full">Visual Saver</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            Pinterest Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Download high-resolution images and videos from Pinterest instantly. The best tool for saving your creative inspiration.
          </p>
        </div>

        <UniversalDownloader
          serviceName="Pinterest"
          apiEndpoint="/api/pinterest"
          placeholder="https://pin.it/..."
          accentColor="red-700"
          icon="push_pin"
        />

        {/* Info Grid */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-red-700/30 transition-all">
            <span className="material-symbols-outlined text-red-700 text-4xl mb-4">image</span>
            <h3 className="font-black text-xl mb-3">HD Image Download</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Extract the highest resolution version of any static Pin or infographic.</p>
          </div>
          <div className="text-center p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-red-700/30 transition-all">
            <span className="material-symbols-outlined text-red-700 text-4xl mb-4">videocam</span>
            <h3 className="font-black text-xl mb-3">Video Pin Saver</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Seamlessly download Video Pins in MP4 format without quality loss.</p>
          </div>
          <div className="text-center p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-red-700/30 transition-all">
            <span className="material-symbols-outlined text-red-700 text-4xl mb-4">bolt</span>
            <h3 className="font-black text-xl mb-3">Fast & Reliable</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">No ads, no registration. Just enter the URL and save your content.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
