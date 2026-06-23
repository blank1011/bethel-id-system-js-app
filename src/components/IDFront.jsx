import React, { useRef, useEffect, useState } from 'react';
import './IDFront.css';

/**
 * Renders the FRONT side of the Bethel International School ID.
 * Props:
 *   student: { fname, mi, lname, lrn, studentNumber }
 *   frontTemplate: string (data URL of the front template image)
 *   layout: object — position/fontSize config from LayoutEditor
 */
export default function IDFront({ student, frontTemplate, layout }) {
  const nameRef = useRef(null);
  const lrnRef = useRef(null);

  const fullName = [student.fname, student.mi, student.lname]
    .filter(Boolean)
    .join(' ');

  const nameCfg    = layout?.name      || {};
  const lrnCfg     = layout?.lrn       || {};
  const studentCfg = layout?.studentNo || {};

  // Auto-shrink font size to fit the container
  useAutoFit(nameRef, fullName, nameCfg.fontSize || 30, 13);
  useAutoFit(lrnRef, student.lrn, lrnCfg.fontSize || 36, 16);

  return (
    <div className="id-front" id={`front-${student.lrn || student.studentNumber}`}>
      {frontTemplate && (
        <img
          src={frontTemplate}
          alt="ID Front Template"
          className="id-template-bg"
          crossOrigin="anonymous"
        />
      )}

      {/* Student Name */}
      <div
        className="id-front__name-block"
        style={{ top: nameCfg.top, left: nameCfg.left }}
      >
        <span ref={nameRef} className="id-front__name">
          {fullName || ''}
        </span>
      </div>

      {/* LRN */}
      <div
        className="id-front__lrn-block"
        style={{ top: lrnCfg.top, left: lrnCfg.left }}
      >
        <span ref={lrnRef} className="id-front__lrn">
          {student.lrn || ''}
        </span>
      </div>

      {/* Student Number */}
      <div
        className="id-front__studentno-block"
        style={{ bottom: studentCfg.top != null ? undefined : undefined, top: studentCfg.top, left: studentCfg.left }}
      >
        <span className="id-front__studentno" style={{ fontSize: studentCfg.fontSize }}>
          {student.studentNumber || ''}
        </span>
      </div>
    </div>
  );
}

/**
 * Hook: auto-reduces font size until text fits within its container.
 */
function useAutoFit(ref, text, maxSize, minSize) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = maxSize;
    el.style.fontSize = size + 'px';
    while (el.scrollWidth > el.offsetWidth && size > minSize) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
    }
  }, [text, ref, maxSize, minSize]);
}
