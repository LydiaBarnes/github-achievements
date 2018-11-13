import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';

// import { library } from '@fortawesome/fontawesome-svg-core';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faStroopwafel } from '@fortawesome/free-solid-svg-icons';

// library.add(faStroopwafel)
import './App.css';

import Users from '../components/Users/Users';
import User from '../components/User/User';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: { 'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}` }
});

const CancelToken = axios.CancelToken;
let cancelMembersFetch;

// we need to exlude some non-people users
let excludedUsers = [];

class App extends Component {
  constructor(){
    super();

    this.state = {
      organization: "Github",
      githubMembers: [],
      membersLoaded: false,
      nextPage: '',
      accessToken: process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN,
    }
  }

  // Idea is to only pull what we need to display on this page.
  // We will pass user login to User component
  onFetchGithubMembers = (after) => {
    // Indicates we need to poll next page
    let afterArgument = '';
    if (after) {
      afterArgument = `, after: "${after}"`;
    }    
    
    let GET_MEMBERS = `
      {
        organization(login: ${this.state.organization}) {
          members(first: 12${afterArgument}) {
            totalCount
            edges {
              node {
                login
                name
                avatarUrl
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    axiosGitHubGraphQL
      .post('', { 
        query: GET_MEMBERS,
        cancelToken: new CancelToken(function executor(c) {
          cancelMembersFetch = c;
        })
      })
      .then(result => {
        // remove unwanted non-people members
        let filteredMembers = result.data.data.organization.members.edges.filter((member) => !excludedUsers.includes(member.node.login));
        let members = [...this.state.githubMembers, ...filteredMembers];
        this.setState(() => ({
          githubMembers: members,
          nextPage: result.data.data.organization.members.pageInfo.endCursor
        }));
        if (!result.data.data.organization.members.pageInfo.hasNextPage) {
          this.setState({
            membersLoaded: true,
          });
          console.log('members loaded');
          //this.onFetchGithubMembers(result.data.data.organization.members.pageInfo.endCursor);
        }
      });
  }

  onLoadMoreButtonClick = () => {
    console.log('load more');
    this.onFetchGithubMembers(this.state.nextPage);
  }

  componentDidMount() {
    this.onFetchGithubMembers();
  }

  componentWillUnmount() {
    cancelMembersFetch();
  }

  render() {
    return (
      <div className="app">
        <Switch>
          <Route exact path='/'
            render={(props) => <Users {...props} users={this.state.githubMembers} onLoadMoreButtonClick={this.onLoadMoreButtonClick} membersLoaded={this.state.membersLoaded} axiosGitHubGraphQL={axiosGitHubGraphQL} />}
          />
          <Route 
            path='/:user' 
            render={(props) => <User {...props} axiosGitHubGraphQL={axiosGitHubGraphQL} />}
            />
        </Switch> 
      </div>
    );
  }
}

export default App;

