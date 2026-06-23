import React, { useState, useRef } from 'react';
import IDFront from './components/IDFront';
import IDBack from './components/IDBack';
import LayoutEditor from './components/LayoutEditor';
import { parseExcel } from './utils/parseExcel';
import { exportToPngElectron, exportAllPngElectron } from './utils/electronExport';
import './App.css';

// ── Default layout config (top/left/fontSize in px) ──────────────────────────
const DEFAULT_LAYOUT = {
  front: {
    name:      { top: 184, left: 360, fontSize: 36 },
    lrn:       { top: 310, left: 360, fontSize: 36 },
    studentNo: { top: 443, left: 122, fontSize: 26 },
  },
  back: {
    birthday:  { top: 8,   left: 26,  fontSize: 23 },
    validity:  { top: -39, left: 410, fontSize: 23 },
    parents:   { top: 21,  left: 21,  fontSize: 19 },
    address:   { top: 40,  left: 21,  fontSize: 23 },
    contacts:  { top: 69,  left: 21,  fontSize: 22 },
  },
};

export default function App() {
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI);
  const [students, setStudents] = useState([]);
  const [frontTemplate, setFrontTemplate] = useState(null);
  const [backTemplate, setBackTemplate] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [validity, setValidity] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ done: 0, total: 0 });
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [showEditor, setShowEditor] = useState(false);

  const frontRefs = useRef({});
  const backRefs = useRef({});

  const loadImageFile = (file, setter) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadError('');
    try {
      const data = await parseExcel(file);
      if (data.length === 0) throw new Error('No student records found in the file.');
      setStudents(data);
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
      await exportToPngElectron(frontRefs.current[activeIndex], studentName, true);
      await exportToPngElectron(backRefs.current[activeIndex], studentName, false);
      // Show success notification (or you can add toast notification here)
      alert(`Student ID exported successfully to ~/Pictures/Bethel ID Students/${studentName}/`);
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
    setExportProgress({ done: 0, total: students.length });
    try {
      await exportAllPngElectron(
        students,
        (i) => frontRefs.current[i],
        (i) => backRefs.current[i],
        (done, total) => setExportProgress({ done, total }),
      );
      alert(`All student IDs exported successfully to ~/Pictures/Bethel ID Students/`);
    } catch (err) {
      alert(`Batch export failed: ${err.message}`);
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
    setValidity('');
    setActiveIndex(0);
    setLoadError('');
    setExportProgress({ done: 0, total: 0 });
    setLayout(DEFAULT_LAYOUT);
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
              <p className="success-msg">{students.length} student(s) loaded</p>
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
              <h3 className="sidebar__section-title">Students</h3>
              <ul className="student-list">
                {students.map((s, i) => (
                  <li key={i}
                    className={`student-list__item${i === activeIndex ? ' student-list__item--active' : ''}`}
                    onClick={() => setActiveIndex(i)}>
                    <span className="student-list__num">{i + 1}</span>
                    <span className="student-list__name">
                      {[s.lname, s.fname].filter(Boolean).join(', ') || `Student ${i + 1}`}
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
                Export Current Student
              </button>
              <button className="export-btn export-btn--secondary" onClick={handleExportAll} disabled={exporting || !isElectron}>
                Export ALL Students
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
                  <IDFront student={currentStudent} frontTemplate={frontTemplate} layout={layout.front} />
                </div>

                <div className="preview-label" style={{ marginTop: 24 }}>Back</div>
                <div ref={(el) => { if (el) backRefs.current[activeIndex] = el; }}>
                  <IDBack student={currentStudent} validity={validity}
                    backTemplate={backTemplate} signatureImage={signatureImage} layout={layout.back} />
                </div>
              </div>
            )}

            <div className="hidden-renders" aria-hidden="true">
              {students.map((s, i) => {
                if (i === activeIndex) return null;
                return (
                  <React.Fragment key={i}>
                    <div ref={(el) => { if (el) frontRefs.current[i] = el; }}>
                      <IDFront student={s} frontTemplate={frontTemplate} layout={layout.front} />
                    </div>
                    <div ref={(el) => { if (el) backRefs.current[i] = el; }}>
                      <IDBack student={s} validity={validity}
                        backTemplate={backTemplate} signatureImage={signatureImage} layout={layout.back} />
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

