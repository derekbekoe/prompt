import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import HomePage from './HomePage';
import PRPage from './PRPage';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <HomePage /> */}
        <PRPage />
      </div>
    );
  }
}

export default App;

