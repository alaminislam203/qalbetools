import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter">
            Qalbe<span className="text-indigo-600 dark:text-indigo-400">Tools</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <a href="https://qalbetalks.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block">
              QalbeTalks
            </a>
            <a href="#api-docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">API Docs</a>
            <a href="https://github.com/alaminislam203/qalbetools" target="_blank" rel="noopener noreferrer" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            The Ultimate <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Device Mockup API</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed tracking-wide">
            Instantly generate stunning, pixel-perfect device mockups for your apps and websites. 
            No design skills needed. Just send an image, and get a professional mockup back.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#api-docs" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1">
              Read Documentation
            </a>
            <a href="https://qalbetalks.com/free-tools/device-mockup-generator/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 font-bold rounded-2xl shadow-sm transition-all hover:-translate-y-1">
              Live Generator Tool
            </a>
          </div>
        </div>
      </section>

      {/* API Documentation Section */}
      <section id="api-docs" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Developer API Guide</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Integrate our powerful utility APIs directly into your workflow.</p>
          </div>

          {/* Device Mockup API */}
          <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl mb-12">
            <h3 className="text-2xl font-black mb-6 text-indigo-600 dark:text-indigo-400">1. Device Mockup API</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
              <code className="text-lg md:text-xl font-mono text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hidden sm:block">
                /api/mockup
              </code>
            </div>
            
            <p className="mb-10 text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              Send a <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md text-sm">multipart/form-data</code> POST request containing your image and the target device ID. 
            </p>

            <div className="mb-12">
              <h4 className="font-bold text-xl mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Parameters (FormData)</h4>
              <ul className="space-y-4">
                <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-inner px-3 py-1.5 rounded-lg w-fit">image</code>
                  <span className="text-slate-600 dark:text-slate-400">The screenshot file (PNG, JPG, WebP).</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-inner px-3 py-1.5 rounded-lg w-fit">deviceId</code>
                  <span className="text-slate-600 dark:text-slate-400">Supported values: <b>iphone15</b>, <b>macbook</b>.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Facebook Downloader API */}
          <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-2xl font-black mb-6 text-blue-600 dark:text-blue-400">2. Facebook Media Downloader API</h3>
            
            {/* Fetch Endpoint */}
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                <code className="text-lg md:text-xl font-mono text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  /api/fb-downloader
                </code>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-6">
                Fetch metadata, thumbnails, and direct video/image URLs from a public Facebook URL.
              </p>
              
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl mb-8">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Request Body (JSON)</span>
                </div>
                <pre className="p-6 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "url": "https://www.facebook.com/reel/1305238694994449"
}`}
                </pre>
              </div>
            </div>

            {/* Proxy Endpoint */}
            <div className="mb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">GET</span>
                  <code className="text-lg md:text-xl font-mono text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/fb-downloader/proxy?url=URL&filename=NAME
                  </code>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-6">
                  Bypass CORS and force direct downloads with the <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md text-sm">Content-Disposition</code> header.
                </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                <span className="ml-4 text-xs font-mono text-slate-400">usage-example.js</span>
              </div>
              <pre className="p-6 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`// 1. Fetch formats
const res = await fetch('/api/fb-downloader', {
  method: 'POST',
  body: JSON.stringify({ url: 'FB_URL' })
});
const { data } = await res.json();

// 2. Download via Proxy
const downloadUrl = \`/api/fb-downloader/proxy?url=\${encodeURIComponent(data.formats[0].url)}&filename=video.mp4\`;
window.location.href = downloadUrl;`}
              </pre>
            </div>
          </div>

          {/* Instagram Downloader API */}
          <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl mt-12">
            <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">3. Instagram Media Downloader API</h3>
            
            {/* Fetch Endpoint */}
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                <code className="text-lg md:text-xl font-mono text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  /api/ig-downloader
                </code>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-6">
                Extract high-resolution videos and images from any public Instagram URL (Posts, Reels).
              </p>
              
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl mb-8">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Request Body (JSON)</span>
                </div>
                <pre className="p-6 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "url": "https://www.instagram.com/reels/C4ub4_8L6z7/"
}`}
                </pre>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                <span className="ml-4 text-xs font-mono text-slate-400">Usage Recommendation</span>
              </div>
              <div className="p-6 text-sm text-slate-300 leading-relaxed">
                <p className="mb-4 text-slate-400 italic">For the best user experience and to avoid browser restrictions, always use our secure proxy for direct media downloads:</p>
                <code className="block bg-black p-4 rounded-xl border border-slate-800 text-purple-400 font-mono mb-4 break-all">
                  /api/fb-downloader/proxy?url=IG_CDN_URL&filename=ig-media.mp4
                </code>
                <p className="text-slate-500">Note: The proxy also works for Instagram CDN links seamlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content & SEO Value Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Why Use a Device Mockup API?</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-loose text-slate-600 dark:text-slate-400 space-y-6">
            <p>
              Presenting your application interfaces in realistic <strong>device mockups</strong> significantly boosts user engagement and professional appeal. Whether you are building an app portfolio, presenting to clients, or creating social media marketing graphics, high-quality mockups of devices like the <strong>iPhone 15</strong> or <strong>Apple MacBook</strong> add immediate context to your screenshots.
            </p>
            <p>
              The <strong>QalbeTools Mockup Generator API</strong> takes away the pain of manual photo editing in Photoshop or Figma. Built on top of the lightning-fast <em>Sharp</em> image processing library, it automatically detects transparent screen areas in your uploaded mockup frames, resizes the client screenshots perfectly, and applies matching border radii. It handles all the heavy lifting directly on the edge.
            </p>
            <p>
              This API is completely free to use and operates seamlessly across standard CORS configurations, meaning you can plug it directly into your frontend React, Vue, WordPress, or Vanilla JS applications without setting up your own image-processing backend or configuring complex Node.js infrastructures.
            </p>
          </div>
        </div>
      </section>

      {/* Footer / Backlink */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-16 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center gap-8">
            <h3 className="text-3xl font-black text-white tracking-tighter">
              Qalbe<span className="text-indigo-500">Tools</span>
            </h3>
            <p className="max-w-xl mx-auto text-lg leading-relaxed text-slate-300">
              A powerful open-source suite of developer utilities brought to you by the creators of QalbeTalks. Discover tools that supercharge your workflow.
            </p>
            <a 
              href="https://qalbetalks.com" 
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all hover:scale-105"
              target="_blank" rel="noopener noreferrer"
              title="QalbeTalks - Technology, Coding, and Free Web Tools"
            >
              Learn more at QalbeTalks.com <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-800/50 text-sm font-medium">
            <p>
              &copy; {new Date().getFullYear()}{" "}
              <a href="https://qalbetalks.com" className="text-white hover:text-indigo-400 transition-colors">QalbeTalks</a>. 
              All rights reserved. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
