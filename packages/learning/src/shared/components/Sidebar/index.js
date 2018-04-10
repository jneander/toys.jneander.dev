import React, {Component} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import List, {ListItem} from '@instructure/ui-elements/lib/components/List'

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
      <Container as="nav" className={styles.Sidebar}>
        <Container as="header" margin="medium">
          <Heading level="h1">
            <Link href="/">Learning</Link>
          </Heading>
        </Container>

        <List variant="unstyled" margin="medium">
          {pageList.map(page => (
            <ListItem key={page.key}>
              <Link href={page.path}>{page.label}</Link>
            </ListItem>
          ))}
        </List>
      </Container>
    )
  }
}
