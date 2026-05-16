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
  ExternalLink,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ================================================================
   SCRIPT DATA
   ================================================================ */

const INITIAL_SCRIPT = `# === PERTAMA KALI: Setup & Push Baru ke GitHub ===

# 1. Download ZIP lalu extract ke folder project
#    (klik tombol Download di bawah)

# 2. Buka PowerShell di folder project
cd C:\\Project\\mitra-jasa-pro

# 3. Install dependencies & setup database
npm install
npx prisma db push

# 4. Setup git & push
git init
git config user.email "emailanda@gmail.com"
git config user.name "NamaAnda"
git add .
git commit -m "feat: Mitra Jasa Pro - initial commit"
git remote add origin https://github.com/USERNAME/mitra-jasa-pro.git
git branch -M main
git push -u origin main`;

const UPDATE_SCRIPT = `# === UPDATE: Push Kode Terbaru ke GitHub ===

# 1. Download ZIP terbaru (klik tombol di bawah)
# 2. Buka PowerShell di folder project yang sudah ada .git-nya

cd C:\\Project\\mitra-jasa-pro

# 3. Hapus semua file lama (kecuali .git)
Get-ChildItem -Exclude .git | Remove-Item -Recurse -Force

# 4. Extract ZIP terbaru ke folder ini
Expand-Archive -Path ~\\Downloads\\mitra-jasa-pro.zip -DestinationPath . -Force

# 5. Commit & push
git add .
git commit -m "update: perbaikan login, register, dan komponen terbaru"
git push -u origin main --force`;

/* ================================================================
   Copy button
   ================================================================ */
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const doCopy = async () => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  };
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={doCopy}
      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 border border-gray-200 transition-colors"
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
  return (
    <div className="relative rounded-lg bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/70">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">PowerShell</span>
        <CopyBtn text={code} />
      </div>
      <pre className="px-4 py-3 text-[12px] leading-relaxed overflow-x-auto font-mono text-gray-100 max-h-72 overflow-y-auto">
        {code.split('\n').map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-gray-600 select-none w-5 text-right shrink-0">{i + 1}</span>
            <span className={line.trimStart().startsWith('#') ? 'text-emerald-400/70' : ''}>{line}</span>
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
  const [tab, setTab] = useState<'initial' | 'update'>('update');
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative mx-4 mb-4 sm:mb-0 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        {/* header */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-5 py-4 shrink-0">
          <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Github className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload ke GitHub</h3>
              <p className="text-xs text-gray-400">Script PowerShell — copy & paste</p>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setTab('update')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'update' ? 'text-gray-900 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Zap className="h-3.5 w-3.5" />
            Update Existing
          </button>
          <button
            type="button"
            onClick={() => setTab('initial')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'initial' ? 'text-gray-900 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Github className="h-3.5 w-3.5" />
            First Time Setup
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {/* download button */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Download className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-[13px] text-emerald-700 font-medium truncate">
                {done ? 'File berhasil diunduh!' : 'Download ZIP terbaru dulu:'}
              </span>
            </div>
            <Button
              onClick={handleDownload}
              disabled={downloading || done}
              size="sm"
              className="shrink-0 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium gap-1.5"
            >
              {downloading ? <><Loader2 className="h-3 w-3 animate-spin" />Loading</> : done ? <><CheckCircle2 className="h-3 w-3" />Done</> : <><Download className="h-3 w-3" />Download</>}
            </Button>
          </div>

          {/* info */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200/60 p-3">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[12px] text-amber-700 leading-relaxed">
              <p><strong>Ganti:</strong> <code className="bg-amber-100 px-1 rounded text-[11px]">C:\Project\mitra-jasa-pro</code> dengan path folder Anda</p>
              <p className="mt-1"><strong>Ganti:</strong> <code className="bg-amber-100 px-1 rounded text-[11px]">USERNAME</code> dengan username GitHub Anda</p>
              {tab === 'update' && (
                <p className="mt-1"><strong>Ganti:</strong> <code className="bg-amber-100 px-1 rounded text-[11px]">~\Downloads\mitra-jasa-pro.zip</code> dengan lokasi file ZIP hasil download</p>
              )}
            </div>
          </div>

          {/* script */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              {tab === 'update' ? 'Script Update (Copy & Paste ke PowerShell):' : 'Script Setup Awal (Copy & Paste ke PowerShell):'}
            </p>
            <CodeBlock code={tab === 'update' ? UPDATE_SCRIPT : INITIAL_SCRIPT} />
          </div>

          {/* note */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <p className="text-[12px] text-gray-500 leading-relaxed">
              💡 <strong>Tips:</strong> Buka PowerShell, paste seluruh script, lalu tekan Enter. Pastikan file ZIP sudah di-download sebelum menjalankan script.
            </p>
          </div>
        </div>

        {/* footer */}
        <div className="shrink-0 border-t border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center justify-between">
          <CopyBtn
            text={tab === 'update' ? UPDATE_SCRIPT : INITIAL_SCRIPT}
            label="Copy Seluruh Script"
          />
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            github.com/new <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
