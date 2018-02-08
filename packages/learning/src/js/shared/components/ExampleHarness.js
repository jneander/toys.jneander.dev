import React from 'react';
import ApplyTheme from '@instructure/ui-core/lib/components/ApplyTheme';
import Container from '@instructure/ui-core/lib/components/Container';
import Heading from '@instructure/ui-core/lib/components/Heading';
import Select from '@instructure/ui-core/lib/components/Select';
import canvas from '@instructure/ui-themes/lib/canvas';

export default class ExampleHarness extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      selectedExample: props.defaultExample || props.examples[0]
    };
  }

  bindDebugger = (ref) => { this.debug = ref };

  onDebug = (debugData) => {
    this.debug.update(debugData);
  };

  onExampleChange = (event) => {
    this.setState({
      selectedExample: this.props.examples.find(example => example.label === event.target.value)
    });
  };

  render () {
    const Example = this.state.selectedExample;

    return (
      <ApplyTheme theme={canvas}>
        <Container as="div" padding="large">
          <main style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: '0 0 200px', margin: '0 20px 0 0' }}>
              <Container as="header" margin="0 0 medium 0">
                <Heading level="h2">{ this.props.heading }</Heading>
              </Container>

              <Container as="div" margin="0 0 medium 0">
                <Select
                  label="Examples"
                  onChange={this.onExampleChange}
                  value={Example.label}
                >
                  {
                    this.props.examples.map(example => (
                      <option key={example.label} value={example.label}>{ example.label }</option>
                    ))
                  }
                </Select>
              </Container>
            </div>

            <Example.component onDebug={this.onDebug}/>
          </main>
        </Container>
      </ApplyTheme>
    );
  }
}
