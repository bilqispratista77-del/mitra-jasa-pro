'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  IdCard,
  Award,
  Briefcase,
  Image as ImageIcon,
  FileQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';

// ---- Types ----
interface SellerDocument {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: string; // PENDING, APPROVED, REJECTED
  note: string;
  createdAt: string;
}

// ---- Constants ----
const docTypes = [
  { type: 'KTP', label: 'KTP / Identitas', icon: IdCard, description: 'Foto KTP atau identitas diri' },
  { type: 'SIUP', label: 'SIUP / Izin Usaha', icon: FileText, description: 'Surat izin usaha' },
  { type: 'SERTIFIKAT', label: 'Sertifikat', icon: Award, description: 'Sertifikat keahlian' },
  { type: 'PORTOFOLIO', label: 'Portofolio', icon: Briefcase, description: 'Dokumen portofolio kerja' },
  { type: 'LAINNYA', label: 'Lainnya', icon: FileQuestion, description: 'Dokumen pendukung lainnya' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ---- Helpers ----
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Menunggu Review',
        badgeClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        icon: Clock,
      };
    case 'APPROVED':
      return {
        label: 'Disetujui',
        badgeClass: 'bg-green-100 text-green-700 hover:bg-green-100',
        icon: CheckCircle,
      };
    case 'REJECTED':
      return {
        label: 'Ditolak',
        badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
        icon: XCircle,
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
        icon: AlertCircle,
      };
  }
}

function getVerificationStatus(verified: boolean | null | undefined) {
  if (verified === true) {
    return {
      label: 'Terverifikasi',
      color: 'text-green-700',
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    };
  }
  if (verified === false) {
    return {
      label: 'Belum Terverifikasi',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      icon: Clock,
      iconColor: 'text-amber-600',
    };
  }
  return {
    label: 'Verifikasi Pending',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    icon: Clock,
    iconColor: 'text-gray-500',
  };
}

