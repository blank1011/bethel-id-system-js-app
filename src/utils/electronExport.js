import { toPng } from 'html-to-image';

/**
 * Export a single student ID card (front or back) to PNG via Electron IPC
 */
export async function exportToPngElectron(element, studentName, isFront) {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  try {
    // Generate PNG from DOM element
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      quality: 0.95,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    // Send to Electron main process for file system write
    const side = isFront ? 'FRONT' : 'BACK';
    const result = await window.electronAPI.savePng(dataUrl, studentName, side);

    if (!result.success) {
      throw new Error(`Failed to save file: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw error;
  }
}

/**
 * Export all student ID cards in batch via Electron IPC
 */
export async function exportAllPngElectron(students, getFrontEl, getBackEl, onProgress) {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  const files = [];

  // Generate all PNG data URLs first
  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    try {
      const frontEl = getFrontEl(i);
      const backEl = getBackEl(i);

      if (!frontEl || !backEl) {
        console.warn(`Could not get elements for student ${i}`);
        onProgress?.(i + 1, students.length);
        continue;
      }

      // Generate front card
      const frontDataUrl = await toPng(frontEl, {
        pixelRatio: 2,
        quality: 0.95,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      files.push({
        dataUrl: frontDataUrl,
        studentName: `${student.fname}${student.lname ? ' ' + student.lname : ''}`,
        isFront: true,
      });

      // Generate back card
      const backDataUrl = await toPng(backEl, {
        pixelRatio: 2,
        quality: 0.95,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      files.push({
        dataUrl: backDataUrl,
        studentName: `${student.fname}${student.lname ? ' ' + student.lname : ''}`,
        isFront: false,
      });

      onProgress?.(i + 1, students.length);

      // Add delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 120));
    } catch (error) {
      console.error(`Error processing student ${i}:`, error);
      onProgress?.(i + 1, students.length);
    }
  }

  // Send all files to Electron in batch
  try {
    const results = await window.electronAPI.savePngsBatch(files);
    return results;
  } catch (error) {
    console.error('Error batch saving PNGs:', error);
    throw error;
  }
}
