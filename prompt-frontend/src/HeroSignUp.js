import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

import Button from 'material-ui/Button';


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
  state = {
    name: '',
    multiline: '',
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <Card raised className="Hero-signup">
        <CardContent>
        <Typography className={classes.title}>Sign up</Typography>
        {/* <h1>Thank you!</h1>
        <h2>Email sent to {this.state.name}</h2> */}
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
          <Button raised color="accent" style={{"margin": "10px 0px"}}>
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
