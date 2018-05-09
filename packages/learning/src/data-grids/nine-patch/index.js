import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-elements/lib/components/Heading'

import Layout from '../../shared/components/Layout'
import NinePatch from './NinePatch'
import styles from './styles.css'

export default class NinePatchExample extends PureComponent {
  render() {
    return (
      <Layout>
        <div className={styles.Root}>
          <Heading level="h2">9-Patch</Heading>

          <div className={styles.ExampleContainer}>
            <NinePatch sectionHeights={[100, 300, 100]} sectionWidths={[200, 1000, 200]} />
          </div>
        </div>
      </Layout>
    )
  }
}
