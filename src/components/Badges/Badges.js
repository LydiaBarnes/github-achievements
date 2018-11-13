import React from 'react';

import RepoContribution from '../Badges/RepoContribution/RepoContribution';
import CommentBadge from '../Badges/CommentBadge/CommentBadge';
import LGTMBadge from '../Badges/LGTMBadge/LGTMBadge';

const Badges = (props) => {
  return (
    <section className="user-badges">
      <RepoContribution user={props.user} axiosGitHubGraphQL={props.axiosGitHubGraphQL} badgeOnly={props.badgeOnly} />
      <CommentBadge user={props.user} axiosGitHubGraphQL={props.axiosGitHubGraphQL} badgeOnly={props.badgeOnly} />
      <LGTMBadge user={props.user} axiosGitHubGraphQL={props.axiosGitHubGraphQL} badgeOnly={props.badgeOnly} />
    </section>
  )
}

export default Badges;