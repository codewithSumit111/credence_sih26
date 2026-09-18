import re

file_path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\BlockPlans.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
"""    startTime: '10:30',
    endTime: '11:45',
const OPTIMIZER_STEPS = [""",
"""    startTime: '10:30',
    endTime: '11:45',
    duration: '75 min',
    departments: ['ENG'],
    jobs: '1',
    jobCount: 1,
    priority: 'MEDIUM',
    status: 'AI-OPTIMIZED',
    affectedTrains: 1
  }
];

const OPTIMIZER_STEPS = ["""
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed BlockPlans.tsx")
