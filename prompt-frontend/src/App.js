import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Button from 'material-ui/Button';
import PromptAppBar from './PromptAppBar';
import Hero from './Hero'

class App extends Component {
  render() {
    return (
      <div className="App">
        <PromptAppBar title="Prompt"/>
        <Hero />
        <footer style={{"background-color": "#fafafa"}}>
          <p>Prompt is made by the Azure Developer Experience team.</p>
          <p><a href="https://microsoft.com" title="Made by Microsoft"><img src="images/microsoft-logo.svg" alt="Made by Microsoft" style={{"width" : "150px"}} /></a></p>
          <h5 id="copyright">© Prompt 0.20</h5>
        </footer>
      </div>
    );
  }
}

export default App;
