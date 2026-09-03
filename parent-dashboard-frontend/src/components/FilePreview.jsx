import { FileText } from "lucide-react";

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FilePreview({ file, url }) {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex items-center gap-2 border-b border-line bg-surface-sunk px-3 py-2 text-xs text-ink-soft">
        <span className="truncate font-medium text-ink">{file.name}</span>
        <span className="shrink-0 text-ink-faint">{fmtSize(file.size)}</span>
      </div>

      {isImage ? (
        <img
          src={url}
          alt={file.name}
          className="mx-auto max-h-80 w-auto bg-surface-sunk object-contain"
        />
      ) : isPdf ? (
        <iframe
          title={`Preview of ${file.name}`}
          src={url}
          className="h-96 w-full bg-surface-sunk"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 bg-surface-sunk px-6 py-10 text-center">
          <FileText size={22} className="text-ink-faint" strokeWidth={1.75} />
          <p className="text-sm text-ink-soft">
            No preview for this file type — it will still upload fine.
          </p>
        </div>
      )}
    </div>
  );
}
