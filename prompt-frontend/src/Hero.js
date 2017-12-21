import React, { Component } from 'react';
// import logo from 'images/prompt-ws-terminal.png';
import './App.css';



import HeroSignUp from './HeroSignUp'

class Hero extends Component {
  render() {
    return (
        <section className="App-hero">
          <h1 className="App-title">Cloud-based terminals for better developer experiences.</h1>
          <p className="App-intro">Sign up below to learn more.</p>
          <img src='images/prompt-ws-terminal.png' className="Hero-logo" alt="logo" />
          <HeroSignUp />
          
        </section>
    );
  }
}

export default Hero;
