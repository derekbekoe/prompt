import React, { Component } from 'react';

class InstanceFrame extends Component {
  render() {
    return (
        <iframe className="InstanceFrame" src={this.props.src} />
    );
  }
}

export default InstanceFrame;

