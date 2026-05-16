'use client';

import { useState } from 'react';
import {
  Github,
  Copy,
  Check,
  X,
  Download,
  Loader2,
  CheckCircle2,
  Terminal,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ================================================================
   DATA: langkah-langkah git push ke GitHub
   ================================================================ */

interface Step {
  title: string;
  desc: string;
  code: string;
}

const STEPS: Step[] = [
  {
    title: 'Download & Extract File ZIP',
    desc: 'Klik tombol download di bawah untuk mendapatkan source code terbaru, lalu extract ke folder komputer Anda.',
    code: '',
  },
  {
    title: 'Buka Terminal di Folder Project',
    desc: 'Buka terminal/command prompt, lalu masuk ke folder hasil extract.',
    code: 'cd mitra-jasa-pro',
  },
  {
    title: 'Install Dependencies & Setup Database',
    desc: 'Install semua package dan buat database SQLite.',
    code: 'npm install\nnpx prisma db push',
  },
  {
    title: 'Test Lokal (Opsional)',
    desc: 'Jalankan server lokal untuk memastikan semuanya berjalan.',
    code: 'npm run dev',
  },
  {
    title: 'Inisialisasi Git',
    desc: 'Mulai repo git dan buat commit pertama.',
    code: 'git init\ngit add .\ngit commit -m "feat: Mitra Jasa Pro - initial commit"',
  },
  {
    title: 'Buat Repository di GitHub',
    desc: 'Buat repository baru di GitHub. Nama: mitra-jasa-pro — JANGAN centang "Initialize with README".',
    code: '',
  },
  {
    title: 'Push ke GitHub',
    desc: 'Ganti USERNAME dengan username GitHub Anda, lalu jalankan perintah di bawah.',
    code: 'git remote add origin https://github.com/USERNAME/mitra-jasa-pro.git\ngit branch -M main\ngit push -u origin main',
  },
];

/* ================================================================
   Copy button
   ================================================================ */
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const doCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  };
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={doCopy}
      className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 border border-gray-200 transition-colors"
    >
      {ok ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {ok ? 'Tersalin!' : label || 'Copy'}
    </button>
  );
}

/* ================================================================
   Code block
   ================================================================ */
function CodeBlock({ code }: { code: string }) {
  if (!code) return null;
  return (
    <div className="relative rounded-lg bg-gray-900 overflow-hidden mt-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/70">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Terminal</span>
        <CopyBtn text={code} />
      </div>
      <pre className="px-4 py-3 text-[13px] leading-relaxed overflow-x-auto font-mono text-gray-100">
        {code.split('\n').map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-gray-600 select-none w-5 text-right shrink-0">{i + 1}</span>
            <span>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function GitUploadGuide() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/download');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mitra-jasa-pro.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch { /* ignore */ } finally {
      setDownloading(false);
    }
  };

  /* ---------- floating trigger ---------- */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Github className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:inline">Upload ke GitHub</span>
      </button>
    );
  }

  /* ---------- full panel ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* panel */}
      <div className="relative mx-4 mb-4 sm:mb-0 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[88vh]">
        {/* ── header ── */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-5 py-4 shrink-0">
          <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Github className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload ke GitHub via Git</h3>
              <p className="text-xs text-gray-400">Panduan langkah demi langkah</p>
            </div>
          </div>
        </div>

        {/* ── body (scrollable) ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {/* info banner */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200/60 p-3">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700 leading-relaxed">
              Pastikan sudah install <strong>Git</strong> (<a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer" className="underline">download</a>) dan punya akun <strong>GitHub</strong>. Jalankan di terminal/command prompt.
            </p>
          </div>

          {/* steps */}
          {STEPS.map((step, idx) => {
            const isExp = expanded === idx;
            const hasCode = step.code.length > 0;
            const isStep6 = idx === 5; // buat repo di GitHub

            return (
              <div key={idx} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                {/* step header */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExp ? null : idx)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isExp ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'} transition-colors`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{step.title}</span>
                  {isExp ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {/* expanded body */}
                {isExp && (
                  <div className="px-3.5 pb-3.5 border-t border-gray-50">
                    <p className="text-[13px] text-gray-500 mt-2.5 leading-relaxed">{step.desc}</p>

                    {/* special: step 1 → download button */}
                    {idx === 0 && (
                      <Button
                        onClick={handleDownload}
                        disabled={downloading || done}
                        className="mt-3 w-full h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm gap-2"
                      >
                        {downloading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Downloading...</>
                        ) : done ? (
                          <><CheckCircle2 className="h-4 w-4 text-emerald-400" />Berhasil Diunduh!</>
                        ) : (
                          <><Download className="h-4 w-4" />Download mitra-jasa-pro.zip (1.4 MB)</>
                        )}
                      </Button>
                    )}

                    {/* special: step 6 → link buat repo */}
                    {isStep6 && (
                      <a
                        href="https://github.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        Buat Repository Baru
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {/* code block */}
                    {hasCode && <CodeBlock code={step.code} />}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── success banner ── */}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/60 p-3.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-[13px] text-emerald-700 leading-relaxed">
              <strong>Selesai!</strong> Kode sudah berhasil di-push ke GitHub. Buka repo Anda untuk melihat hasilnya.
            </p>
          </div>

          {/* ── bonus: deploy vercel ── */}
          <details className="rounded-xl border border-blue-100 bg-blue-50/40 overflow-hidden">
            <summary className="px-3.5 py-3 text-sm font-medium text-blue-800 cursor-pointer hover:bg-blue-50 transition-colors">
              Bonus: Deploy ke Vercel
            </summary>
            <div className="px-3.5 pb-3.5 space-y-2">
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Setelah push ke GitHub, deploy otomatis via Vercel:
              </p>
              <CodeBlock code="npx vercel" />
              <p className="text-[12px] text-gray-400">
                Atau via dashboard:{' '}
                <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  vercel.com/new
                </a>
              </p>
            </div>
          </details>
        </div>

        {/* ── footer: copy all commands ── */}
        <div className="shrink-0 border-t border-gray-100 px-5 py-3 bg-gray-50/50">
          <CopyBtn
            text={STEPS.filter(s => s.code).map(s => s.code).join('\n')}
            label="Copy Semua Perintah"
          />
        </div>
      </div>
    </div>
  );
}
