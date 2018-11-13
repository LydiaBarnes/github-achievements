import React from 'react';

import './Achievement.css';

const Achievement = (props) => {
  return (
    <section className="achievement-card">
      <img src={`/img/${props.type}.png`} className="achievement-card-icon" alt={`${props.type} achievement`} />
      <div className="achievement-card-content">
        {props.children}
      </div>
      <div className="achievement-card-date">{props.date}</div>
    </section>
  );
};

export default Achievement;
