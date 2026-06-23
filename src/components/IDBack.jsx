import React from 'react';
import './IDBack.css';

/**
 * Renders the BACK side of the Bethel International School ID.
 *
 * When backTemplate is provided:
 *   → Template is the full background. Only dynamic data is overlaid.
 *     All labels, IMPORTANT text, signature, etc. are already in the template image.
 *
 * When no backTemplate:
 *   → Full HTML/CSS layout is rendered (useful for previewing without template).
 */
export default function IDBack({ student, validity, backTemplate, signatureImage, layout }) {
  const parentNames = [student.father, student.mother].filter(Boolean);
  const contacts = [student.contactFather, student.contactMother].filter(Boolean);

  const ov = (key) => {
    const cfg = layout?.[key] || {};
    return {
      top:      cfg.top      != null ? cfg.top      : undefined,
      left:     cfg.left     != null ? cfg.left     : undefined,
      fontSize: cfg.fontSize != null ? cfg.fontSize : undefined,
    };
  };

  // ── TEMPLATE MODE: only overlay data values ──────────────────────────────
  if (backTemplate) {
    return (
      <div className="id-back id-back--template-mode" id={`back-${student.lrn || student.studentNumber}`}>
        <img
          src={backTemplate}
          alt="ID Back Template"
          className="id-template-bg"
          crossOrigin="anonymous"
        />

        {/* Birthday value */}
        <div className="id-back__ov id-back__ov--birthday" style={ov('birthday')}>
          {student.birthday || ''}
        </div>

        {/* Validity value */}
        <div className="id-back__ov id-back__ov--validity" style={ov('validity')}>
          {validity ? `Until ${validity}` : ''}
        </div>

        {/* Parent names */}
        <div className="id-back__ov id-back__ov--parents" style={ov('parents')}>
          {parentNames.map((name, i) => (
            <span key={i} className="id-back__ov-line">{name}</span>
          ))}
          <span className="id-back__ov-label">Parent's Name(s)</span>
        </div>

        {/* Address */}
        <div className="id-back__ov id-back__ov--address" style={ov('address')}>
          <span className="id-back__ov-line">{student.address || ''}</span>
          <span className="id-back__ov-label">Parent's Address</span>
        </div>

        {/* Contact numbers */}
        <div className="id-back__ov id-back__ov--contacts" style={ov('contacts')}>
          {contacts.map((c, i) => (
            <span key={i} className="id-back__ov-line">{c}</span>
          ))}
          <span className="id-back__ov-label">Contact Number(s)</span>
        </div>
      </div>
    );
  }

  // ── NO-TEMPLATE MODE: full HTML layout ───────────────────────────────────
  return (
    <div className="id-back" id={`back-${student.lrn || student.studentNumber}`}>
      {/* Top row: Birthdate | Validity */}
      <div className="id-back__top-row">
        <div className="id-back__top-cell">
          <span className="id-back__top-value">{student.birthday || ''}</span>
          <span className="id-back__top-label">Birthdate</span>
        </div>
        <div className="id-back__top-cell id-back__top-cell--right">
          <span className="id-back__top-value">Until {validity || ''}</span>
          <span className="id-back__top-label">Validity</span>
        </div>
      </div>

      {/* Emergency contact section */}
      <div className="id-back__emergency-section">
        <div className="id-back__emergency-left">
          <span className="id-back__notify-label">Notify in case of emergency:</span>

          <div className="id-back__field-group">
            {parentNames.map((name, i) => (
              <span key={i} className="id-back__field-value">{name}</span>
            ))}
            <span className="id-back__field-label">Parent's Name(s)</span>
          </div>

          <div className="id-back__field-group">
            <span className="id-back__field-value">{student.address || ''}</span>
            <span className="id-back__field-label">Parent's Address</span>
          </div>

          <div className="id-back__field-group">
            {contacts.map((c, i) => (
              <span key={i} className="id-back__field-value">{c}</span>
            ))}
            <span className="id-back__field-label">Contact Number(s)</span>
          </div>
        </div>

        {/* IMPORTANT notice */}
        <div className="id-back__important">
          <p className="id-back__important-title">IMPORTANT:</p>
          <p className="id-back__important-body">
            This card is the property of Bethel International School and must be carried
            at all times while on campus.&nbsp; It may be used for such purposes as the
            School designates. This card must be presented and/or surrendered upon demand
            by a school official. In Case of loss, please return to school address.
          </p>
        </div>
      </div>

      {/* Bottom certification */}
      <div className="id-back__bottom">
        <p className="id-back__certify">
          <strong>I HEREBY,</strong> certify that the holder whose name and picture appear
          <br />on this card is a bonafide <strong>STUDENT</strong> of this School.
        </p>
        <div className="id-back__principal">
          {signatureImage && (
            <img src={signatureImage} alt="Signature" className="id-back__signature" />
          )}
          <span className="id-back__principal-name">LUZ V. ISOBAL</span>
          <span className="id-back__principal-title">SCHOOL PRINCIPAL</span>
        </div>
      </div>
    </div>
  );
}
