import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

const styles = theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  actionsContainer: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 10,
  },
  resetContainer: {
    marginTop: 0,
    padding: theme.spacing.unit * 3,
  },
});

function getSteps() {
  return ['Checking for any running instances', 'Creating your instance', 'Waiting for DNS propagation', 'Starting your instance'];
}

class InstanceLoadingFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0
    };
  }

  handleInstanceReady = () => {
    var instanceSrc = 'https://azure-cli-cd83b165-5808-4629-95c6-469d1d60d2d9-5242-1bda7.instance.prompt.ws:21779/?token=LgKSdG1LMT9SVe5HPRMmRODIVpiE9huBwPuxzvqRkZJ_BeiC7u-WfFFowJlhZE0FX35Z_tAFqVuFuRTgN64RyiZ7XtGbI6W_C85lLAfnFyfCAaAS6FG3DzEp-pQPj6WbxhfO-xFmKectSeWYUIAWIV52pikh6kyaukXGEqBD4lB1i3VWfqEmVBoQJTWl8kaYrcWBFQbQHV66hyA3pTE73Rhzhpmq3d4Xfw9HIrCGBVCVDMNcPAVQw2DxohbWcUPWYwVQJwPz4ElU70xR9udUQsvXzhGDR7w0Xf2OP5vozFn5-Qacx2VYFraTDhyo9C-g1OzMZCz6nw3k1J3A0c5Hmg';
    this.props.onInstanceReady(instanceSrc);
  };

  componentDidMount() {
    fetch(`/api/container?pr=`+this.props.prNum, {
      accept: "application/json",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    })
    .then((res) => {return res.json()})
    .then((res) => {
      this.props.onInstanceReady(res.instanceSrc);
    })
    .catch((reason) => {
      console.error(reason);
    });
    // setTimeout(() => {
    //   this.setState({
    //       activeStep: this.state.activeStep + 1,
    //   });
    // }, 1000);
    // setTimeout(() => {
    //   this.setState({
    //       activeStep: this.state.activeStep + 1,
    //   });
    // }, 2000);
    // setTimeout(() => {
    //   this.setState({
    //       activeStep: this.state.activeStep + 1,
    //   });
    // }, 3000);
  }

  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <div className="InstanceFrame">
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>Your instance is ready!</Typography>
            <Button onClick={this.handleInstanceReady} className={classes.button}>
              Go
            </Button>
          </Paper>
        )}
      </div>
    );
  }
}

InstanceLoadingFrame.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles)(InstanceLoadingFrame);
