import React from 'react';

import doge from '../../../img/doge.png';

import Achievement from '../Achievement/Achievement';

const AdditionAchievement = (props) => {
  return (
    <Achievement type="additions" date={props.date}>
      <p>
        Has made over {props.milestone} code <span className="additions-text">additions</span> in Pull Requests!<br />
        <strong>{props.additions}</strong> to be exact. Wow! <img src={doge} alt="doge" width="20" />
      </p>
    </Achievement>
  );
};

export default AdditionAchievement;
