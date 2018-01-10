import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Button from 'material-ui/Button';
import PromptAppBar from './PromptAppBar';
import Hero from './Hero';
import InstanceFrame from './InstanceFrame';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <PromptAppBar title="Azure/azure-cli PR #5242" githubSrc="https://github.com/azure/azure-cli/pull/5242" />
        <InstanceFrame src="https://azure-cli-cd83b165-5808-4629-95c6-469d1d60d2d9-5242-1bda7.instance.prompt.ws:21779/?token=LgKSdG1LMT9SVe5HPRMmRODIVpiE9huBwPuxzvqRkZJ_BeiC7u-WfFFowJlhZE0FX35Z_tAFqVuFuRTgN64RyiZ7XtGbI6W_C85lLAfnFyfCAaAS6FG3DzEp-pQPj6WbxhfO-xFmKectSeWYUIAWIV52pikh6kyaukXGEqBD4lB1i3VWfqEmVBoQJTWl8kaYrcWBFQbQHV66hyA3pTE73Rhzhpmq3d4Xfw9HIrCGBVCVDMNcPAVQw2DxohbWcUPWYwVQJwPz4ElU70xR9udUQsvXzhGDR7w0Xf2OP5vozFn5-Qacx2VYFraTDhyo9C-g1OzMZCz6nw3k1J3A0c5Hmg" />
        {/* <PromptAppBar />
        <Hero /> */}
        <Footer />
      </div>
    );
  }
}

export default App;

