import FacebookDownloader from "@/components/FacebookDownloader";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf8ff]/80 backdrop-blur-xl">
        <div className="flex justify-between items-center h-16 px-8 max-w-screen-2xl mx-auto">
          {/* Brand */}
          <a className="text-xl font-black tracking-tighter text-slate-900" href="#">
            Syntactic
          </a>
          {/* Navigation Links (Web) */}
          <div className="hidden md:flex space-x-8 items-center font-sans text-sm font-medium tracking-tight">
            <a className="text-slate-500 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-md px-3 py-2 transition-all" href="#">Mock APIs</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-md px-3 py-2 transition-all" href="#">Content Tools</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-md px-3 py-2 transition-all" href="#">AI Suite</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-md px-3 py-2 transition-all" href="#">Pricing</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-md px-3 py-2 transition-all" href="#">Docs</a>
          </div>
          {/* Actions */}
          <div className="flex items-center space-x-4 font-sans text-sm font-medium tracking-tight">
            <a className="text-slate-500 hover:text-slate-900 transition-colors" href="#">Log In</a>
            <a className="bg-primary text-on-primary px-4 py-2 rounded-md hover:opacity-90 transition-opacity scale-95 active:scale-90 transition-transform duration-150" href="#">Get Started</a>
          </div>
        </div>
        <div className="bg-slate-100/50 h-[1px] w-full absolute bottom-0"></div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-screen-2xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none flex justify-center items-center opacity-40">
            <div className="w-[800px] h-[400px] bg-gradient-to-br from-primary-container/20 to-secondary-container/10 blur-3xl rounded-full"></div>
          </div>
          <span className="font-mono text-primary font-bold tracking-widest uppercase text-xs mb-6 px-3 py-1 bg-surface-container-highest rounded-full glass-edge">v2.0 Now Available</span>
          <h1 className="text-[4rem] leading-[1.1] md:text-[5.5rem] font-sans font-black tracking-[-0.03em] text-on-surface max-w-4xl mb-8">
            The Ultimate<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">Device Mockup API</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant font-sans max-w-2xl mb-12 leading-relaxed">
            Generate high-fidelity, production-ready device mockups programmatically. Built for high-performance developer workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a className="bg-gradient-to-br from-primary to-secondary text-on-primary px-8 py-4 rounded-md font-medium text-lg ambient-shadow hover:scale-[1.02] transition-transform flex items-center gap-2" href="#docs">
              Read Documentation
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
            <div className="font-mono text-sm text-on-surface-variant bg-surface-container-highest px-6 py-4 rounded-md flex items-center gap-3 glass-edge">
              <span className="text-outline">npm install</span> @qalbetools/mockup
              <button className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tools Showcase Section */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-[3.5rem] font-sans font-black tracking-tight text-on-surface mb-4">Powerful Content Utilities</h2>
              <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">High-performance downloader tools for every platform.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Facebook Downloader (Active) */}
              <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 flex flex-col justify-between group cursor-pointer hover:ambient-shadow transition-all">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary">facebook</span>
                  </div>
                  <h3 className="text-2xl font-black text-on-surface mb-2">Facebook Downloader</h3>
                  <p className="text-on-surface-variant leading-relaxed">Save HD videos, stories, and reels from Facebook instantly.</p>
                </div>
                <div className="mt-8">
                  <FacebookDownloader />
                </div>
              </div>

              {/* Instagram Downloader */}
              <Link href="/tools/instagram" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-primary/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">camera</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Instagram</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Reels, Photos & Story Saver</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* TikTok Downloader */}
              <Link href="/tools/tiktok" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-slate-900/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-900/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-slate-900 transition-colors">music_note</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">TikTok</h3>
                  <p className="text-sm text-on-surface-variant mb-6">No Watermark Video Saver</p>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* YouTube Downloader */}
              <Link href="/tools/youtube" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-red-600/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-red-600 transition-colors">video_library</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">YouTube</h3>
                  <p className="text-sm text-on-surface-variant mb-6">MP4 Video & MP3 Audio</p>
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* Twitter/X Downloader */}
              <Link href="/tools/twitter" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-sky-500/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-sky-500/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-sky-600 transition-colors">twitter</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Twitter / X</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Media & Video Downloader</p>
                  <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* Pinterest Downloader */}
              <Link href="/tools/pinterest" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-red-700/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-700/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-red-700 transition-colors">push_pin</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Pinterest</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Image & Video Pin Saver</p>
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* MediaFire Downloader */}
              <Link href="/tools/mediafire" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-blue-700/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-700/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-blue-700 transition-colors">cloud_download</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">MediaFire</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Direct File Extractor</p>
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* CapCut Downloader */}
              <Link href="/tools/capcut" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-slate-900/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-900/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-slate-900 transition-colors">auto_videocam</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">CapCut</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Template & Video Saver</p>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* GDrive Downloader */}
              <Link href="/tools/gdrive" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:border-green-700/50 transition-all hover:bg-surface-container-high">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-700/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-green-700 transition-colors">add_to_drive</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Google Drive</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Direct Link Generator</p>
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    Open Tool
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* IPTV Player */}
              <Link href="/tools/iptv" className="bg-gradient-to-br from-black to-slate-900 p-8 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-primary/50 transition-all hover:ambient-shadow shadow-primary/10">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors">tv</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">IPTV Player</h3>
                  <p className="text-sm text-white/40 mb-6">Pro HLS Stream Suite</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    Enter Cinema
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">sensors</span>
                  </div>
                </div>
              </Link>

              {/* Resume AI - New Tool */}
              <Link href="/tools/resume" className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg shadow-primary/20">NEW AI</div>
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/10 transition-colors">
                  <span className="material-symbols-outlined text-white group-hover:text-blue-400 transition-colors">auto_fix_high</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Resume AI</h3>
                  <p className="text-sm text-white/40 mb-6">ATS-Master Builder</p>
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    Build Resume
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">edit_document</span>
                  </div>
                </div>
              </Link>

              {/* Log Checker - New Tool */}
              <Link href="/tools/admin" className="bg-white/5 p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors">terminal</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Log Checker</h3>
                  <p className="text-sm text-white/40 mb-6">System Health & API Diagnostics</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    Open Console
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">insights</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Use QalbeTools Section (Features - Bento Grid) */}
        <section className="bg-surface-container-low py-32">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="mb-16 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-on-surface mb-4">Architected for Speed</h2>
              <p className="text-lg text-on-surface-variant">We removed the friction so you can focus on building.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
              {/* Fast Response */}
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between ambient-shadow">
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Sub-50ms Response Times</h3>
                  <p className="text-on-surface-variant leading-relaxed">Global edge caching ensures your mockups are generated and delivered instantly, regardless of where your users are.</p>
                </div>
              </div>
              {/* Zero Auth */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between ambient-shadow">
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">no_encryption</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Zero Auth Required</h3>
                  <p className="text-on-surface-variant leading-relaxed">Start testing immediately on our free tiers without managing complex API keys.</p>
                </div>
              </div>
              {/* CORS Configured */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between ambient-shadow">
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">public</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">CORS Pre-Configured</h3>
                  <p className="text-on-surface-variant leading-relaxed">Call directly from your frontend applications without fighting browser security policies.</p>
                </div>
              </div>
              {/* Formats */}
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between ambient-shadow overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-2xl">imagesmode</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Multiple Output Formats</h3>
                  <p className="text-on-surface-variant leading-relaxed max-w-md">Export to WebP, PNG, JPEG, or SVG. Need transparency? We handle alpha channels automatically.</p>
                </div>
                <div className="absolute right-[-40px] bottom-[-40px] opacity-20 pointer-events-none">
                  <span className="material-symbols-outlined text-[200px] text-primary">devices</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer API Guide Section */}
        <section className="py-32 max-w-screen-2xl mx-auto px-8" id="docs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-sans font-bold tracking-tight text-on-surface mb-6">Developer API Guide</h2>
              <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
                Our RESTful API is designed to be intuitive and strictly typed. Pass your target URL, specify the device, and receive a high-fidelity image buffer in return.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Construct the Payload</h4>
                    <p className="text-on-surface-variant text-sm mt-1">Define the device model, orientation, and background color.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Make the Request</h4>
                    <p className="text-on-surface-variant text-sm mt-1">Send a POST request to our edge-optimized endpoints.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Code Block */}
            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden ambient-shadow glass-edge flex flex-col h-full min-h-[400px]">
              <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="font-mono text-xs text-white/50">request.js</span>
              </div>
              <div className="p-6 overflow-x-auto font-mono text-sm leading-relaxed flex-grow">
                <pre><code className="text-[#d4d4d4]"><span className="text-[#c586c0]">const</span> response <span className="text-[#c586c0]">=</span> <span className="text-[#569cd6]">await</span> fetch(&apos;https://api.qalbetools.com/v1/mockup&apos;, &#123;
  <span className="text-[#9cdcfe]">method</span>: &apos;POST&apos;,
  <span className="text-[#9cdcfe]">headers</span>: &#123;
    &apos;Content-Type&apos;: &apos;application/json&apos;,
    &apos;Authorization&apos;: &apos;Bearer YOUR_KEY&apos; <span className="text-[#6a9955]">// Optional for Hobbyist</span>
  &#125;,
  <span className="text-[#9cdcfe]">body</span>: <span className="text-[#4ec9b0]">JSON</span>.stringify(&#123;
    <span className="text-[#9cdcfe]">url</span>: &apos;https://syntactic.app&apos;,
    <span className="text-[#9cdcfe]">device</span>: &apos;iphone-15-pro&apos;,
    <span className="text-[#9cdcfe]">orientation</span>: &apos;portrait&apos;,
    <span className="text-[#9cdcfe]">theme</span>: &apos;dark&apos;,
    <span className="text-[#9cdcfe]">format</span>: &apos;webp&apos;
  &#125;)
&#125;);

<span className="text-[#c586c0]">const</span> imageBuffer <span className="text-[#c586c0]">=</span> <span className="text-[#569cd6]">await</span> response.arrayBuffer();</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-surface-container-low py-32" id="pricing">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-sans font-bold tracking-tight text-on-surface mb-4">Transparent Pricing</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Scale your infrastructure without unexpected costs. Pay only for what you compute.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Hobbyist */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col h-full border border-transparent">
                <h3 className="font-mono text-sm uppercase tracking-widest text-on-surface-variant mb-4">Hobbyist</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-on-surface">$0</span>
                  <span className="text-on-surface-variant">/mo</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-8 h-10">Perfect for side projects and local testing.</p>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> 1,000 requests/mo</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> Standard resolution</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> Community support</li>
                </ul>
                <button className="w-full py-3 px-4 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface font-medium hover:bg-surface-container-high transition-colors">Start Free</button>
              </div>
              {/* Developer Plus */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col h-full border border-transparent">
                <h3 className="font-mono text-sm uppercase tracking-widest text-on-surface-variant mb-4">Developer Plus</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-on-surface">$19</span>
                  <span className="text-on-surface-variant">/mo</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-8 h-10">For independent developers building production apps.</p>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> 50,000 requests/mo</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> High-res output (4K)</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> 24hr support SLA</li>
                </ul>
                <button className="w-full py-3 px-4 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface font-medium hover:bg-surface-container-high transition-colors">Subscribe</button>
              </div>
              {/* Professional (Highlighted) */}
              <div className="bg-gradient-to-b from-surface-container-lowest to-primary-fixed/20 rounded-xl p-8 flex flex-col h-full ambient-shadow relative md:scale-105 z-10 glass-edge">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</span>
                </div>
                <h3 className="font-mono text-sm uppercase tracking-widest text-primary mb-4">Professional</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-on-surface">$49</span>
                  <span className="text-on-surface-variant">/mo</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-8 h-10">For small teams requiring scale and reliability.</p>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> 500,000 requests/mo</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> All export formats</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> Webhook integrations</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">check</span> Priority support</li>
                </ul>
                <button className="w-full py-3 px-4 rounded-md bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity">Get Professional</button>
              </div>
              {/* Enterprise */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col h-full border border-transparent">
                <h3 className="font-mono text-sm uppercase tracking-widest text-on-surface-variant mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-on-surface">Custom</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-8 h-10">Dedicated infrastructure for high-volume pipelines.</p>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> Unlimited requests</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> Custom device models</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> Dedicated account manager</li>
                  <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-outline">check</span> SLA guarantees</li>
                </ul>
                <button className="w-full py-3 px-4 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface font-medium hover:bg-surface-container-high transition-colors">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 bg-[#faf8ff] mt-16">
        <div className="max-w-screen-2xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-black text-slate-900 mb-2">Syntactic</span>
            <p className="font-sans text-sm text-slate-500">© 2024 Syntactic Atmosphere. Built for the high-performance developer.</p>
          </div>
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-sans text-sm text-slate-500">
            <a className="hover:text-slate-900 transition-colors" href="#">Changelog</a>
            <a className="hover:text-slate-900 transition-colors" href="#">API Status</a>
            <a className="hover:text-slate-900 transition-colors" href="#">Privacy</a>
            <a className="hover:text-slate-900 transition-colors" href="#">Terms</a>
            <a className="hover:text-slate-900 transition-colors" href="#">Discord</a>
            <a className="hover:text-slate-900 transition-colors" href="#">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