// ---- Animation Variants ----
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// ---- Document Row Component ----
function DocumentRow({
  docType,
  document,
  uploading,
  deletingId,
  onUpload,
  onDelete,
}: {
  docType: (typeof docTypes)[number];
  document: SellerDocument | undefined;
  uploading: boolean;
  deletingId: string | null;
  onUpload: (type: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = docType.icon;
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (document) {
    const statusConfig = getStatusConfig(document.status);
    const StatusIcon = statusConfig.icon;
    const isPending = document.status === 'PENDING';
    const isRejected = document.status === 'REJECTED';

    return (
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
      >
        {/* Left: Icon + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">
                {docType.label}
              </p>
              <Badge
                variant="secondary"
                className={`${statusConfig.badgeClass} text-[10px] px-2 py-0.5 gap-1`}
              >
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{document.fileName}</p>
              <span className="text-xs text-muted-foreground/60 shrink-0">
                ({formatFileSize(document.fileSize)})
              </span>
            </div>
            {/* Show admin note for rejected */}
            {isRejected && document.note && (
              <div className="flex items-start gap-1.5 mt-2 rounded-lg bg-red-50 px-2.5 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{document.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          {isRejected && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Upload Ulang
            </Button>
          )}
          {isPending && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(document.id)}
              disabled={deletingId === document.id}
            >
              {deletingId === document.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Hapus
            </Button>
          )}

          {/* Hidden file input for re-upload (rejected) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUpload(docType.type);
                e.target.value = '';
              }
            }}
            disabled={uploading}
          />
        </div>

        {/* KTP warning */}
        {docType.type === 'KTP' && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-semibold mb-0.5">Penting: Tutup NIK Anda!</p>
              <p>Sebelum mengupload, pastikan nomor NIK (16 digit) pada KTP Anda sudah ditutup atau ditutupi menggunakan aplikasi edit foto. Hal ini untuk melindungi data pribadi Anda.</p>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // No document — show upload button
  const isKtp = docType.type === 'KTP';

  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-dashed bg-card/50 p-4 transition-colors hover:bg-accent/20"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{docType.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{docType.description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(docType.type);
              e.target.value = '';
            }
          }}
          disabled={uploading}
        />
      </div>
      {isKtp && (
        <div className="sm:col-span-2 col-span-1 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-semibold mb-0.5">Penting: Tutup NIK Anda!</p>
            <p>Sebelum mengupload, pastikan nomor NIK (16 digit) pada KTP Anda sudah ditutup atau ditutupi menggunakan aplikasi edit foto. Hal ini untuk melindungi data pribadi Anda.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---- Main Component ----
export default function DocumentUploadSection() {
  const user = useAuthStore((s) => s.user);
  const verified = (user as any)?.verified as boolean | null | undefined;

  const [documents, setDocuments] = useState<SellerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Track file inputs for each type so we can trigger them programmatically
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Map documents by type for quick lookup
  const docByType = useCallback(
    (type: string): SellerDocument | undefined => {
      return documents.find((d) => d.type === type);
    },
    [documents]
  );

  // Fetch documents on mount
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/seller/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        setError(data.error || 'Gagal memuat dokumen');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload handler
  const handleUpload = useCallback(
    async (type: string) => {
      const inputEl = fileInputRefs.current[type];
      if (!inputEl) return;

      const file = inputEl.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`Ukuran file terlalu besar. Maksimal ${formatFileSize(MAX_FILE_SIZE)}.`);
        return;
      }

      setUploadingType(type);
      setError('');

      try {
        // Convert file to base64
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Gagal membaca file'));
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/seller/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            fileName: file.name,
            mimeType: file.type,
            fileData,
            fileSize: file.size,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setDocuments((prev) => [data.data, ...prev]);
        } else {
          setError(data.error || 'Gagal mengunggah dokumen');
        }
      } catch {
        setError('Terjadi kesalahan saat mengunggah dokumen');
      } finally {
        setUploadingType(null);
        // Reset the file input
        if (inputEl) inputEl.value = '';
      }
    },
    []
  );

  // Delete handler
  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(`/api/seller/documents?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        setError(data.error || 'Gagal menghapus dokumen');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setDeletingId(null);
    }
  }, []);

  // Trigger upload for a specific type — sets the target type then clicks the hidden input
  const triggerUpload = useCallback(
    (type: string) => {
      // We use a callback ref approach: store the type, then the hidden file input
      // in DocumentRow will call onUpload which triggers handleUpload
      const inputEl = fileInputRefs.current[type];
      if (inputEl) {
        inputEl.click();
      }
    },
    []
  );

  const verificationStatus = getVerificationStatus(verified);
  const VerificationIcon = verificationStatus.icon;

  // Count documents by status
  const pendingCount = documents.filter((d) => d.status === 'PENDING').length;
  const approvedCount = documents.filter((d) => d.status === 'APPROVED').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Verifikasi Dokumen</h2>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                Dokumen yang Anda unggah hanya digunakan untuk proses verifikasi oleh admin dan
                <span className="font-semibold text-foreground"> tidak akan ditampilkan secara publik</span> di
                website. Pastikan dokumen yang diunggah jelas dan dapat dibaca.
              </p>
            </div>
          </div>

          {/* Verification Status Badge */}
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 shrink-0 ${verificationStatus.bg}`}
          >
            <VerificationIcon className={`h-4 w-4 ${verificationStatus.iconColor}`} />
            <span className={`text-xs font-semibold ${verificationStatus.color}`}>
              {verificationStatus.label}
            </span>
          </div>
        </div>

        {/* Stats summary */}
        {!loading && documents.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{documents.length}</span> dokumen
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3 w-3 text-amber-500" />
                <span className="text-amber-700 font-medium">{pendingCount} menunggu</span>
              </div>
            )}
            {approvedCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-700 font-medium">{approvedCount} disetujui</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Error */}
      {error && (
        <div className="mx-5 sm:mx-6 mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-auto text-destructive/60 hover:text-destructive transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Document List */}
      <div className="p-5 sm:p-6">
        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            {docTypes.map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 animate-pulse"
              >
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                </div>
                <div className="h-8 w-20 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={{
              animate: {
                transition: { staggerChildren: 0.05 },
              },
            }}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {docTypes.map((docType) => (
              <DocumentRow
                key={docType.type}
                docType={docType}
                document={docByType(docType.type)}
                uploading={uploadingType === docType.type}
                deletingId={deletingId}
                onUpload={(type) => {
                  // For the upload trigger, we store the type and click the hidden input
                  setUploadingType(type);
                  const inputEl = fileInputRefs.current[type];
                  if (inputEl) {
                    inputEl.onchange = () => {
                      const file = inputEl.files?.[0];
                      if (file) {
                        // Validate and upload
                        if (file.size > MAX_FILE_SIZE) {
                          setError(
                            `Ukuran file terlalu besar. Maksimal ${formatFileSize(MAX_FILE_SIZE)}.`
                          );
                          setUploadingType(null);
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            const fileData = reader.result as string;
                            const res = await fetch('/api/seller/documents', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type,
                                fileName: file.name,
                                mimeType: file.type,
                                fileData,
                                fileSize: file.size,
                              }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setDocuments((prev) => [data.data, ...prev]);
                            } else {
                              setError(data.error || 'Gagal mengunggah dokumen');
                            }
                          } catch {
                            setError('Terjadi kesalahan saat mengunggah dokumen');
                          } finally {
                            setUploadingType(null);
                            inputEl.value = '';
                          }
                        };
                        reader.onerror = () => {
                          setError('Gagal membaca file');
                          setUploadingType(null);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setUploadingType(null);
                      }
                    };
                    inputEl.click();
                  } else {
                    setUploadingType(null);
                  }
                }}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}

        {/* Hidden file inputs for each document type (for new uploads) */}
        {docTypes.map((dt) => (
          <input
            key={`hidden-${dt.type}`}
            ref={(el) => {
              fileInputRefs.current[dt.type] = el;
            }}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
        ))}

        {/* Helper text */}
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/50 px-3.5 py-3">
          <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground/70 mb-0.5">Format yang didukung</p>
            <p>Gambar (JPG, PNG, GIF, WebP, SVG) dan dokumen PDF. Ukuran maksimal {formatFileSize(MAX_FILE_SIZE)} per file.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
