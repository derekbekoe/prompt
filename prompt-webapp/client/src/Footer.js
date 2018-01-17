import React, { Component } from 'react';

import microsoftLogo from './microsoft-logo.svg';

class Footer extends Component {
  render() {
    return (
        <footer>
          <p className="Footer-inner">Prompt is an experiment made by the folks at Microsoft.</p>
          <p><a href="https://microsoft.com" title="Made by Microsoft"><img src={microsoftLogo} alt="Made by Microsoft" style={{"width" : "150px"}} /></a></p>
        </footer>
    );
  }
}

export default Footer;
