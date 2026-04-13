import React from 'react';

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="section-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default SectionTitle;
