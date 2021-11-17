interface MetricsProps {
  iteration: number
}

export default function Metrics(props: MetricsProps) {
  return <div>Iteration: {props.iteration}</div>
}
