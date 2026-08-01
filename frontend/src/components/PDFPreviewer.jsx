import React from 'react';

/**
 * Renders the server-generated preview PDF (already trimmed to N pages + watermarked)
 * inside an iframe. Using the browser's built-in PDF viewer avoids pulling in a heavy
 * client-side rendering library for the MVP; swap for react-pdf-viewer later if you
 * want in-app page controls, zoom, etc.
 */
export default function PDFPreviewer({ previewUrl, pageCount }) {
  if (!previewUrl) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-400">
        Preview unavailable
      </div>
    );
  }

  return (
    <div className="relative">
      <iframe
        title="Note preview"
        src={`${previewUrl}#toolbar=0`}
        className="w-full h-[520px] rounded-xl border border-gray-200 dark:border-gray-800"
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
        Preview only{pageCount ? ` · full note has ${pageCount} pages` : ''}
      </div>
    </div>
  );
}
