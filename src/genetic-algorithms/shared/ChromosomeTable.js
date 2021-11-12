import styles from './styles.module.css'

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

      <td style={{textAlign: 'right'}}>
        {props.chromosome && props.chromosome.iteration}
      </td>
    </tr>
  )
}

export default function ChromosomeTable(props) {
  return (
    <table className={styles.ChromosomeTable}>
      <caption className={styles.ChromosomeTableCaption}>
        <h3>Chromosomes</h3>
      </caption>

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
          chromosome={props.first}
          formatGenes={props.formatGenes}
          version="First"
        />

        <ChromosomeRow
          chromosome={props.current}
          formatGenes={props.formatGenes}
          version="Current"
        />

        <ChromosomeRow
          chromosome={props.best}
          formatGenes={props.formatGenes}
          version="Best"
        />

        <ChromosomeRow
          chromosome={props.target}
          formatGenes={props.formatGenes}
          version="Target"
        />
      </tbody>
    </table>
  )
}

ChromosomeTable.defaultProps = {
  formatGenes(genes) {
    return genes.join('')
  }
}
