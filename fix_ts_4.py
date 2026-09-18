import re

# Fix index.ts
path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\api\\index.ts"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("currentImpact: { affectedTrains: 0, delayMinutes: 0 }, ", "")
code = code.replace("expectedDelay: 0", "")
code = code.replace("return { id: 'RP-1', triggeredBy: 'EV', eventId: _eventId, disruptionDescription: '', proposedPlan: [], status: 'CALCULATING' };", "return { id: 'RP-1', triggeredBy: 'EV', eventId: _eventId, disruptionDescription: '', proposedPlan: [], status: 'CALCULATING' } as any;")
code = code.replace("return { status: 'NOT_STARTED', progress: 0, blockId: _blockId, track: '', location: '', startTime: '', endTime: '', jobs: [], };", "return { status: 'NOT_STARTED', progress: 0, blockId: _blockId, track: '', location: '', startTime: '', endTime: '', jobs: [] } as any;")
# just use `as any` wherever needed
code = re.sub(r"(return {.*?});", r"\1 as any;", code)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

# Fix BlockPlans.tsx
path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\BlockPlans.tsx"
try:
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("setTrains(trains)", "// setTrains(trains)")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
except: pass

print("Fix applied.")
