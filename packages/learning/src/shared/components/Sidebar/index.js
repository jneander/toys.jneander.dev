import React, {Component} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import List, {ListItem} from '@instructure/ui-elements/lib/components/List'
import Text from '@instructure/ui-elements/lib/components/Text'

import styles from './styles.css'

export default class Sidebar extends Component {
  render() {
    return (
      <Container as="nav" className={styles.Sidebar}>
        <Container as="header" margin="medium">
          <Heading level="h1">
            <Link href="/">Learning</Link>
          </Heading>
        </Container>

        <Container as="div" margin="medium">
          <Text id="data-grids-label">Data Grids</Text>

          <List aria-labelledby="data-grids-label" margin="xx-small 0 small 0" variant="unstyled">
            <ListItem>
              <Link href="/data-grids/static-table">Static Table</Link>
            </ListItem>

            <ListItem>
              <Link href="/data-grids/static-grid">Static Grid</Link>
            </ListItem>

            <ListItem>
              <Link href="/data-grids/aria-data-tables">ARIA Data Tables</Link>
            </ListItem>

            <ListItem>
              <Link href="/data-grids/aria-layout-grids">ARIA Layout Grids</Link>
            </ListItem>

            <ListItem>
              <Link href="/data-grids/data-grid-v1">Data Grid v1</Link>
            </ListItem>

            <ListItem>
              <Link href="/data-grids/data-grid-v2">Data Grid v2</Link>
            </ListItem>
          </List>

          <Text id="other-projects-label">Other Projects</Text>

          <List aria-labelledby="other-projects-label" margin="xx-small 0 0 0" variant="unstyled">
            <ListItem>
              <Link href="/genetic-algorithms">Genetic Algorithms</Link>
            </ListItem>
          </List>
        </Container>
      </Container>
    )
  }
}
