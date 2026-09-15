import { useState } from 'react';
import './LayoutEditor.css';

/**
 * A panel that lets the user tune top/left/fontSize for every
 * dynamic field on both the front and back of the ID.
 *
 * Props:
 *   layout: object  — current layout config
 *   onChange: (newLayout) => void
 */
export default function LayoutEditor({ layout, onChange }) {
  const [entity, setEntity] = useState('student'); // 'student' or 'teacher'
  const [side, setSide] = useState('front');

  const fields = {
    student: {
      front: [
        { key: 'name', label: 'Name' },
        { key: 'lrn', label: 'LRN' },
        { key: 'studentNo', label: 'Student Number' },
      ],
      back: [
        { key: 'birthday', label: 'Birthday' },
        { key: 'validity', label: 'Validity' },
        { key: 'parents', label: "Parent Names" },
        { key: 'address', label: 'Address' },
        { key: 'contacts', label: 'Contact Numbers' },
      ],
    },
    teacher: {
      front: [
        { key: 'name', label: 'Name' },
        { key: 'position', label: 'Position' },
        { key: 'employeeNumber', label: 'Employee Number' },
        { key: 'signature', label: 'Signature' },
      ],
      back: [
        { key: 'birthday', label: 'Birthdate' },
        { key: 'guardianName', label: 'Guardian Name' },
        { key: 'guardianAddress', label: 'Guardian Address' },
        { key: 'contacts', label: 'Contact Numbers' },
        { key: 'tin', label: 'BIR TIN' },
        { key: 'sss', label: 'SSS Number' },
        { key: 'philhealth', label: 'PhilHealth Number' },
        { key: 'pagibig', label: 'Pag-Ibig Number' },
      ],
    },
  };

  const getCfg = (entityKey, sideKey, fieldKey) => {
    if (entityKey === 'student') return layout?.[sideKey]?.[fieldKey] ?? { top: 0, left: 0, fontSize: 16 };
    return layout?.teacher?.[sideKey]?.[fieldKey] ?? { top: 0, left: 0, fontSize: 16 };
  };

  const update = (entityKey, sideKey, field, prop, value) => {
    const v = Number(value);
    const newLayout = { ...layout };
    if (entityKey === 'student') {
      newLayout[sideKey] = { ...newLayout[sideKey], [field]: { ...(newLayout[sideKey]?.[field] || {}), [prop]: v } };
    } else {
      newLayout.teacher = { ...(newLayout.teacher || {}) };
      newLayout.teacher[sideKey] = { ...(newLayout.teacher[sideKey] || {}), [field]: { ...(newLayout.teacher[sideKey]?.[field] || {}), [prop]: v } };
    }
    onChange(newLayout);
  };

  const renderSection = (entityKey, sideKey) => (
    <div className="le-section">
      {fields[entityKey][sideKey].map(({ key, label }) => {
        const cfg = getCfg(entityKey, sideKey, key);
        return (
          <div key={key} className="le-field">
            <span className="le-field__label">{label}</span>
            <div className="le-field__controls">
              <label className="le-ctrl">
                <span>Top</span>
                <input
                  type="number"
                  value={cfg.top}
                  onChange={(e) => update(entityKey, sideKey, key, 'top', e.target.value)}
                />
                <span className="le-unit">px</span>
              </label>
              <label className="le-ctrl">
                <span>Left</span>
                <input
                  type="number"
                  value={cfg.left}
                  onChange={(e) => update(entityKey, sideKey, key, 'left', e.target.value)}
                />
                <span className="le-unit">px</span>
              </label>
              <label className="le-ctrl">
                <span>Size</span>
                <input
                  type="number"
                  value={cfg.fontSize}
                  min={8}
                  max={72}
                  onChange={(e) => update(entityKey, sideKey, key, 'fontSize', e.target.value)}
                />
                <span className="le-unit">px</span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="layout-editor">
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className={`le-tab${entity === 'student' ? ' le-tab--active' : ''}`} onClick={() => setEntity('student')}>Student</button>
        <button className={`le-tab${entity === 'teacher' ? ' le-tab--active' : ''}`} onClick={() => setEntity('teacher')}>Teacher</button>
      </div>
      <div className="le-tabs">
        <button className={`le-tab${side === 'front' ? ' le-tab--active' : ''}`} onClick={() => setSide('front')}>Front</button>
        <button className={`le-tab${side === 'back' ? ' le-tab--active' : ''}`} onClick={() => setSide('back')}>Back</button>
      </div>
      {renderSection(entity, side)}
    </div>
  );
}
