interface MetricsProps {
  iteration: number
}

export function Metrics(props: MetricsProps) {
  return <div>Iteration: {props.iteration}</div>
}
