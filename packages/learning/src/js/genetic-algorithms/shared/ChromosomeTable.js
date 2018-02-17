import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Table from '@instructure/ui-core/lib/components/Table'

function ChromosomeRow(props) {
  return (
    <tr>
      <th scope="row">{props.version}</th>
      <td style={{fontFamily: 'monospace'}}>
        {props.chromosome && props.formatGenes(props.chromosome.genes)}
      </td>
      <td style={{textAlign: 'right'}}>
        {props.chromosome && props.chromosome.fitness.toString()}
      </td>
      <td style={{textAlign: 'right'}}>{props.chromosome && props.chromosome.iteration}</td>
    </tr>
  )
}

export default class ChromosomeTable extends PureComponent {
  static defaultProps = {
    formatGenes(genes) {
      return genes.join('')
    }
  }

  render() {
    return (
      <Table
        caption={
          <Heading level="h3" margin="x-small 0 0 small">
            Chromosomes
          </Heading>
        }
        margin={this.props.margin}
      >
        <thead>
          <tr>
            <th>Version</th>
            <th>Genes</th>
            <th>Fitness</th>
            <th>Iteration</th>
          </tr>
        </thead>

        <tbody>
          <ChromosomeRow
            chromosome={this.props.first}
            formatGenes={this.props.formatGenes}
            version="First"
          />

          <ChromosomeRow
            chromosome={this.props.current}
            formatGenes={this.props.formatGenes}
            version="Current"
          />

          <ChromosomeRow
            chromosome={this.props.best}
            formatGenes={this.props.formatGenes}
            version="Best"
          />

          <ChromosomeRow
            chromosome={this.props.target}
            formatGenes={this.props.formatGenes}
            version="Target"
          />
        </tbody>
      </Table>
    )
  }
}
