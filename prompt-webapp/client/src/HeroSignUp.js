import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button';

import ApiClient from "./ApiClient";


const styles = theme => ({
  // container: {
  //   display: 'flex',
  //   flexWrap: 'wrap',
  // },
  // textField: {
  //   marginLeft: theme.spacing.unit,
  //   marginRight: theme.spacing.unit,
  // },
  title: {
    marginBottom: 16,
    fontSize: 14,
    color: theme.palette.text.secondary,
    textAlign: 'left',
  },
});


class TextFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      multiline: '',
      emailSent: false
    };

    // This binding is necessary to make `this` work in the callback
    this.handleSendInterestEmail = this.handleSendInterestEmail.bind(this);
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  
  handleSendInterestEmail() {
    ApiClient.sendInterestEmail(this.state.name, this.state.multiline, result => {
      console.log(result);
      this.setState({
        emailSent: true
      });
    });
  }

  render() {
    const { classes } = this.props;

    if (this.state.emailSent) {
      return (
        <Card raised className="Hero-signup">
          <CardContent>
            <Typography className={classes.title}>Sign up</Typography>
            <Typography>Thank you, an email has been sent!</Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card raised className="Hero-signup">
        <CardContent>
        <Typography className={classes.title}>Sign up</Typography>
        <form noValidate className="Hero-signup-form" autoComplete="off">
          <TextField
            required
            fullWidth
            id="name"
            label="Email address"
            value={this.state.name}
            onChange={this.handleChange('name')}
            margin="normal"
            />
          <TextField
            fullWidth
            multiline
            id="multiline-flexible"
            label="Why are you interested in this?"
            rowsMax="4"
            value={this.state.multiline}
            onChange={this.handleChange('multiline')}
            margin="normal"
          />
          <Button raised color="accent" style={{"margin": "10px 0px"}} onClick={this.handleSendInterestEmail}>
              Submit
            </Button>
        </form>
        </CardContent>
      </Card>
    );
  }
}

TextFields.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TextFields);
