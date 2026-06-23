import ExcelJS from 'exceljs';

/**
 * Parse an uploaded Excel file and return an array of student objects.
 * Expected columns (case-insensitive, trimmed):
 *   Fname, Lname, Mname, Student Number, LRN, Birthday,
 *   Father, Mother, Address, Contact Father, Contact Mother
 */
export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('No worksheet found in the Excel file.');

  // Read header row (row 1)
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim().toLowerCase();
  });

  const normalize = (key) => key.trim().toLowerCase();

  const students = [];

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
    if (values.length === 0) return;

    const get = (keys) => {
      for (const k of keys) {
        if (rowData[normalize(k)] !== undefined && rowData[normalize(k)] !== '') {
          return rowData[normalize(k)];
        }
      }
      return '';
    };

    const fname = get(['fname', 'first name', 'firstname']);
    const lname = get(['lname', 'last name', 'lastname']);
    const mname = get(['mname', 'middle name', 'middlename']);

    // Convert middle name to initial
    const mi = mname ? mname.charAt(0).toUpperCase() + '.' : '';

    students.push({
      fname,
      lname,
      mname,
      mi,
      studentNumber: get(['student number', 'studentnumber', 'student no', 'student no.']),
      lrn: get(['lrn']),
      birthday: get(['birthday', 'birthdate', 'birth date']),
      father: get(['father', "father's name"]),
      mother: get(['mother', "mother's name"]),
      address: get(['address', "parent's address", 'parents address']),
      contactFather: get(['contact father', 'contact no father', 'contact number father', 'father contact']),
      contactMother: get(['contact mother', 'contact no mother', 'contact number mother', 'mother contact']),
    });
  });

  return students;
}
