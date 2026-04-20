import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function GDrivePage() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-green-600/20 selection:text-green-700 min-h-screen">
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
          <span className="font-mono text-green-700 font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-green-700/10 rounded-full">Drive Utility</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            Google Drive Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Convert Google Drive sharable links into direct download links instantly. No more "Request Access" or preview pages.
          </p>
        </div>

        <UniversalDownloader
          serviceName="Google Drive"
          apiEndpoint="/api/gdrive"
          placeholder="https://drive.google.com/file/d/..."
          accentColor="green-700"
          icon="add_to_drive"
        />

        {/* Feature Highlights */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-green-700/30 transition-all group">
            <div className="w-12 h-12 bg-green-700/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-700 transition-colors">
              <span className="material-symbols-outlined text-green-700 group-hover:text-on-primary transition-colors">link</span>
            </div>
            <div>
              <h4 className="font-black text-xl mb-2 text-on-surface">Direct Link Bypass</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Instantly bypass the Google Drive preview page and start downloading the file directly.</p>
            </div>
          </div>
          <div className="flex gap-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 hover:border-green-700/30 transition-all group">
            <div className="w-12 h-12 bg-green-700/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-700 transition-colors">
              <span className="material-symbols-outlined text-green-700 group-hover:text-on-primary transition-colors">storage</span>
            </div>
            <div>
              <h4 className="font-black text-xl mb-2 text-on-surface">Unlimited Speed</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Uses Google's high-speed global CDN for the fastest possible download experience.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
