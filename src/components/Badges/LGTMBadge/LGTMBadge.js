import React, { Component } from 'react';
import axios from 'axios';

import Badge from '../Badge/Badge';
import Spinner from  '../../Spinner/Spinner';

const CancelToken = axios.CancelToken;
let cancelLGTMFetch;

class LGTMBadge extends Component {
  constructor(props) {
    super();

    this.state = {
      organization: 'Github',
      user: props.user,
      lgtmCount: 0,
      lgtmsLoaded: false,
    }
  }

  fetchUserLGTMS = () => {
    let GET_USER_LGTMS = `
      {
        search(query: "LGTM in:comments commenter:${this.state.user} org:${this.state.organization} -author:${this.state.user}", type: ISSUE) {
          issueCount
        }
      }
    `;

    this.props.axiosGitHubGraphQL
      // get any existing pull requests
      .post('', {
        query: GET_USER_LGTMS,
        cancelToken: new CancelToken(function executor(c) {
          cancelLGTMFetch = c;
        })
      })
      .then(result => {
        if (result.data.data) {
          this.setState({
            lgtmCount: result.data.data.search.issueCount,
            lgtmsLoaded: true,
          });
        }
      })
  }

  getBadges = () => {
    let badges = [];
    // Amount of levels needs to match up with the images I have available
    // Going with 3 as a rule for now
    let levels = [500, 250, 100];

    levels.forEach((level, index)=> {
      if (this.state.lgtmCount >= level) {
        if (this.props.badgeOnly) {
          badges.push(
            <Badge img={`LGTM${levels.length  - index}`} type="LGTM" key={`badges${index}`} />
          );
        } else {
          badges.push(
            <section className="badge" key={`badges${index}`}>
              <Badge img={`LGTM${levels.length  - index}`} type="LGTM" />
              <p>LGTM'd over {level} PRs!</p>
            </section>
          );
        }
      }
    });

    return badges;
  }

  componentDidMount() {
    if (this.state.user) {
      this.fetchUserLGTMS();
    }
  }

  componentWillUnmount() {
    cancelLGTMFetch();
  }

  render() {

    let badges = this.state.lgtmsLoaded ? (
      this.getBadges()
    ): (
      <Spinner alt="loading LGTM badges" />
    )

    return (
      <React.Fragment>
        {badges}
      </React.Fragment>
    );
  }
};

export default LGTMBadge;
