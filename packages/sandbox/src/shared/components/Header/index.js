import React, {Component} from 'react'
import canvas from '@instructure/ui-themes/lib/canvas'
import ApplyTheme from '@instructure/ui-core/lib/components/ApplyTheme'
import Container from '@instructure/ui-core/lib/components/Container'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Link from '@instructure/ui-core/lib/components/Link'

import styles from './styles.css'

export default class Header extends Component {
  render() {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="header" className={styles.Header}>
          <Heading level="h1">
            <Link href="/">Sandbox</Link>
          </Heading>
        </Container>
      </ApplyTheme>
    )
  }
}
