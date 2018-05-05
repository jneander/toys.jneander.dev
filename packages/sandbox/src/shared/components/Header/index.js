import React, {Component} from 'react'
import canvas from '@instructure/ui-themes/lib/canvas'
import ApplyTheme from '@instructure/ui-themeable/lib/components/ApplyTheme'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import View from '@instructure/ui-layout/lib/components/View'

import styles from './styles.css'

export default class Header extends Component {
  render() {
    return (
      <ApplyTheme theme={canvas}>
        <View as="header" className={styles.Header}>
          <Heading level="h1">
            <Link href="/">Sandbox</Link>
          </Heading>
        </View>
      </ApplyTheme>
    )
  }
}
