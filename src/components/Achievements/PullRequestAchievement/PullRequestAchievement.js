import React from 'react';

import tada from '../../../img/tada.png';

import Achievement from '../Achievement/Achievement';

const PullRequestAchievement = (props) => {

  // This Achievement rewards the first milestone
  let firstMilestone = (props.milestone === 0);

  let achievementContent = firstMilestone ? (
    <p>Merged their <a href={`https://github.com/${props.url}`} target="_blank">first PR!</a>  <img src={tada} alt="tada" width="20" /></p>
  ) : (
    <p>Merged their <a href={`https://github.com/${props.url}`} target="_blank">{props.milestone}th PR!</a> <img src={tada} alt="tada" width="20" /></p>
  );

  return (
    <Achievement type="prs" date={props.date}>
      {achievementContent}
    </Achievement>
  );
};

export default PullRequestAchievement;
