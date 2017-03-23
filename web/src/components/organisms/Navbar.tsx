import * as React from 'react';
import { Link } from 'react-router';
import { Action } from 'redux';
import { connect } from "react-redux";
const classNames = require('classnames');

import { Actions } from '../../actions/index';
import Constants from '../../constants';
import { Images } from '../../images/Images';
import { countUnreadNotifications } from '../../selectors/session';
import { AccountDropdown } from './AccountDropdown';

import './Navbar.scss';

interface NavbarActions {
  dispatchSearchClick: () => Action;
  dispatchSearchChange: (searchQuery: string) => Action
  dispatchShowTryItOut: () => Action
}

export interface NavbarProps {
  readonly loggedIn?: boolean;
  readonly notifications?: number;
  readonly shadow?: boolean;
  readonly transparent?: boolean;
  readonly margin?: boolean;
  readonly displayLogo?: boolean;
  readonly displaySearch?: boolean;
  readonly searchShadow?: boolean;
}

class NavbarComponent extends React.Component<NavbarProps & NavbarActions, undefined> {
  static defaultProps: NavbarProps = {
    shadow: true,
    transparent: false,
    displayLogo: true,
    displaySearch: true
  };

  render() {
    const navClasses = [
      'navbar',
      this.props.shadow && 'shadow',
      this.props.transparent && 'transparent',
      this.props.margin && 'margin'
    ];
    const searchClasses = [
      'search',
      this.props.searchShadow && 'shadow'
    ];
    const search = (ev: any) => {
      ev.preventDefault()
      this.props.dispatchSearchClick()
    }
    return (
      <nav className={ classNames(navClasses) }>
        { this.props.displayLogo && <a className="navbar-brand" href="/"><img src={Images.Logo} /></a> }
        { this.props.displaySearch && <div className={ classNames(searchClasses) }  >
          <img src={Images.Glass} />
          <form onSubmit={search}>
            <input
              type="text"
              placeholder="Search"
              onChange={(event: any) => this.props.dispatchSearchChange(event.target.value) }
            />
          </form>
        </div> }
        <ul className="navbar-nav">
          { this.props.loggedIn ? this.loggedInActions() : this.notLoggedActions() }
        </ul>
      </nav>
    )
  }

  private renderNavLink(key: string, text: string, className: string = 'nav-link'): JSX.Element {
    return (
      <li key={key} className="nav-item">
        <Link to={'/' + key} className={className}>{text}</Link>
      </li>
    )
  }

  private notLoggedActions(): JSX.Element[] {
    return [
      this.renderNavLink('network/about', 'About'),
      this.renderNavLink('documentation/overview', 'Documentation'),
      this.renderNavLink('login', 'Login', 'login-button button-secondary'),
      <li key='try-it-out'>
        <button className="try-it-out" onClick={this.props.dispatchShowTryItOut}>
          <img src={Images.QuillInverted} /><span>Try It Out</span>
        </button>
      </li>
    ];
  }

  private loggedInActions(): JSX.Element[] {
    return [
      this.renderNavLink('portfolio', 'Portfolio'),
      this.renderNavLink('licenses', 'Licenses'),
      <li key="avatar" className="nav-item avatar"><AccountDropdown /></li>,
      this.countNotifications() > 0 ? <li key="notifications" className="nav-item notifications">{ this.notifications() }</li> : <span key="nonotif"/>,
      <li key="create-work" className="nav-item"><Link to={'/create-work'} className="button-primary"><img src={Images.QuillInverted} />Register New Work</Link></li>
    ];
  }

  private countNotifications(): number {
    return this.props.notifications
  }

  private notifications(): JSX.Element {
    return <Link to="/account/notifications"> { this.props.notifications ? '' + this.props.notifications : '0' } </Link>
  }
}

function mapStateToProps(state: any, ownProps: NavbarProps): NavbarProps {
  return {
    ...ownProps,
    loggedIn: state.session && (state.session.state === Constants.LOGGED_IN),
    notifications: countUnreadNotifications(state)
  }
}

const mapDispatch = {
  dispatchSearchClick: () => ({ type: Actions.Search.Submit }),
  dispatchSearchChange: (searchQuery: string) => ({ type: Actions.Search.Change, searchQuery }),
  dispatchShowTryItOut: () => ({ type: Actions.Modals.TryItOut.Show })
};

export const Navbar = connect(mapStateToProps, mapDispatch)(NavbarComponent);