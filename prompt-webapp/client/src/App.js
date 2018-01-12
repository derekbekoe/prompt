import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import logo from './logo.svg';
import './App.css';

import HomePage from './HomePage';
import PRPage from './PRPage';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path='/' component={HomePage}/>
          <Route path='/r/:org/:repo/:prNum' component={PRPage}/>
        </Switch>
      </div>
    );
  }
}

export default App;

