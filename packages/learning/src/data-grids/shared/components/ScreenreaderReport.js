import React from 'react'
import Table from '@instructure/ui-elements/lib/components/Table'
import View from '@instructure/ui-layout/lib/components/View'

export default function ScreenreaderReport(props) {
  return (
    <Table caption={<View padding="small">Screenreader Output</View>}>
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
