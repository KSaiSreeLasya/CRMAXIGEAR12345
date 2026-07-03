import { Download } from 'lucide-react';

interface Document {
  base64: string;
  name: string;
  type: string;
}

interface DocumentPreviewerProps {
  doc: Document | null;
}

export function DocumentPreviewer({ doc }: DocumentPreviewerProps) {
  if (!doc) {
    return (
      <p className="text-gray-400 text-xs italic">
        Missing compliance document from branch.
      </p>
    );
  }

  // Handle both string and object formats for base64
  let base64Data = typeof doc.base64 === 'string'
    ? doc.base64
    : (doc.base64 as any)?.fileData || null;

  if (!base64Data) {
    return (
      <p className="text-gray-400 text-xs italic">
        Missing compliance document from branch.
      </p>
    );
  }

  // Check if document is a PDF
  const isPdf = base64Data.startsWith('data:application/pdf') || doc.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-xs text-gray-700">{doc.name}</span>
        <a
          href={base64Data}
          download={doc.name}
          className="text-[11px] bg-emerald-700 text-white font-bold px-2 py-1 rounded hover:bg-emerald-800 transition flex items-center gap-1"
        >
          <Download className="h-3 w-3" />
          Download
        </a>
      </div>

      <div className="w-full h-[350px] bg-white rounded-lg flex items-center justify-center overflow-hidden border">
        {isPdf ? (
          <iframe
            src={base64Data}
            className="w-full h-full"
            title="compliance-pdf-preview"
          />
        ) : (
          <img
            src={base64Data}
            alt={doc.name}
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </div>
  );
}
