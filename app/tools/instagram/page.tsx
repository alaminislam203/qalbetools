import UniversalDownloader from "@/components/UniversalDownloader";
import Link from "next/link";

export default function InstagramPage() {
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
          <span className="font-mono text-primary font-bold tracking-widest uppercase text-xs mb-4 inline-block px-3 py-1 bg-primary/10 rounded-full">Tool Suite</span>
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-[-0.02em] text-on-surface mb-6">
            Instagram Downloader
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Download high-quality videos, reels, and photos from any public Instagram post instantly. No login required.
          </p>
        </div>

        <UniversalDownloader
          serviceName="Instagram"
          apiEndpoint="/api/instagram"
          placeholder="https://www.instagram.com/p/..."
          accentColor="primary"
          icon="camera"
        />

        {/* Feature Highlights */}
        <section className="mt-24 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">hd</span>
            <h3 className="font-bold mb-2">HD Quality</h3>
            <p className="text-on-surface-variant text-sm">Download media in the highest possible resolution available on Instagram.</p>
          </div>
          <div className="text-center p-6">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">layers</span>
            <h3 className="font-bold mb-2">Carousel Support</h3>
            <p className="text-on-surface-variant text-sm">Ability to download all photos and videos from a single carousel post.</p>
          </div>
          <div className="text-center p-6">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">reels</span>
            <h3 className="font-bold mb-2">Reels Downloader</h3>
              <p className="text-on-surface-variant text-sm">Full support for Instagram Reels with original audio extraction.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
