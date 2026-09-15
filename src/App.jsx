import React, { useState, useRef } from 'react';
import IDFront from './components/IDFront';
import IDBack from './components/IDBack';
import LayoutEditor from './components/LayoutEditor';
import { parseExcel } from './utils/parseExcel';
import { exportToPngElectron, exportAllPngElectron, exportAllSidePngElectron } from './utils/electronExport';
import './App.css';

// ── Default layout config (top/left/fontSize in px) ──────────────────────────
const DEFAULT_LAYOUT = {
  front: {
    name:      { top: 184, left: 360, fontSize: 36 },
    lrn:       { top: 290, left: 360, fontSize: 36 },
    studentNo: { top: 443, left: 122, fontSize: 26 },
  },
  back: {
    birthday:  { top: 8,   left: 19,  fontSize: 32 },
    validity:  { top: -39, left: 443, fontSize: 32 },
    parents:   { top: 21,  left: 21,  fontSize: 27 },
    address:   { top: 27,  left: 21,  fontSize: 27 },
    contacts:  { top: 39,  left: 21,  fontSize: 27 },
  },
  teacher: {
    front: {
      name: { top: 199, left: 359, fontSize: 36 },
      position: { top: 225, left: 357, fontSize: 27 },
      employeeNumber: { top: 446, left: 116, fontSize: 28 },
      signature: { top: 420, left: 120, fontSize: 20 },
    },
    back: {
      birthday: { top: 4, left: 21, fontSize: 26 },
      guardianName: { top: 71, left: 31, fontSize: 24 },
      guardianAddress: { top: 136, left: 31, fontSize: 25 },
      contacts: { top: 217, left: 35, fontSize: 24 },
      tin: { top: -73, left: 457, fontSize: 20 },
      sss: { top: -97, left: 689, fontSize: 20 },
      philhealth: { top: -53, left: 455, fontSize: 20 },
      pagibig: { top: -76, left: 679, fontSize: 20 },
    },
  },
};

