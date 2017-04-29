import React from 'react';

import canvas from 'instructure-ui/lib/themes/canvas';
import ApplyTheme from 'instructure-ui/lib/components/ApplyTheme';

import Button from 'instructure-ui/lib/components/Button';
import Container from 'instructure-ui/lib/components/Container';
import Grid, { GridCol, GridRow } from 'instructure-ui/lib/components/Grid';
import Heading from 'instructure-ui/lib/components/Heading';
import Link from 'instructure-ui/lib/components/Link';
import { MenuItem } from 'instructure-ui/lib/components/Menu';
import PopoverMenu from 'instructure-ui/lib/components/PopoverMenu';
import Typography from 'instructure-ui/lib/components/Typography';

import styles from 'styles/sandbox.css';
import apps from 'js/apps';

let appList = [];
Object.keys(apps).forEach((app) => {
  appList.push(apps[app]);
});
appList = appList.sort(app => app.label);

class Header extends React.Component {
  constructor (props) {
    super(props);
  }

  onAppChange (event, value) {
    window.location = value;
  }

  render () {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="header" className={styles.Header}>
          <Grid vAlign="middle" colSpacing="small">
            <GridRow>
              <GridCol>
                <Link href="/">
                  <Heading level="h1">Sandbox</Heading>
                </Link>
              </GridCol>

              <GridCol width="auto">
                <Typography>{ this.props.app }</Typography>
              </GridCol>

              <GridCol width="auto">
                <PopoverMenu
                  onSelect={this.onAppChange}
                  trigger={
                    <Button variant="primary">Apps</Button>
                  }
                >
                  {
                    appList.map(app => (
                      <MenuItem key={app.label} value={app.path}>{ app.label }</MenuItem>
                    ))
                  }
                </PopoverMenu>
              </GridCol>
            </GridRow>
          </Grid>
        </Container>
      </ApplyTheme>
    );
  }
}

export default Header;
