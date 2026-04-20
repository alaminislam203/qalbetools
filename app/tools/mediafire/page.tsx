import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function MediaFirePage() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-blue-600/20 selection:text-blue-700 min-h-screen">
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
          <span className="font-mono text-blue-700 font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-blue-700/10 rounded-full">Cloud Utility</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            MediaFire Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Generate direct download links for MediaFire files instantly. Bypasses ads and redirects for a cleaner experience.
          </p>
        </div>

        <UniversalDownloader
          serviceName="MediaFire"
          apiEndpoint="/api/mediafire"
          placeholder="https://www.mediafire.com/file/..."
          accentColor="blue-700"
          icon="cloud_download"
        />

        {/* Feature Highlights */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-blue-700/30 transition-all group">
            <div className="w-12 h-12 bg-blue-700/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-blue-700">shuttle</span>
            </div>
            <div>
              <h4 className="font-black text-xl mb-2 text-on-surface">Direct Extract</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Pulls the final direct link from MediaFire so you don't have to deal with multiple redirects.</p>
            </div>
          </div>
          <div className="flex gap-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-blue-700/30 transition-all group">
            <div className="w-12 h-12 bg-blue-700/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-blue-700">info</span>
            </div>
            <div>
              <h4 className="font-black text-xl mb-2 text-on-surface">File Metadata</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Shows file size and original naming before you start your download.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
