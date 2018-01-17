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

import SvgIcon from 'material-ui/SvgIcon';

const styles = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

function GitHubButton(props) {
  if (!props.githubSrc) {
    return null;
  }
  return (
    <a title="GitHub" href={props.githubSrc} target="_blank">
          <SvgIcon viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </SvgIcon>
          </a>
  );
}

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
    this.props.onAuthChange(true);
  }

  render() {
    return <Button color="contrast" onClick={this.handleLogin}>Login</Button>;
  }
}

// TODO Create a AuthWidget
function AuthWidget(props) {
  const auth = props.auth;
  if (auth) {
    return <LoggedInSpan onAuthChange={props.onAuthChange} user={props.user} />;
  }
  return <NotLoggedInSpan onAuthChange={props.onAuthChange} />;
}

class ButtonAppBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      auth: false,
      user: {
        name: 'tjprescott'
      },
    };
    this.handleAuthChange = this.handleAuthChange.bind(this);
  }

  handleAuthChange(checked) {
    this.setState({ auth: checked });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="contrast" aria-label="Menu">
              {/* <MenuIcon /> */}
            </IconButton>
            <Typography type="title" color="inherit" className={classes.flex}>
              {this.props.title}
            </Typography>
            <AuthWidget auth={this.state.auth} user={this.state.user} onAuthChange={this.handleAuthChange} />
          <GitHubButton githubSrc={this.props.githubSrc} />
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonAppBar);
