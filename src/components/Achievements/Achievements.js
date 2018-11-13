import React, { Component } from 'react';
import axios from 'axios';

import './Achievements.css';

import PullRequestAchievement from './PullRequestAchievement/PullRequestAchievement';
import AdditionAchievement from './AdditionAchievement/AdditionAchievement';
import DeletionAchievement from './DeletionAchievement/DeletionAchievement';
import Spinner from '../Spinner/Spinner';

const CancelToken = axios.CancelToken;
let cancelPRFetch;

class Achievements extends Component {
  constructor(props) {
    super();

    // I'm doing something for load management that feels really dumb 
    // but I don't have enough experience with React to do it a better way.
    // As each property of User that needs to load data is finished loading, 
    // it sets a bool tracker to true, and then when they are all true, 
    // I switch out the loading icon and allow the components to be rendered
    this.state = {
      organization: 'Github',
      user: props.user,
      pullRequests: [],
      pullRequestsLoaded: false,
      achievements: [],
    }
  }

  // Doing a separate fetch bc this field is highly likely to be paginated
  // and will need multiple requests to get everything
  fetchUserPullRequests = (userLogin, after) => {
    // Indicates we need to poll next page
    let afterArgument = '';
    if (after) {
      afterArgument = `, after: "${after}"`;
    }

    // using search query since the user get pullrequest can't filter by org
    let GET_USER_PRS = `
      {
        search(query: "author:${userLogin} org:${this.state.organization} is:merged", type: ISSUE, first: 100${afterArgument}) {
          issueCount
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              ... on PullRequest {
                id
                mergedAt
                resourcePath
                changedFiles
                additions
                deletions
              }
            }
          }
        }
      }
    `;

    this.props.axiosGitHubGraphQL
      .post('', {
        query: GET_USER_PRS,
        cancelToken: new CancelToken(function executor(c) {
          cancelPRFetch = c;
        })
      })
      .then(result => {
        let prList = [...this.state.pullRequests, ...result.data.data.search.edges];
        
        if (prList.length) {
          this.setState({
            pullRequests: prList
          });
        }

        // If the results tell us there is more to load, 
        // we gotta keep loading pages till its done
        if (result.data.data.search.pageInfo.hasNextPage) {
          this.fetchUserPullRequests(userLogin, result.data.data.search.pageInfo.endCursor)
        } else {
          this.setState({
            pullRequestsLoaded: true
          });
          console.log('PRs loaded');
        }
      });
  }

  getPRAchievements = () => {
    let achievements = [];
    let milestone = 50;
    let allPrs = this.state.pullRequests;

    // This set of achievements relies on ALL PRs being fully loaded
    if (this.state.pullRequestsLoaded && allPrs.length) {

      // The query fetches the PRs more recent to oldest, I need to reverse
      // the list to count up from the bottom
      // using sort function bc I can't rely on it always being in a certain order...
      allPrs = this.sortByDate(allPrs, true);
      
      for (let i = 0; i <= allPrs.length; i += milestone) {
        let pr;
        if (i === 0) {
          pr = allPrs[i].node;
        } else {
          pr = allPrs[i-1].node;
        }
        achievements.push({
          "type": "PR",
          "milestone": i,
          "mergedAt": pr.mergedAt,
          "resourcePath": pr.resourcePath,
          "id": pr.id,
        });
      }
    }
    return achievements;
  }

  getAdditionAchievements = () => {
    let achievements = [];
    // There is a HUGE disparity of additions, so I made up a set of milestones
    // rather than doing it by even increments.
    let milestones = [1000, 10000, 25000, 50000, 75000, 100000];
    let allPrs = this.state.pullRequests;

    // this set of achievements relies on ALL PRs being fully loaded
    if (this.state.pullRequestsLoaded) {
      let additionsCount = 0;

      // The query fetches the PRs more recent to oldest, I need to reverse
      // the list to count up from the bottom
      // using sort function bc I can't rely on it alway being in a certain order...
      allPrs = this.sortByDate(allPrs, true);

      // I have to loop through every PR to count the total additions.
      // It would be better if I could just straight up fetch this info
      // but so far I haven't figured it out
      allPrs.forEach((pr) => {
        additionsCount += pr.node.additions;
        if (additionsCount >= milestones[0]) {
          achievements.push({
            "type": "Addition",
            "milestone": milestones[0],
            "additions": additionsCount,
            "mergedAt": pr.node.mergedAt,
            "id": pr.node.id,
          });
          milestones.shift();
        }          
      });
    }
    return achievements;
  }

