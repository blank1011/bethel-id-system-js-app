import { useRef, useEffect } from 'react';
import './IDFront.css';

const PHOTO_FRAME = { top: 133, left: 66, width: 222, height: 290 };

/**
 * Renders the FRONT side of the Bethel International School ID.
 * Props:
 *   student: { fname, mi, lname, lrn, studentNumber }
 *   frontTemplate: string (data URL of the front template image)
 *   layout: object — position/fontSize config from LayoutEditor
 */
export default function IDFront({ student, frontTemplate, layout, photoTransform, signatureImage }) {
  const nameRef = useRef(null);
  const lrnRef = useRef(null);
  const positionRef = useRef(null);

  const fullName = [student.fname, student.mi, student.lname]
    .filter(Boolean)
    .join(' ');

  const position = student.position || '';

  const nameCfg    = layout?.name      || {};
  const lrnCfg     = layout?.lrn       || {};
  const studentCfg = layout?.studentNo || {};
  const empCfg     = layout?.employeeNumber || {};
  const signCfg    = layout?.signature || {};
  const positionCfg = layout?.position || {};

  // Auto-shrink font size to fit the container
  useAutoFit(nameRef, fullName, nameCfg.fontSize || 30, 13);
  useAutoFit(lrnRef, student.lrn, lrnCfg.fontSize || 36, 16);
  useAutoFit(positionRef, position, positionCfg.fontSize || 18, 10);

  return (
    <div className="id-front" id={`front-${student.lrn || student.studentNumber || student.employeeNumber}`}>
      {frontTemplate && (
        <img
          src={frontTemplate}
          alt="ID Front Template"
          className="id-template-bg"
          crossOrigin="anonymous"
        />
      )}

      <div
        className={`id-front__photo${student.photoDataUrl ? '' : ' id-front__photo--empty'}`}
        style={{
          top: PHOTO_FRAME.top,
          left: PHOTO_FRAME.left,
          width: PHOTO_FRAME.width,
          height: PHOTO_FRAME.height,
        }}
      >
        {student.photoDataUrl && (
          <img
            src={student.photoDataUrl}
            alt="Student"
            className="id-front__photo-image"
            style={{
              transform: `translate(${photoTransform?.offsetX || 0}px, ${photoTransform?.offsetY || 0}px) scale(${photoTransform?.scale || 1})`,
            }}
          />
        )}
      </div>

      {/* Student Name */}
      <div
        className="id-front__name-block"
        style={{ top: nameCfg.top, left: nameCfg.left }}
      >
        <span ref={nameRef} className="id-front__name">
          {fullName || ''}
        </span>
        {student.role === 'teacher' && (
          <span ref={positionRef} className="id-front__position">{position}</span>
        )}
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

      {/* Teacher employee number and signature */}
      {student.role === 'teacher' && (
        <>
          <div
            className="id-front__employee-block"
            style={{ top: empCfg.top, left: empCfg.left }}
          >
            <span className="id-front__employee" style={{ fontSize: empCfg.fontSize }}>{student.employeeNumber || ''}</span>
          </div>

          {signatureImage && (
            <div className="id-front__signature" style={{ position: 'absolute', top: signCfg.top, left: signCfg.left }}>
              <img src={signatureImage} alt="Signature" style={{ maxWidth: 200 }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Hook: auto-reduces font size until text fits within its container.
 */
function useAutoFit(ref, text, maxSize, minSize) {
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
