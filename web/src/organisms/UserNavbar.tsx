import * as React from 'react';
import { Link } from 'react-router';

import './UserNavbar.scss'

interface UserNavbarProps {
  location?: string;
}

export class UserNavbar extends React.Component<UserNavbarProps, undefined> {
  render() {
    return (
      <nav className="user-nav">
        <div className="container">
          <ul>
            { this.renderNavLink('account/settings', 'Settings') }
            { this.renderNavLink('account/wallet', 'Wallet') }
          </ul>
        </div>
      </nav>
    )
  }

  private renderNavLink(key: string, text: string): JSX.Element {
    return <li key={key} className={ this.props.location === '/' + key && 'selected' }><Link to={'/' + key}>{text}</Link></li>
  }

}

