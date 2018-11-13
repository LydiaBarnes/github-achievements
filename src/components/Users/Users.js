import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../../img/achievements-logo.png';

import Badges from '../Badges/Badges';

import './Users.css';

const Users = (props) => {
  let users = props.users.map(user => {
    return (
      <li className="user-card" key={user.node.login}>
        <Link to={`/${user.node.login}`}>
          <img src={user.node.avatarUrl} className="user-avatar" alt="avatar" />
          <div className="user-card-content">
            {user.node.login}
            {/* This was a feature I had showing the badge previews for each use, but it creates too many requests */}
            {/* <Badges user={user.node.login} axiosGitHubGraphQL={props.axiosGitHubGraphQL} badgeOnly={true} /> */}
          </div>
        </Link>
      </li>
    );
  });

  let loadMoreButton = !props.membersLoaded && (
    <button className="load-more-button" onClick={props.onLoadMoreButtonClick}>Load More Users</button>
  );

  return (
    <React.Fragment>
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1 className="app-title">Github Achievements</h1>
        <p><em>A prototype demonstrating a game-like achievements system for Github organizations. (currently using the actual Github org as demo)</em></p>
      </header>
      <main className="app-main">
        <ul className="users-list">
          {users}
        </ul>
        {loadMoreButton}
      </main>
    </React.Fragment>
  )
}

export default Users;