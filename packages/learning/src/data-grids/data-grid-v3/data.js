const SUBJECTS = ['Math', 'Science', 'English', 'History']
const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', null]
const COMMENTS = [
  'eats boogers',
  'smells funny',
  'class clown',
  'klepto',
  'wicked smart',
  'gluesniffer',
  'they/them',
  'good drawer',
  'math wiz'
]

function applyGrade(map, key) {
  const graded = Math.random() > 0.3
  const grade = GRADES[Math.floor(Math.random() * GRADES.length)]
  map[key] = grade
}

let columns = [
  {frozen: true, id: 'studentName', name: 'Student Name', width: 200},
  {frozen: true, id: 'notes', name: 'Teacher Notes', width: 170}
]

const assignmentColumns = []

for (let i = 0; i < 24; i++) {
  const subject = SUBJECTS[i % 4]
  const unit = Math.floor(i / 4) + 1
  assignmentColumns.push({frozen: false, id: `${subject}-${unit}`, name: `${subject} ${unit}`, width: 150})
}

const rows = []
for (let i = 0; i < 100; i++) {
  const row = {id: `student-${i + 1}`, studentName: `Student ${i + 1}`}
  for (let j = 0; j < assignmentColumns.length; j++) {
    applyGrade(row, assignmentColumns[j].id)
  }
  if (Math.random() > 0.7 && COMMENTS.length) {
    row.notes = COMMENTS.shift()
  }
  rows.push(row)
}

columns = columns.concat(assignmentColumns)

export {columns, rows}
