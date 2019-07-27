import React, {Component} from 'react'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import IconGithub from '@instructure/ui-icons/lib/Solid/IconGithub'
import Link from '@instructure/ui-elements/lib/components/Link'
import List, {ListItem} from '@instructure/ui-elements/lib/components/List'
import Text from '@instructure/ui-elements/lib/components/Text'
import View from '@instructure/ui-layout/lib/components/View'

import styles from './styles.css'

export default class Sidebar extends Component {
  render() {
    return (
      <View as="nav" className={styles.Sidebar} padding="medium">
        <View as="header">
          <Heading level="h1">
            <Link href="/">Learning</Link>
          </Heading>
        </View>

        <View as="div" className={styles.Nav} margin="medium 0">
          <Text id="other-projects-label">Other Projects</Text>

          <List aria-labelledby="other-projects-label" margin="xx-small 0 0 0" variant="unstyled">
            <ListItem>
              <Link href="/genetic-algorithms">Genetic Algorithms</Link>
            </ListItem>
          </List>
        </View>

        <View className={styles.GithubLink}>
          <Link href="https://github.com/jneander/jneander/tree/master/packages/learning">
            <Text size="small">View on Github</Text> <IconGithub />
          </Link>
        </View>
      </View>
    )
  }
}
