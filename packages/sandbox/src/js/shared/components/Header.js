import React, {Component} from 'react'
import canvas from '@instructure/ui-themes/lib/canvas'
import ApplyTheme from '@instructure/ui-core/lib/components/ApplyTheme'
import Button from '@instructure/ui-core/lib/components/Button'
import Container from '@instructure/ui-core/lib/components/Container'
import Grid, {GridCol, GridRow} from '@instructure/ui-core/lib/components/Grid'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Link from '@instructure/ui-core/lib/components/Link'
import {MenuItem} from '@instructure/ui-core/lib/components/Menu'
import PopoverMenu from '@instructure/ui-core/lib/components/PopoverMenu'
import Text from '@instructure/ui-core/lib/components/Text'

import styles from '../../../styles/sandbox.css'
import dataGrids from '../../data-grids'

let appList = []
Object.keys(dataGrids).forEach(app => {
  appList.push(dataGrids[app])
})
appList = appList.sort(app => app.label)

export default class Header extends Component {
  constructor(props) {
    super(props)
  }

  onAppChange(event, value) {
    window.location = value
  }

  render() {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="header" className={styles.Header}>
          <Grid vAlign="middle" colSpacing="small">
            <GridRow>
              <GridCol>
                <Heading level="h1">
                  <Link href="/">Sandbox</Link>
                </Heading>
              </GridCol>

              <GridCol width="auto">
                <Text>{this.props.app}</Text>
              </GridCol>

              <GridCol width="auto">
                <PopoverMenu
                  onSelect={this.onAppChange}
                  trigger={<Button variant="primary">Apps</Button>}
                >
                  {appList.map(app => (
                    <MenuItem key={app.label} value={app.path}>
                      {app.label}
                    </MenuItem>
                  ))}
                </PopoverMenu>
              </GridCol>
            </GridRow>
          </Grid>
        </Container>
      </ApplyTheme>
    )
  }
}
