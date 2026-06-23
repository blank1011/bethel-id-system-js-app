import React, { useState } from 'react';
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
  const [openSection, setOpenSection] = useState('front');

  const update = (section, field, prop, value) => {
    onChange({
      ...layout,
      [section]: {
        ...layout[section],
        [field]: {
          ...layout[section][field],
          [prop]: Number(value),
        },
      },
    });
  };

  const fields = {
    front: [
      { key: 'name',        label: 'Name' },
      { key: 'lrn',         label: 'LRN' },
      { key: 'studentNo',   label: 'Student Number' },
    ],
    back: [
      { key: 'birthday',    label: 'Birthday' },
      { key: 'validity',    label: 'Validity' },
      { key: 'parents',     label: 'Parent Names' },
      { key: 'address',     label: 'Address' },
      { key: 'contacts',    label: 'Contact Numbers' },
    ],
  };

  const renderSection = (sectionKey) => (
    <div className="le-section">
      {fields[sectionKey].map(({ key, label }) => {
        const cfg = layout[sectionKey][key];
        return (
          <div key={key} className="le-field">
            <span className="le-field__label">{label}</span>
            <div className="le-field__controls">
              <label className="le-ctrl">
                <span>Top</span>
                <input
                  type="number"
                  value={cfg.top}
                  onChange={(e) => update(sectionKey, key, 'top', e.target.value)}
                />
                <span className="le-unit">px</span>
              </label>
              <label className="le-ctrl">
                <span>Left</span>
                <input
                  type="number"
                  value={cfg.left}
                  onChange={(e) => update(sectionKey, key, 'left', e.target.value)}
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
                  onChange={(e) => update(sectionKey, key, 'fontSize', e.target.value)}
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
      <div className="le-tabs">
        <button
          className={`le-tab${openSection === 'front' ? ' le-tab--active' : ''}`}
          onClick={() => setOpenSection('front')}
        >
          Front
        </button>
        <button
          className={`le-tab${openSection === 'back' ? ' le-tab--active' : ''}`}
          onClick={() => setOpenSection('back')}
        >
          Back
        </button>
      </div>
      {renderSection(openSection)}
    </div>
  );
}
