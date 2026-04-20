import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function YouTubePage() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-red-500/20 selection:text-red-600 min-h-screen">
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
          <span className="font-mono text-red-600 font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-red-600/10 rounded-full">Stream Utility</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            YouTube Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Convert and download YouTube videos to MP4 or MP3 in high quality. Fast, free, and secure.
          </p>
        </div>

        <UniversalDownloader
          serviceName="YouTube"
          apiEndpoint="/api/youtube"
          placeholder="https://www.youtube.com/watch?v=..."
          accentColor="red-600"
          icon="video_library"
        />

        {/* Info Grid */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-red-600/30 transition-all group">
            <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-red-600">movie</span>
            </div>
            <h4 className="font-bold mb-2">Video (MP4)</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Download videos in various resolutions from 360p to 1080p Full HD.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-red-600/30 transition-all group">
            <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-red-600">music_note</span>
            </div>
            <h4 className="font-bold mb-2">Audio (MP3)</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Extract crystal clear audio from any video and save it as a high-bitrate MP3.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-red-600/30 transition-all group">
            <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-red-600">timer</span>
            </div>
            <h4 className="font-bold mb-2">No Waiting</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">No unnecessary queues or wait times. Your download starts immediately.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-red-600/30 transition-all group">
            <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-red-600">security</span>
            </div>
            <h4 className="font-bold mb-2">Safe & Private</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">We don't log your requests. Your privacy and device security are our priority.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
