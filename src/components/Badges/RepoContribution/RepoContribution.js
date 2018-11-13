import React, { Component } from 'react';
import axios from 'axios';

import Badge from '../Badge/Badge';
import Spinner from  '../../Spinner/Spinner';

const CancelToken = axios.CancelToken;
let cancelRepoFetch;

class RepoContribution extends Component {
  constructor(props) {
    super();

    this.state = {
      organization: 'Github',
      user: props.user,
      repositories: [],
      repositoriesLoaded: false,
    }
  }

  // We have to filter through the contributedTo repositories
  // to make sure they are under the org. 
  // TODO: Is there a way to filter the original result by org?? I couldn't find it.
  filterRepos(repos) {
    return repos.filter((repo) => { 
      return repo.node.owner.login === this.state.organization; 
    });
  }

  // Doing a separate fetch bc this field is highly likely to be paginated
  // and will need multiple requests to get everything
  // We also don't want to set the state on this one until the whole list is loaded
  fetchUserRepositories = (after, lastRepos) => {
    if (typeof lastRepos === "undefined") {
      lastRepos = [];
    }
    // Indicates we need to poll next page
    let afterArgument = '';
    if (after) {
      afterArgument = `, after: "${after}"`;
    }

    let GET_USER_REPOS = `
      {
        user(login: ${this.state.user}) {
          repositoriesContributedTo(first: 100${afterArgument}) {
            pageInfo {
              endCursor
              hasNextPage
            }
            edges {
              node {
                name
                owner {
                  login
                }
              }
            }
          }
        }
      }
    `;

    this.props.axiosGitHubGraphQL
      // get any existing pull requests
      .post('', {
        query: GET_USER_REPOS,
        cancelToken: new CancelToken(function executor(c) {
          cancelRepoFetch = c;
        })
      })
      .then(result => {
        if (result.data.data) {
          let repos = [...lastRepos, ...this.filterRepos(result.data.data.user.repositoriesContributedTo.edges)];
          // If the results tell us there is more to load, 
          // we gotta keep loading pages till its done
          if (result.data.data.user.repositoriesContributedTo.pageInfo.hasNextPage) {
            this.fetchUserRepositories(result.data.data.user.repositoriesContributedTo.pageInfo.endCursor, repos);
          } else {
            this.setState(() => ({
              repositories: repos,
              repositoriesLoaded: true,
            }));
            console.log('Repos loaded');
          }
        }
      })
  }

  getBadges = () => {
    let badges = [];
    // Amount of levels needs to match up with the images I have available
    // Going with 3 as a rule for now
    let levels = [10, 5, 1];

    levels.forEach((level, index)=> {
      if (this.state.repositories.length >= level) {
        if (this.props.badgeOnly) {
          badges.push(
            <Badge img={`contributor${levels.length  - index}`} type="contributor" key={`badges${index}`} />
          );
        } else {
          badges.push(
            <section className="badge" key={`badges${index}`}>
              <Badge img={`contributor${levels.length  - index}`} type="contributor" />
              <p>Contributed to at least {level} repositories!</p>
            </section>
          );
        }
      }
    });

    return badges;
  }

  componentDidMount() {
    if (this.state.user) {
      this.fetchUserRepositories();
    }
  }

  componentWillUnmount() {
    cancelRepoFetch();
  }

  render() {

    let badges = this.state.repositoriesLoaded ? (
      this.getBadges()
    ) : (
      <Spinner alt="loading contribution badges" />
    )

    return (
      <React.Fragment>
        {badges}
      </React.Fragment>
    );
  }
};

export default RepoContribution;