import {ChangeEvent} from 'react'

import {NumberInputField} from '../../../shared/components'
import {MAXIMUM_BOARD_SIZE, MINIMUM_BOARD_SIZE} from '../constants'

interface ConfigurationProps {
  boardSize: number
  disabled: boolean
  onBoardSizeChange: (size: number) => void
}

export default function Configuration(props: ConfigurationProps) {
  function handleBoardSizeChange(event: ChangeEvent<HTMLInputElement>) {
    const size = Number.parseInt(event.target.value, 10)

    if (size >= 4 && size <= 20) {
      props.onBoardSizeChange(size)
    }
  }

  return (
    <div style={{maxWidth: '10rem'}}>
      <NumberInputField
        disabled={props.disabled}
        labelText="Board Size"
        max={MAXIMUM_BOARD_SIZE}
        min={MINIMUM_BOARD_SIZE}
        step="1"
        onChange={handleBoardSizeChange}
        value={props.boardSize}
      />
    </div>
  )
}
