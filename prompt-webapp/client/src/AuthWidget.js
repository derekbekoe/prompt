import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Switch from 'material-ui/Switch';
import Menu, { MenuItem } from 'material-ui/Menu';

class LoggedInSpan extends Component {

    constructor(props) {
        super(props);
        this.state = {
        anchorEl: null,
        };
    }

    handleChange = (event, checked) => {
        this.setState({ auth: checked });
    };

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleLogout = () => {
        // TODO Log out
        this.props.onAuthChange(false);
        this.handleClose();
    }

    handleProfile = () => {
        window.open("https://github.com/"+this.props.user.name, "_blank");
        this.handleClose();
    }

    render() {
        const { classes } = this.props;
        const user = this.props.user;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        return (
        <div>
            <IconButton
            aria-owns={open ? 'user-menu-appbar' : null}
            aria-haspopup="true"
            onClick={this.handleMenu}
            color="contrast"
            >
            <AccountCircle />
            </IconButton>
            <Menu
            id="user-menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={open}
            onClose={this.handleClose}
            >
            <MenuItem onClick={this.handleProfile}>Hi {user.name}</MenuItem>
            <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
            </Menu>
        </div>
        );
    }
}
  
class NotLoggedInSpan extends Component {

    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
    }

    handleLogin() {
        // TODO Log in
      var payload = {
        callback: window.location.href,
      };
    
      var data = JSON.stringify( payload );
      return fetch(`/api/login`, {
        accept: "application/json",
        headers: {"Content-Type": "application/json"},
        method: 'POST',
        credentials: 'include',
        body: data
      })
        .then(function(res) {
          return res.json();
        })
        .then(function(json) {
          var uri = json.uri;
          console.log(json, uri);
          window.open(uri, '_self');
        });
          // this.props.onAuthChange(true);
      }

    render() {
        return <Button color="contrast" onClick={this.handleLogin}>Login</Button>;
    }
}
  
class AuthWidget extends Component {

  constructor(props) {
    super(props);
    // eventually this state will be lifted up once others start needing it
    this.state = {
      auth: false,
      user: {
        name: 'derekbekoe'
      },
    };
    this.handleAuthChange = this.handleAuthChange.bind(this);
  }

  handleAuthChange(checked) {
    this.setState({ auth: checked });
  };

  render() {
    const auth = this.state.auth;
    const user = this.state.user;
  
    if (auth) {
      return <LoggedInSpan onAuthChange={this.handleAuthChange} user={user} />;
    }
    return <NotLoggedInSpan onAuthChange={this.handleAuthChange} />;
  }
}

  export default AuthWidget;
