const SUBJECTS = ['Math', 'Science', 'English', 'History']

const columns = [
  {frozen: true, id: 'studentName', name: 'Student Name', width: 200},
  {frozen: true, id: 'notes', name: 'Teacher Notes', width: 170}
]

for (let i = 0; i < 24; i++) {
  const subject = SUBJECTS[i % 4]
  const unit = Math.floor(i / 4) + 1
  columns.push({frozen: false, id: `${subject}-${unit}`, name: `${subject} ${unit}`, width: 150})
}

const rows = []
for (let i = 0; i < 100; i++) {
  rows.push({id: `student-${i + 1}`, studentName: `Student ${i + 1}`})
}

export {columns, rows}
