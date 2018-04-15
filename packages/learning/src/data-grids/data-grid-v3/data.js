const SUBJECTS = ['Math', 'Science', 'English', 'History']

const columns = [{id: 'studentName', name: 'Student Name', width: 200}]

for (let i = 0; i < 24; i++) {
  const subject = SUBJECTS[i % 4]
  const unit = Math.floor(i / 4) + 1
  columns.push({id: `${subject}-${unit}`, name: `${subject} ${unit}`, width: 150})
}

const rows = []
for (let i = 0; i < 100; i++) {
  rows.push({id: `student-${i + 1}`, studentName: `Student ${i + 1}`})
}

export {columns, rows}
