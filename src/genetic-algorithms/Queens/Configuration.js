import {NumberInputField} from '../../shared/components'

export default function Configuration(props) {
  function handleBoardSizeChange(event) {
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
        max="20"
        min="4"
        step="1"
        onChange={handleBoardSizeChange}
        value={props.boardSize}
      />
    </div>
  )
}
