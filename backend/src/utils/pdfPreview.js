const { PDFDocument } = require('pdf-lib');

/**
 * Builds a preview-only PDF containing the first `pageCount` pages of the source buffer.
 * The full original file is never exposed publicly - only this trimmed copy is served
 * before purchase.
 *
 * @param {Buffer} sourceBuffer - the uploaded full PDF
 * @param {number} pageCount - how many leading pages to keep (default from env)
 * @returns {Promise<{ previewBuffer: Buffer, totalPages: number }>}
 */
async function buildPreviewPdf(sourceBuffer, pageCount = Number(process.env.PREVIEW_PAGE_COUNT) || 4) {
  const srcDoc = await PDFDocument.load(sourceBuffer);
  const totalPages = srcDoc.getPageCount();

  const previewDoc = await PDFDocument.create();
  const pagesToCopy = Math.min(pageCount, totalPages);
  const indices = Array.from({ length: pagesToCopy }, (_, i) => i);

  const copiedPages = await previewDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => previewDoc.addPage(page));

  // Stamp a simple watermark so preview pages aren't indistinguishable from the paid copy
  const { rgb, StandardFonts } = require('pdf-lib');
  const font = await previewDoc.embedFont(StandardFonts.HelveticaBold);
  previewDoc.getPages().forEach((page) => {
    const { width } = page.getSize();
    page.drawText('PREVIEW - NoteNest', {
      x: width / 2 - 90,
      y: 20,
      size: 14,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.6,
    });
  });

  const previewBytes = await previewDoc.save();
  return { previewBuffer: Buffer.from(previewBytes), totalPages };
}

module.exports = { buildPreviewPdf };
