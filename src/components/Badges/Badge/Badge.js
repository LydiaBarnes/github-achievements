import React from 'react';

import './Badge.css';

const Badge = (props) => {
  return (
    <img src={`/img/${props.img}.png`} className="badge-img" alt={`${props.type} badge`} title={`${props.type} badge`} />
  );
};

export default Badge;
