import React, {Component} from 'react'
import ApplyTheme from '@instructure/ui-themeable/lib/components/ApplyTheme'
import Container from '@instructure/ui-container/lib/components/Container'
import Link from '@instructure/ui-elements/lib/components/Link'
import List, {ListItem} from '@instructure/ui-elements/lib/components/List'
import canvas from '@instructure/ui-themes/lib/canvas'

import projects from '../../../projects'
import styles from './styles.css'

let pageList = []
Object.keys(projects).forEach(app => {
  const entry = {key: app, ...projects[app]}
  if (app !== 'home') {
    pageList.push(entry)
  }
})
pageList = pageList.sort(app => app.label)

export default class Sidebar extends Component {
  render() {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="aside" className={styles.Sidebar} padding="medium">
          <nav className={styles.Navigation}>
            <List variant="unstyled">
              {pageList.map(page => (
                <ListItem key={page.key}>
                  <Link href={page.path}>{page.label}</Link>
                </ListItem>
              ))}
            </List>
          </nav>
        </Container>
      </ApplyTheme>
    )
  }
}
