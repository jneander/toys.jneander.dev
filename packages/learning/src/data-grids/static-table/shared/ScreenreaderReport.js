import React from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Table from '@instructure/ui-elements/lib/components/Table'

export default function ScreenreaderReport(props) {
  return (
    <Table caption={<Container padding="small">Screenreader Output</Container>}>
      <thead>
        <tr>
          <th>Action</th>
          <th>VoiceOver</th>
          <th>NVDA</th>
          <th>JAWS</th>
        </tr>
      </thead>

      <tbody>
        {props.data.map((datum, index) => (
          <tr key={index}>
            <td>{datum.action}</td>
            <td>{datum.voiceover || 'Not Tested'}</td>
            <td>{datum.nvda || 'Not Tested'}</td>
            <td>{datum.jaws || 'Not Tested'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