export default function App() {
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI);
  const [students, setStudents] = useState([]);
  const [mode, setMode] = useState('student'); // 'student' | 'teacher'
  const [frontTemplate, setFrontTemplate] = useState(null);
  const [backTemplate, setBackTemplate] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [teacherSignatureImage, setTeacherSignatureImage] = useState(null);
  const [validity, setValidity] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ done: 0, total: 0 });
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [photoTransform, setPhotoTransform] = useState({ scale: 1.45, offsetX: -7, offsetY: 55 });
  const [showEditor, setShowEditor] = useState(false);

  const frontRefs = useRef({});
  const backRefs = useRef({});

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStudents([]);
    setActiveIndex(0);
    setLoadError('');
    frontRefs.current = {};
    backRefs.current = {};
  };

  const loadImageFile = (file, setter) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsDataURL(file);
  };

  const updatePhotoTransform = (property, value) => {
    setPhotoTransform((current) => ({ ...current, [property]: Number(value) }));
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadError('');
    try {
      const data = await parseExcel(file);
      // Filter by currently selected mode
      const filtered = data.filter((r) => r.role === mode);
      if (filtered.length === 0) throw new Error(`No ${mode} records found in the file.`);
      setStudents(filtered);
      setActiveIndex(0);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleExportCurrent = async () => {
    if (!isElectron) {
      alert('Desktop export is available only in Electron. Start with: npm run dev');
      return;
    }
    const s = students[activeIndex];
    if (!s) return;
    const studentName = `${s.fname}${s.lname ? ' ' + s.lname : ''}`;
    setExporting(true);
    try {
      await exportToPngElectron(frontRefs.current[activeIndex], studentName, true, activeIndex + 1, students.length);
      await exportToPngElectron(backRefs.current[activeIndex], studentName, false, activeIndex + 1, students.length);
      alert(`${mode === 'teacher' ? 'Teacher' : 'Student'} ID exported successfully to ~/Pictures/Bethel ID Students/${studentName}/`);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (!isElectron) {
      alert('Desktop export is available only in Electron. Start with: npm run dev');
      return;
    }
    setExporting(true);
    setExportProgress({ done: 0, total: students.length * 2 });
    try {
      await exportAllPngElectron(
        students,
        (i) => frontRefs.current[i],
        (i) => backRefs.current[i],
        (done, total) => setExportProgress({ done, total }),
      );
      alert(`All ${mode === 'teacher' ? 'teacher' : 'student'} IDs exported successfully to ~/Pictures/Bethel ID Students/`);
    } catch (err) {
      alert(`Batch export failed: ${err.message}`);
    } finally {
      setExporting(false);
      setExportProgress({ done: 0, total: 0 });
    }
  };

  const handleExportAllFronts = async () => {
    if (!isElectron) {
      alert('Desktop export is available only in Electron. Start with: npm run dev');
      return;
    }
    setExporting(true);
    setExportProgress({ done: 0, total: students.length });
    try {
      await exportAllSidePngElectron(
        students,
        (i) => frontRefs.current[i],
        true,
        (done, total) => setExportProgress({ done, total }),
      );
      alert(`All fronts exported successfully to ~/Pictures/Bethel ID Students/Front/`);
    } catch (err) {
      alert(`Front export failed: ${err.message}`);
    } finally {
      setExporting(false);
      setExportProgress({ done: 0, total: 0 });
    }
  };

  const handleExportAllBacks = async () => {
    if (!isElectron) {
      alert('Desktop export is available only in Electron. Start with: npm run dev');
      return;
    }
    setExporting(true);
    setExportProgress({ done: 0, total: students.length });
    try {
      await exportAllSidePngElectron(
        students,
        (i) => backRefs.current[i],
        false,
        (done, total) => setExportProgress({ done, total }),
      );
      alert(`All backs exported successfully to ~/Pictures/Bethel ID Students/Back/`);
    } catch (err) {
      alert(`Back export failed: ${err.message}`);
    } finally {
      setExporting(false);
      setExportProgress({ done: 0, total: 0 });
    }
  };

  const handleClearAll = () => {
    if (exporting) return;

    setStudents([]);
    setFrontTemplate(null);
    setBackTemplate(null);
    setSignatureImage(null);
    setTeacherSignatureImage(null);
    setValidity('');
    setActiveIndex(0);
    setLoadError('');
    setExportProgress({ done: 0, total: 0 });
    setLayout(DEFAULT_LAYOUT);
    setPhotoTransform({ scale: 1.45, offsetX: -7, offsetY: 55 });
    setShowEditor(false);
    frontRefs.current = {};
    backRefs.current = {};
  };

  const currentStudent = students[activeIndex];

  return (
    <div className="app">
      {/* ── SIDEBAR ───────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar__logo">
          <span className="sidebar__logo-title">Bethel ID</span>
          <span className="sidebar__logo-sub">Automation Tool</span>
        </div>

        {/* ══════════════════════════════════════
            AUTOMATE CONTROLS
            ══════════════════════════════════════ */}
        <div className="sidebar__group">
          <h2 className="sidebar__group-title">Automate Controls</h2>

          <section className="sidebar__section">
            <h3 className="sidebar__section-title">Mode</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button className={`file-btn file-btn--sm ${mode === 'student' ? 'active' : ''}`} onClick={() => handleModeChange('student')} type="button">Students</button>
              <button className={`file-btn file-btn--sm ${mode === 'teacher' ? 'active' : ''}`} onClick={() => handleModeChange('teacher')} type="button">Teachers</button>
            </div>
            <h3 className="sidebar__section-title">1. Load Excel File</h3>
            <label className="file-btn">
              <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} hidden />
              Choose Excel File
            </label>
            {students.length > 0 && (
              <button
                className="file-btn file-btn--sm"
                style={{ marginTop: 8 }}
                onClick={handleClearAll}
                disabled={exporting}
                type="button"
              >
                Clear Loaded Batch
              </button>
            )}
            {loadError && <p className="error-msg">{loadError}</p>}
            {students.length > 0 && (
              <p className="success-msg">{students.length} {mode === 'teacher' ? 'teacher(s)' : 'student(s)'} loaded</p>
            )}
          </section>

          <section className="sidebar__section">
            <h3 className="sidebar__section-title">2. Load Templates</h3>
            <label className="sidebar__label">Front Template</label>
            <label className="file-btn file-btn--sm">
              <input type="file" accept="image/*"
                onChange={(e) => e.target.files[0] && loadImageFile(e.target.files[0], setFrontTemplate)} hidden />
              {frontTemplate ? '✓ Front loaded' : 'Choose front image'}
            </label>
            <label className="sidebar__label" style={{ marginTop: 8 }}>Back Template</label>
            <label className="file-btn file-btn--sm">
              <input type="file" accept="image/*"
                onChange={(e) => e.target.files[0] && loadImageFile(e.target.files[0], setBackTemplate)} hidden />
              {backTemplate ? '✓ Back loaded' : 'Choose back image'}
            </label>
          </section>

          <section className="sidebar__section">
            <h3 className="sidebar__section-title">3. Settings</h3>
            <label className="sidebar__label">Validity (e.g. July 2028)</label>
            <input className="sidebar__input" type="text" placeholder="e.g. July 2028"
              value={validity} onChange={(e) => setValidity(e.target.value)} />
            <label className="sidebar__label" style={{ marginTop: 8 }}>Principal Signature (optional)</label>
            <label className="file-btn file-btn--sm">
              <input type="file" accept="image/*"
                onChange={(e) => e.target.files[0] && loadImageFile(e.target.files[0], setSignatureImage)} hidden />
              {signatureImage ? '✓ Signature loaded' : 'Choose signature image'}
            </label>
            {mode === 'teacher' && (
              <>
                <label className="sidebar__label" style={{ marginTop: 8 }}>Teacher Signature (optional)</label>
                <label className="file-btn file-btn--sm">
                  <input type="file" accept="image/*"
                    onChange={(e) => e.target.files[0] && loadImageFile(e.target.files[0], setTeacherSignatureImage)} hidden />
                  {teacherSignatureImage ? '✓ Teacher signature' : 'Choose teacher signature'}
                </label>
              </>
            )}
          </section>

          <section className="sidebar__section">
            <div className="sidebar__section-header">
              <h3 className="sidebar__section-title" style={{ margin: 0 }}>4. Adjust Positions</h3>
              <button className="toggle-btn" onClick={() => setShowEditor(v => !v)}>
                {showEditor ? 'Hide' : 'Show'}
              </button>
            </div>
            {showEditor && (
              <>
                <div className="photo-adjustment">
                  <h4 className="sidebar__section-title">Photo Crop</h4>
                  <p className="sidebar__label">The crop frame is fixed. Adjust the image inside it.</p>
                  <label className="sidebar__label">Zoom</label>
                  <input
                    className="sidebar__range"
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={photoTransform.scale}
                    onChange={(e) => updatePhotoTransform('scale', e.target.value)}
                  />
                  <span className="photo-adjustment__value">{photoTransform.scale.toFixed(2)}x</span>
                  <div className="photo-adjustment__row">
                    <label className="sidebar__label">Horizontal
                      <input className="sidebar__input" type="number" value={photoTransform.offsetX} onChange={(e) => updatePhotoTransform('offsetX', e.target.value)} />
                    </label>
                    <label className="sidebar__label">Vertical
                      <input className="sidebar__input" type="number" value={photoTransform.offsetY} onChange={(e) => updatePhotoTransform('offsetY', e.target.value)} />
                    </label>
                  </div>
                  <button
                    className="file-btn file-btn--sm"
                    style={{ marginTop: 8 }}
                    onClick={() => setPhotoTransform({ scale: 1.45, offsetX: -7, offsetY: 55 })}
                    type="button"
                  >
                    Reset photo adjustments
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <LayoutEditor layout={layout} onChange={setLayout} />
                </div>
                <button
                  className="file-btn file-btn--sm"
                  style={{ marginTop: 8 }}
                  onClick={() => setLayout(DEFAULT_LAYOUT)}
                >
                  Reset to defaults
                </button>
              </>
            )}
          </section>
        </div>

        {/* ══════════════════════════════════════
            RECORDS
            ══════════════════════════════════════ */}
        <div className="sidebar__group">
          <h2 className="sidebar__group-title">Records</h2>

          {students.length > 0 && (
            <section className="sidebar__section sidebar__section--scroll">
              <h3 className="sidebar__section-title">{mode === 'teacher' ? 'Teachers' : 'Students'}</h3>
              <ul className="student-list">
                {students.map((s, i) => (
                  <li key={i}
                    className={`student-list__item${i === activeIndex ? ' student-list__item--active' : ''}`}
                    onClick={() => setActiveIndex(i)}>
                    <span className="student-list__num">{i + 1}</span>
                    <span className="student-list__name">
                      {[s.lname, s.fname].filter(Boolean).join(', ') || `${mode === 'teacher' ? 'Teacher' : 'Student'} ${i + 1}`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {students.length > 0 && (
            <section className="sidebar__section sidebar__actions">
              {!isElectron && (
                <p className="error-msg" style={{ marginBottom: 8 }}>
                  Export requires Electron mode.
                </p>
              )}
              <button className="export-btn export-btn--primary" onClick={handleExportCurrent} disabled={exporting || !isElectron}>
                Export Current {mode === 'teacher' ? 'Teacher' : 'Student'}
              </button>
              <button className="export-btn export-btn--secondary" onClick={handleExportAll} disabled={exporting || !isElectron}>
                Export ALL {mode === 'teacher' ? 'Teachers' : 'Students'}
              </button>
              <button className="export-btn export-btn--secondary" onClick={handleExportAllFronts} disabled={exporting || !isElectron}>
                Export ALL Fronts
              </button>
              <button className="export-btn export-btn--secondary" onClick={handleExportAllBacks} disabled={exporting || !isElectron}>
                Export ALL Backs
              </button>
              {exporting && exportProgress.total > 0 && (
                <p className="export-progress">Exporting {exportProgress.done} / {exportProgress.total}...</p>
              )}
            </section>
          )}
        </div>
      </aside>

      {/* ── MAIN PREVIEW ─────────────────── */}
      <main className="preview-area">
        {students.length === 0 ? (
          <div className="empty-state">
            <p>Load an Excel file to get started.</p>
            <p className="empty-state__sub">
              Required columns: <code>Fname</code>, <code>Lname</code>, <code>Mname</code>,{' '}
              <code>Student Number</code>, <code>LRN</code>, <code>Birthday</code>,{' '}
              <code>Father</code>, <code>Mother</code>, <code>Address</code>,{' '}
              <code>Contact Father</code>, <code>Contact Mother</code>
            </p>
          </div>
        ) : (
          <>
            {currentStudent && (
              <div className="preview-pair">
                <div className="preview-label">Front</div>
                <div ref={(el) => { if (el) frontRefs.current[activeIndex] = el; }}>
                  <IDFront student={currentStudent} frontTemplate={frontTemplate} layout={mode === 'teacher' ? layout.teacher.front : layout.front} photoTransform={photoTransform} signatureImage={mode === 'teacher' ? teacherSignatureImage : undefined} />
                </div>

                <div className="preview-label" style={{ marginTop: 24 }}>Back</div>
                <div ref={(el) => { if (el) backRefs.current[activeIndex] = el; }}>
                  <IDBack student={currentStudent} validity={validity}
                    backTemplate={backTemplate} signatureImage={mode === 'teacher' ? teacherSignatureImage : signatureImage} layout={mode === 'teacher' ? layout.teacher.back : layout.back} />
                </div>
              </div>
            )}

            <div className="hidden-renders" aria-hidden="true">
              {students.map((s, i) => {
                if (i === activeIndex) return null;
                return (
                  <React.Fragment key={i}>
                    <div ref={(el) => { if (el) frontRefs.current[i] = el; }}>
                      <IDFront student={s} frontTemplate={frontTemplate} layout={mode === 'teacher' ? layout.teacher.front : layout.front} photoTransform={photoTransform} signatureImage={mode === 'teacher' ? teacherSignatureImage : undefined} />
                    </div>
                    <div ref={(el) => { if (el) backRefs.current[i] = el; }}>
                      <IDBack student={s} validity={validity}
                        backTemplate={backTemplate} signatureImage={mode === 'teacher' ? teacherSignatureImage : signatureImage} layout={mode === 'teacher' ? layout.teacher.back : layout.back} />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

