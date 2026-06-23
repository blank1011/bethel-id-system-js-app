/**
 * Export a DOM element as a PNG file.
 * Uses html-to-image under the hood.
 *
 * @param {HTMLElement} element - The element to capture
 * @param {string} filename - Output filename (without extension)
 * @param {object} options - html-to-image options (e.g. { pixelRatio: 2 })
 */
import { toPng } from 'html-to-image';

export async function exportToPng(element, filename, options = {}) {
  if (!element) throw new Error('Element not found for export.');

  const dataUrl = await toPng(element, {
    pixelRatio: 2, // 2x for higher print quality
    cacheBust: true,
    ...options,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Export all student IDs (front + back) as individual PNG files.
 * @param {Array} students - Array of student objects
 * @param {Function} getFrontEl - (index) => HTMLElement for front
 * @param {Function} getBackEl - (index) => HTMLElement for back
 * @param {Function} onProgress - (current, total) => void
 */
export async function exportAllToPng(students, getFrontEl, getBackEl, onProgress) {
  const total = students.length * 2;
  let done = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const safeName = `${s.lname}_${s.fname}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    const frontEl = getFrontEl(i);
    if (frontEl) {
      await exportToPng(frontEl, `${safeName}_FRONT`);
      done++;
      onProgress?.(done, total);
    }

    const backEl = getBackEl(i);
    if (backEl) {
      await exportToPng(backEl, `${safeName}_BACK`);
      done++;
      onProgress?.(done, total);
    }

    // Small delay to avoid browser tab throttling on large batches
    await new Promise((r) => setTimeout(r, 120));
  }
}
