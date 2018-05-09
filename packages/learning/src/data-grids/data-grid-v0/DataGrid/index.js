import React, {PureComponent} from 'react'
import Measure from 'react-measure'

import Grid from './components/Grid'
import ScrollContainer from './components/ScrollContainer'

export default class DataGrid extends PureComponent {
  render() {
    return (
      <Measure client>
        {({contentRect, innerRef}) => (
          <ScrollContainer
            {...this.props}
            measureRef={innerRef}
            height={contentRect.client.clientHeight}
            width={contentRect.client.clientWidth}
          />
        )}
      </Measure>
    )
  }
}
