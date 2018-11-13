import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import './User.css';

import Badges from '../Badges/Badges';
import Achievements from '../Achievements/Achievements';

const CancelToken = axios.CancelToken;
let cancelUserFetch;

class User extends Component {
  constructor(props) {
    super();

    // I'm doing something for load management that feels really dumb 
    // but I don't have enough experience with React to do it a better way.
    // As each property of User that needs to load data is finished loading, 
    // it sets a bool tracker to true, and then when they are all true, 
    // I switch out the loading icon and allow the components to be rendered
    this.state = {
      organization: 'Github',
      login: props.match.params.user,
      name: null,
      avatar: null,
      created: null,
      userLoaded: false,
    }
  }

  fetchUserInfo = (userLogin) => {
    let GET_USER = `
      {
        user(login: ${userLogin}) {
          name
          avatarUrl
          createdAt
        }
      }
    `;

    this.props.axiosGitHubGraphQL
      .post('', { 
        query: GET_USER,
        cancelToken: new CancelToken(function executor(c) {
          cancelUserFetch = c;
        })
      })
      .then(result => {
        console.log(result.data.data.user);
        this.setState(() => ({
          name: result.data.data.user.name,
          avatar: result.data.data.user.avatarUrl,
          created: this.convertDate(result.data.data.user.createdAt),
          userLoaded: true,
        }));
      });
  }

  // TODO: share this with components
  convertDate = (date) => {
    let newDate = new Date(date);
    return newDate.toDateString();
  }

  componentDidMount() {
    if (this.state.login) {
      this.fetchUserInfo(this.state.login);
    }
  }

  componentWillUnmount() {
    cancelUserFetch();
  }

  render() {
    console.log('render user');

    let userInfo = this.state.userLoaded ? (
      <section className="user-info">
        <h1>{this.state.name}</h1>
        <img src={this.state.avatar} className="user-avatar" alt="avatar" />
        <p><strong>{this.state.login}</strong> | Joined Github: {this.state.created}</p>
        <Link to="/">Back to All Users</Link>
      </section>
    ) : (
      <section className="user-info">loading user data...</section>
    )

    return (
      <div className="user-page">
        <header className="app-header">
          {userInfo}
          <section className="user-badges-container">
            <Badges user={this.state.login} axiosGitHubGraphQL={this.props.axiosGitHubGraphQL} />
          </section>
        </header>
        <main className="app-main">
          <Achievements user={this.state.login} axiosGitHubGraphQL={this.props.axiosGitHubGraphQL} />
        </main>
      </div>
    )
  }
}

export default User;