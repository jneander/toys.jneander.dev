import React from 'react';

import ApplyTheme from 'instructure-ui/lib/components/ApplyTheme';
import Container from 'instructure-ui/lib/components/Container';
import Heading from 'instructure-ui/lib/components/Heading';
import canvas from 'instructure-ui/lib/themes/canvas';

import Grid from 'js/apps/slick-grid/components/Grid';

import HeaderCellComponentFactory from 'js/apps/slick-grid/customization/HeaderCellComponentFactory';
import RowCellComponentFactory from 'js/apps/slick-grid/customization/RowCellComponentFactory';
import styles from 'styles/slick-grid/styles.css';

import { keyedData } from 'js/apps/slick-grid/examples/exampleData';

const headerCellFactory = new HeaderCellComponentFactory();
const rowCellFactory = new RowCellComponentFactory();

const headerHeight = 40;
const rowHeight = 36;
const rowClassNames = [styles['Row--even'], styles['Row--odd']];

class SlickGrid extends React.Component {
  state = {
    debug: {}
  };

  constructor (props) {
    super(props);

    this.debug = (debug) => { this.setState({ debug }) };
  }

  render () {
    return (
      <ApplyTheme theme={canvas}>
        <Container as="div" padding="large">
          {/*
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">SlickGrid Replacement</Heading>
          </Container>
          */}

          <main style={{ display: 'flex', flexDirection: 'row' }}>
            <Grid
              debug={this.debug}
              className={styles.Grid}
              columns={keyedData.columns}
              headerHeight={headerHeight}
              headerCellFactory={headerCellFactory}
              rowCellFactory={rowCellFactory}
              gridHeaderClassName={styles.GridHeader}
              gridBodyClassName={styles.GridBody}
              rowClassNames={rowClassNames}
              rowHeight={rowHeight}
              rows={keyedData.rows}
            />

            <div style={{ flex: '0 0 200px' }}>
              {
                Object.keys(this.state.debug).length > 0 && (
                  <ul>
                    {
                      Object.keys(this.state.debug).sort().map(key => (
                        <li key={key}>{ `${key}: ${this.state.debug[key]}` }</li>
                      ))
                    }
                  </ul>
                )
              }
            </div>
          </main>
        </Container>
      </ApplyTheme>
    );
  }
}

export default SlickGrid;
