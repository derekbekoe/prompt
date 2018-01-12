import React, { Component } from 'react';

import microsoftLogo from './microsoft-logo.svg';

class Footer extends Component {
  render() {
    return (
        <footer>
          {/* <h5>By <a href="https://derekbekoe.com" target="_blank">Derek Bekoe</a></h5> */}
          <p className="Footer-inner">Prompt is made by the awesome folks on the Azure Developer Experience team.</p>
          <p><a href="https://microsoft.com" title="Made by Microsoft"><img src={microsoftLogo} alt="Made by Microsoft" style={{"width" : "150px"}} /></a></p>
        </footer>
    );
  }
}

export default Footer;
