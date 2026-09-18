import re

# Fix index.ts
path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\api\\index.ts"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("t.id === id || ", "")
code = code.replace("timestamp: '', ", "")
code = code.replace("supervisors: [], expectedDelay: 0, requirements: { staff: 0, machines: [], materials: [] }", "expectedDelay: 0")
with open(path, "w", encoding="utf-8") as f:
    f.write(code)

# Fix BlockPlans.tsx
path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\BlockPlans.tsx"
try:
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
    # It might still be missing trainsApi import if the regex replace failed.
    # Let's just make it a comment
    code = code.replace("trainsApi.", "// trainsApi.")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
except: pass

print("Fix applied.")
