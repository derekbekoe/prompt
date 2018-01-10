import React, { Component } from 'react';

import PromptAppBar from './PromptAppBar';
import Hero from './Hero';
import Footer from './Footer';

class HomePage extends Component {
  render() {
    return (
      <div>
        <PromptAppBar />
        <Hero />
        <Footer />
      </div>
    );
  }
}

export default HomePage;

