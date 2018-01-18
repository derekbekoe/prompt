import React, { Component } from 'react';

import Button from 'material-ui/Button';
import PromptAppBar from './PromptAppBar';
import InstanceLoadingFrame from './InstanceLoadingFrame';
import InstanceFrame from './InstanceFrame';
import Footer from './Footer';

class InstanceView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instanceSrc: undefined
    };
    this.handleInstanceReady = this.handleInstanceReady.bind(this);
  }

  handleInstanceReady(instanceSrc) {
    this.setState({instanceSrc: instanceSrc});
  }

  render() {
    const instanceSrc = this.state.instanceSrc;
    if (instanceSrc) {
      return <InstanceFrame src={instanceSrc} />
    }
    return <InstanceLoadingFrame onInstanceReady={this.handleInstanceReady} prNum={this.props.prNum}/>
  }

}

class PRView extends Component {

  constructor(props) {
    super(props);
    this.title = this.props.match.params.org + '/' + this.props.match.params.repo + ' PR #' + this.props.match.params.prNum;
  }

  componentDidMount() {
    document.title = "Prompt - " + this.title;
  }

  render() {
    return (
      <div>
        <PromptAppBar title={this.title} githubSrc={'https://github.com/'+this.props.match.params.org+'/'+this.props.match.params.repo+'/pull/'+this.props.match.params.prNum} />
        <InstanceView prNum={this.props.match.params.prNum} />
        <Footer />
      </div>
    );
  }
}

export default PRView;

