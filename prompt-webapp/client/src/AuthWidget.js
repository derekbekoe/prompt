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

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleLogout = () => {
        // TODO Log out
        fetch(`/api/logout`, {
          accept: "application/json",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          method: 'POST',
        })
        .then((res) => {
          this.props.onLogout();
        });
        this.handleClose();
    }

    handleProfile = () => {
        window.open("https://github.com/" + this.props.user.username, "_blank");
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
            <MenuItem onClick={this.handleProfile}>Hi {user.name ? user.name : user.username}</MenuItem>
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
      user: undefined,
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
    fetch(`/api/user`, {
      accept: "application/json",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    })
    .then((res) => {return res.json()})
    .then((user) => {
      this.setState({user: user});
    })
    .catch((reason) => {
      console.error(reason);
      this.setState({user: undefined});
    });
  }

  handleLogout() {
    this.setState({user: undefined});
  }

  render() {
    const user = this.state.user;
    if (user) {
      return <LoggedInSpan user={user} onLogout={this.handleLogout} />;
    }
    return <NotLoggedInSpan />;
  }
}

  export default AuthWidget;
