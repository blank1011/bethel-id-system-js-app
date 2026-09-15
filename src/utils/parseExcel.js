import ExcelJS from 'exceljs';

/**
 * Parse an uploaded Excel file and return an array of student objects.
 * Expected columns (case-insensitive, trimmed):
 *   Fname, Lname, Mname, Student Number, LRN, Birthday,
 *   Father, Mother, Address, Contact Father, Contact Mother, Photo
 */
export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const normalize = (key) => key.trim().toLowerCase();
  const records = [];

  const imageToDataUrl = (image) => {
    if (!image?.buffer) return '';
    const bytes = image.buffer instanceof ArrayBuffer
      ? new Uint8Array(image.buffer)
      : image.buffer;
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const base64 = btoa(binary);
    const extension = image.extension === 'jpeg' ? 'jpg' : (image.extension || 'png');
    return `data:image/${extension};base64,${base64}`;
  };

  for (const worksheet of workbook.worksheets) {
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? '').trim().toLowerCase();
    });

    const photoColumns = headers
      .map((header, colNumber) => ({ header, colNumber }))
      .filter(({ header }) => ['photo', 'picture', 'image'].includes(header))
      .map(({ colNumber }) => colNumber);
    const worksheetImages = new Map();
    for (const imageRef of worksheet.getImages()) {
      const rowNumber = Math.floor(imageRef.range.tl.row) + 1;
      const imageColumn = Math.floor(imageRef.range.tl.col) + 1;
      if (photoColumns.length === 0 || photoColumns.includes(imageColumn)) {
        const image = workbook.getImage(imageRef.imageId);
        const photoDataUrl = imageToDataUrl(image);
        if (photoDataUrl && !worksheetImages.has(rowNumber)) {
          worksheetImages.set(rowNumber, photoDataUrl);
        }
      }
    }

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          // Handle dates stored as Date objects
          let val = cell.value;
          if (val instanceof Date) {
            // Format as Month Day, Year
            val = val.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          } else if (val && typeof val === 'object' && val.text) {
            val = val.text; // rich text
          } else {
            val = val !== null && val !== undefined ? String(val).trim() : '';
          }
          rowData[header] = val;
        }
      });

      // Skip completely empty rows
      const values = Object.values(rowData).filter((v) => v !== '');
      const photoDataUrl = worksheetImages.get(rowNumber) || '';
      if (values.length === 0 && !photoDataUrl) return;

      const get = (keys) => {
        for (const k of keys) {
          if (rowData[normalize(k)] !== undefined && rowData[normalize(k)] !== '') {
            return rowData[normalize(k)];
          }
        }
        return '';
      };

      const fname = get(['fname', 'first name', 'firstname', 'name']);
      const lname = get(['lname', 'last name', 'lastname']);
      const mname = get(['mname', 'middle name', 'middlename']);

      // Convert middle name to initial
      const mi = mname ? mname.charAt(0).toUpperCase() + '.' : '';

      // Detect teacher vs student by presence of employee number / SSS / TIN headers
      const empNo = get(['employee number', 'emp number', 'employeenumber', 'emp no', 'employee no', 'employee#', 'empnumber']);
      const sss = get(['sss', 'sss number', 'sss#']);
      const tin = get(['tin', 'bir tin', 'bir', 'tin number']);

      if (empNo || sss || tin) {
        // Teacher record
        records.push({
          role: 'teacher',
          fname,
          lname,
          mname,
          mi,
          photoDataUrl,
          employeeNumber: empNo,
          position: get(['position', 'job title', 'designation', 'role']),
          birthday: get(['birthday', 'birthdate', 'birth date']),
          guardianName: get(['guardian', 'guardian name', 'emergency contact', 'guardian name(s)']),
          guardianAddress: get(['guardian address', 'guardians address', 'address']),
          contacts: get(['contact', 'contact numbers', 'contact number(s)', 'contact number', 'contact no']),
          tin,
          sss,
          philhealth: get(['philhealth', 'philhealth number', 'phil health']),
          pagibig: get(['pag-ibig', 'pagibig', 'pag ibig', 'pagibig number']),
        });
      } else {
        // Student record
        records.push({
          role: 'student',
          fname,
          lname,
          mname,
          mi,
          photoDataUrl,
          studentNumber: get(['student number', 'studentnumber', 'student no', 'student no.']),
          lrn: get(['lrn']),
          birthday: get(['birthday', 'birthdate', 'birth date']),
          father: get(['father', "father's name"]),
          mother: get(['mother', "mother's name"]),
          address: get(['address', "parent's address", 'parents address']),
          contactFather: get(['contact father', 'contact no father', 'contact number father', 'father contact']),
          contactMother: get(['contact mother', 'contact no mother', 'contact number mother', 'mother contact']),
        });
      }
    });
  }

  if (workbook.worksheets.length === 0) throw new Error('No worksheet found in the Excel file.');

  return records;
}
