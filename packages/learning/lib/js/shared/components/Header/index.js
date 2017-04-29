import React from 'react';

import canvas from 'instructure-ui/lib/themes/canvas';
import ApplyTheme from 'instructure-ui/lib/components/ApplyTheme';

import Button from 'instructure-ui/lib/components/Button';
import Container from 'instructure-ui/lib/components/Container';
import Heading from 'instructure-ui/lib/components/Heading';
import Link from 'instructure-ui/lib/components/Link';
import { MenuItem } from 'instructure-ui/lib/components/Menu';
import ScreenReaderContent from 'instructure-ui/lib/components/ScreenReaderContent';
import Select from 'instructure-ui/lib/components/Select';
import Typography from 'instructure-ui/lib/components/Typography';

import styles from './styles.css';
import apps from 'js/apps';

let appList = [];
Object.keys(apps).forEach((app) => {
  const entry = { key: app, ...apps[app] };
  if (app === 'home') {
    appList.unshift(entry);
  } else {
    appList.push(entry);
  }
});
appList = appList.sort(app => app.label);

export default class Header extends React.Component {
  constructor (props) {
    super(props);
  }

  onAppChange (event) {
    window.location = apps[event.target.value].path;
  }

  render () {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="header" className={styles.Header}>
          <div className={styles.Heading}>
            <Heading level="h1">
              <Link href="/">Learning Platform</Link>
            </Heading>
          </div>

          <div className={styles.AppName}>
            <Typography>{ this.props.app }</Typography>
          </div>

          <div className={styles.Navigation}>
            <Select
              label={<ScreenReaderContent>Apps</ScreenReaderContent>}
              layout="inline"
              onChange={this.onAppChange}
              value={this.props.page}
            >
              {
                appList.map(app => (
                  <option key={app.key} value={app.key}>{ app.label }</option>
                ))
              }
            </Select>
          </div>
        </Container>
      </ApplyTheme>
    );
  }
}
