export enum NodeOperationId {
  Constant = 'CONSTANT',
  TimeInSeconds = 'TIME_IN_SECONDS',
  NodePositionXFifthed = 'NODE_POSITION_X_FIFTHED',
  NegativeNodePositionYFifthed = 'NEGATIVE_NODE_POSITION_Y_FIFTHED',
  AddAxons = 'ADD_AXONS',
  SubtractAxon2FromAxon1 = 'SUBTRACT_AXON2_FROM_AXON1',
  MultiplyAxons = 'MULTIPLY_AXONS',
  DivideAxon2FromAxon1 = 'DIVIDE_AXON2_FROM_AXON1',
  ModuloAxon1WithAxon2 = 'MODULO_AXON1_WITH_AXON2',
  SineOfAxon1 = 'SINE_OF_AXON1',
  SigmoidOfAxon1 = 'SIGMOID_OF_AXON1',
  NodePressure = 'NODE_PRESSURE'
}

export const AXON_COUNT_BY_NODE_OPERATION_ID: {
  [key in NodeOperationId]: number
} = {
  [NodeOperationId.Constant]: 0,
  [NodeOperationId.TimeInSeconds]: 0,
  [NodeOperationId.NodePositionXFifthed]: 0,
  [NodeOperationId.NegativeNodePositionYFifthed]: 0,
  [NodeOperationId.AddAxons]: 2,
  [NodeOperationId.SubtractAxon2FromAxon1]: 2,
  [NodeOperationId.MultiplyAxons]: 2,
  [NodeOperationId.DivideAxon2FromAxon1]: 2,
  [NodeOperationId.ModuloAxon1WithAxon2]: 2,
  [NodeOperationId.SineOfAxon1]: 1,
  [NodeOperationId.SigmoidOfAxon1]: 1,
  [NodeOperationId.NodePressure]: 0
}

export const NODE_OPERATION_IDS = [
  NodeOperationId.Constant,
  NodeOperationId.TimeInSeconds,
  NodeOperationId.NodePositionXFifthed,
  NodeOperationId.NegativeNodePositionYFifthed,
  NodeOperationId.AddAxons,
  NodeOperationId.SubtractAxon2FromAxon1,
  NodeOperationId.MultiplyAxons,
  NodeOperationId.DivideAxon2FromAxon1,
  NodeOperationId.ModuloAxon1WithAxon2,
  NodeOperationId.SineOfAxon1,
  NodeOperationId.SigmoidOfAxon1,
  NodeOperationId.NodePressure
]

export const NODE_OPERATION_LABELS_BY_ID: {
  [key in NodeOperationId]: string
} = {
  [NodeOperationId.Constant]: '#',
  [NodeOperationId.TimeInSeconds]: 'time',
  [NodeOperationId.NodePositionXFifthed]: 'px',
  [NodeOperationId.NegativeNodePositionYFifthed]: 'py',
  [NodeOperationId.AddAxons]: '+',
  [NodeOperationId.SubtractAxon2FromAxon1]: '-',
  [NodeOperationId.MultiplyAxons]: '*',
  [NodeOperationId.DivideAxon2FromAxon1]: '÷',
  [NodeOperationId.ModuloAxon1WithAxon2]: '%',
  [NodeOperationId.SineOfAxon1]: 'sin',
  [NodeOperationId.SigmoidOfAxon1]: 'sig',
  [NodeOperationId.NodePressure]: 'pres'
}
