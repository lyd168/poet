import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { HexString } from '../../common';

import ProfileWorks from './ProfileWorks';

export interface ProfileTabsProps {
  id: HexString;
}

export class ProfileTabs extends React.Component<ProfileTabsProps, any> {
  render() {
    return (
      <div className="col-sm-9">
        <Tabs>
          <TabList>
            <Tab>Works</Tab>
            <Tab>Licenses</Tab>
          </TabList>
          <TabPanel>
            <ProfileWorks author={this.props.id}/>
          </TabPanel>
          <TabPanel>
            <h2>Licenses go here</h2>
          </TabPanel>
        </Tabs>
      </div>
    )
  }
}