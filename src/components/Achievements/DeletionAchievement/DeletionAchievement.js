import React from 'react';

import troll from '../../../img/troll.png';

import Achievement from '../Achievement/Achievement';

const DeletionAchievement = (props) => {
  return (
    <Achievement type="deletions" date={props.date}>
      <p>
        Has made over {props.milestone} code <span className="deletions-text">deletions</span> in Pull Requests!<br />
        <strong>{props.deletions}</strong> to be exact. Wow! <img src={troll} alt="troll" width="20" />
      </p>
    </Achievement>
  );
};

export default DeletionAchievement;
