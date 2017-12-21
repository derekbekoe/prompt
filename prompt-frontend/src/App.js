import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Button from 'material-ui/Button';
import PromptAppBar from './PromptAppBar';
import Hero from './Hero';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <PromptAppBar/>
        <iframe className="App-instance-frame" src="https://azure-cli-cd83b165-5808-4629-95c6-469d1d60d2d9-5116-5225f.instance.prompt.ws:27450/?token=TjZbNCsqkcxYRCbVKa-ibbV87rWf_6TfzZULnn-i4Wg4N5GhP1dWo8x1MjyuKoqqXN0GkiHxTJOgp8Ynwqc0p56nS3DiSeLFegvI2SF3wklDhicE5FjfhuMshSpUMLz2xCohRPHaXzM5D5o6mrQMJFI-Xt0VO9fEz3ttbNzDF9shAESSdIn54G-IkKVivuaHwcyI8ZACcVebeRYDzcbqCtrnnEfXMM87FeFAvuxniIxtm8OLkU5zCP_YaT0z4_XwfJNtrJQRbSnvmScFR8io-GtKg_4KdIJFnsksIjUEDm1hnktkZWAUYLviCint7bA3n8pH-Owg_OyBOzSV79A7_A" />
        {/* <Hero />
        <Footer /> */}
      </div>
    );
  }
}

export default App;

