import React, {Component} from 'react'
import ApplyTheme from '@instructure/ui-core/lib/components/ApplyTheme'
import Container from '@instructure/ui-core/lib/components/Container'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Link from '@instructure/ui-core/lib/components/Link'
import {MenuItem} from '@instructure/ui-core/lib/components/Menu'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import Select from '@instructure/ui-core/lib/components/Select'
import Text from '@instructure/ui-core/lib/components/Text'
import canvas from '@instructure/ui-themes/lib/canvas'

import projects from '../../../projects'
import styles from './styles.css'

let appList = []
Object.keys(projects).forEach(app => {
  const entry = {key: app, ...projects[app]}
  if (app === 'home') {
    appList.unshift(entry)
  } else {
    appList.push(entry)
  }
})
appList = appList.sort(app => app.label)

export default class Header extends Component {
  constructor(props) {
    super(props)
  }

  onAppChange(event) {
    window.location = projects[event.target.value].path
  }

  render() {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="header" className={styles.Header}>
          <div className={styles.Heading}>
            <Heading level="h1">
              <Link href="/">Learning Platform</Link>
            </Heading>
          </div>

          {this.props.page && (
            <div className={styles.AppName}>
              <Text>{this.props.app}</Text>
            </div>
          )}

          {this.props.page && (
            <div className={styles.Navigation}>
              <Select
                label={<ScreenReaderContent>Apps</ScreenReaderContent>}
                layout="inline"
                onChange={this.onAppChange}
                value={this.props.page}
              >
                {appList.map(app => (
                  <option key={app.key} value={app.key}>
                    {app.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </Container>
      </ApplyTheme>
    )
  }
}