  getDeletionAchievements = () => {
    let achievements = [];
    // There is a HUGE disparity of additions, so I made up a set of milestones
    // rather than doing it by even increments.
    let milestones = [1000, 10000, 25000, 50000, 75000, 100000];
    let allPrs = this.state.pullRequests;

    // this set of achievements relies on ALL PRs being fully loaded
    if (this.state.pullRequestsLoaded) {
      let deletionsCount = 0;

      // The query fetches the PRs more recent to oldest, I need to reverse
      // the list to count up from the bottom
      // using sort function bc I can't rely on it alway being in a certain order...
      allPrs = this.sortByDate(allPrs, true);

      // I have to loop through every PR to count the total additions.
      // It would be better if I could just straight up fetch this info
      // but so far I haven't figured it out
      allPrs.forEach((pr) => {
        deletionsCount += pr.node.deletions;
        if (deletionsCount >= milestones[0]) {
          achievements.push({
            "type": "Deletion",
            "milestone": milestones[0],
            "deletions": deletionsCount,
            "mergedAt": pr.node.mergedAt,
            "id": pr.node.id,
          });
          milestones.shift();
        }          
      });
    }
    return achievements;
  }

  // sort the provided array by mergedAt date, latest to oldest,
  // if optional reverse is true, do it reverse order
  sortByDate = (achievements, reverse) => {
    let a = achievements.sort((a, b) => {
      if (a.mergedAt > b.mergedAt) {
        return -1;
      }
      if (a.mergedAt < b.mergedAt) {
        return 1;
      }
      return 0;
    });
    if (reverse) {
      return a.reverse();
    } else {
      return a;
    }
  }

  getAllAchievements = () => {
    let achievements = [
      ...this.getPRAchievements(),
      ...this.getAdditionAchievements(),
      ...this.getDeletionAchievements(),
    ];
    return this.sortByDate(achievements);
  }

  // TODO: dont repeat this function here
  convertDate = (date) => {
    let newDate = new Date(date);
    return newDate.toDateString();
  }

  componentDidMount() {
    if (this.state.user) {
      this.fetchUserPullRequests(this.state.user);
    }
  }

  componentWillUnmount() {
    cancelPRFetch();
  }


  render() {
    console.log('render achievements');
    let allAchievements = this.getAllAchievements().map(achievement => {
      if (achievement.type === "PR") {
        return (
          <PullRequestAchievement
            key={`${achievement.type}${achievement.id}`}
            milestone={achievement.milestone}
            url={achievement.resourcePath}
            date={this.convertDate(achievement.mergedAt)} />
        );
      } else if (achievement.type === "Addition") {
        return (
          <AdditionAchievement
            key={`${achievement.type}${achievement.id}`}
            milestone={achievement.milestone}
            additions={achievement.additions}
            date={this.convertDate(achievement.mergedAt)} />
        );
      } else if (achievement.type === "Deletion") {
        return (
          <DeletionAchievement
            key={`${achievement.type}${achievement.id}`}
            milestone={achievement.milestone}
            deletions={achievement.deletions}
            date={this.convertDate(achievement.mergedAt)} />
        );
      }
    });

    let achievementsContent = (this.state.pullRequestsLoaded && !allAchievements.length) ? (
      <p>This user doesn't have enough data for achievements</p>
    ) : (
      allAchievements
    )

    // Loading indicator
    let achievementsLoadingState = !this.state.pullRequestsLoaded && (
      <p><Spinner alt="loading achievements" /> loading achievements...</p>
    )

    return (
      <section>
        <h2>Achievements</h2>
        {/* // Start loading as soon as we have some data available */}
        {this.state.pullRequests && achievementsContent}
        {achievementsLoadingState}
      </section>
    )
  }
}

export default Achievements;