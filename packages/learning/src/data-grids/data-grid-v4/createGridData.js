const SUBJECTS = ['Math', 'Science', 'English', 'History']
const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', null]
const COMMENTS = [
  'eats boogers',
  'smells funny',
  'class clown',
  'steals markers',
  'wicked smart',
  'gluesniffer',
  'they/them',
  'future president',
  'clutz',
  'orphan',
  'good drawer',
  'math wiz'
]

function applyGrade(map, key) {
  const graded = Math.random() > 0.3
  const grade = GRADES[Math.floor(Math.random() * GRADES.length)]
  map.data[key] = grade
}

function createColumns(options) {
  let columns = [
    {id: 'studentName', name: 'Student Name', width: 200},
    {id: 'notes', name: 'Teacher Notes', width: 170}
  ]

  const assignmentColumns = []

  for (let i = 0; i < 24; i++) {
    const subject = SUBJECTS[i % 4]
    const unit = Math.floor(i / 4) + 1

    assignmentColumns.push({
      frozen: false,
      id: `${subject}-${unit}`,
      name: `${subject} ${unit}`,
      width: 150
    })
  }

  return columns.concat(assignmentColumns)
}

function createRows(columns, options) {
  const comments = [...COMMENTS]
  const rows = []

  for (let i = 1; i <= options.rowCount; i++) {
    const row = {data: {}, id: `student-${i}`}

    row.data.studentName = `Student ${i}`

    for (let j = 2; j < columns.length; j++) {
      applyGrade(row, columns[j].id)
    }

    if (Math.random() > 0.7 && comments.length) {
      row.data.notes = comments.shift()
    }
    rows.push(row)
  }

  return rows
}

export default function createGridData(options) {
  const columns = createColumns(options)

  return {
    columns,
    rows: createRows(columns, options)
  }
}
