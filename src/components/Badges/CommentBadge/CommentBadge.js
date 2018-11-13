import React, { Component } from 'react';
import axios from 'axios';

import Badge from '../Badge/Badge';
import Spinner from  '../../Spinner/Spinner';

const CancelToken = axios.CancelToken;
let cancelIssueFetch;

class CommentBadge extends Component {
  constructor(props) {
    super();

    this.state = {
      user: props.user,
      commentCount: 0,
      commentsLoaded: false,
    }
  }

  fetchUserIssues = () => {
    let GET_USER_ISSUES = `
      {
        user(login: ${this.state.user}) {
          issueComments {
            totalCount
          }
        }
      }
    `;

    this.props.axiosGitHubGraphQL
      // get any existing pull requests
      .post('', {
        query: GET_USER_ISSUES,
        cancelToken: new CancelToken(function executor(c) {
          cancelIssueFetch = c;
        })
      })
      .then(result => {
        if (result.data.data) {
          this.setState({
            commentCount: result.data.data.user.issueComments.totalCount,
            commentsLoaded: true,
          });
        }
      })
  }

  getBadges = () => {
    let badges = [];
    // Amount of levels needs to match up with the images I have available
    // Going with 3 as a rule for now
    let levels = [1000, 500, 100];

    levels.forEach((level, index)=> {
      if (this.state.commentCount >= level) {
        if (this.props.badgeOnly) {
          badges.push(
            <Badge img={`comments${levels.length - index}`} type="comments" key={`badges${index}`} />
          );
        } else {
          badges.push(
            <section className="badge" key={`badges${index}`}>
              <Badge img={`comments${levels.length - index}`} type="comments" />
              <p>Commented on over {level} PRs!</p>
            </section>
          );
        }
      }
    });

    return badges;
  }

  componentDidMount() {
    if (this.state.user) {
      this.fetchUserIssues();
    }
  }

  componentWillUnmount() {
    cancelIssueFetch();
  }

  render() {

    let badges = this.state.commentsLoaded ? (
      this.getBadges() 
      ) : (
      <Spinner alt="loading comment badges" />
    )
    
    return (
      <React.Fragment>
        {badges}
      </React.Fragment>
    );
  }
};

export default CommentBadge;
