import React, { Component } from 'react';
import './App.css';



import HeroSignUp from './HeroSignUp'

class Hero extends Component {
  render() {
    return (
        <section className="App-hero">
          <h1 className="App-title">Prompt</h1>
          <hr width="70px"/>
          <p className="App-intro">Cloud-based terminals for your developer experiences.</p>
          <p className="App-intro">Sign up below to learn more.</p>
          <img src='images/prompt-ws-terminal.png' className="Hero-logo" alt="logo" />
          <HeroSignUp />
          
        </section>
    );
  }
}

export default Hero;
