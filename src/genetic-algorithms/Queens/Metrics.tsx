interface MetricsProps {
  iteration: number
}

export default function Metrics(props: MetricsProps) {
  return (
    <div>
      <span>Iteration: </span>
      <span>{props.iteration}</span>
    </div>
  )
}
