import re
import os

def fix_api_index():
    path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\api\\index.ts"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # Fix PENDING status error in ReoptimizationPlan
    code = code.replace("status: 'PENDING'", "status: 'CALCULATING'")

    # Fix id in FieldBlock
    code = code.replace("id: _blockId,", "")

    # Fix trainsApi.getTrain
    get_train = """
  async getTrain(id: string): Promise<Train | undefined> {
    const trains = await this.getTrains();
    return trains.find(t => t.id === id || t.number === id);
  },
"""
    code = code.replace("async getTrains(): Promise<Train[]> {", get_train + "  async getTrains(): Promise<Train[]> {")

    with open(path, "w", encoding="utf-8") as f:
        f.write(code)

def fix_blockplans():
    path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\BlockPlans.tsx"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("import { priorityApi, blocksApi, approvalsApi }", "import { priorityApi, blocksApi, approvalsApi, trainsApi }")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)

def fix_command():
    path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\Command.tsx"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
    code = code.replace("recommendedBlock: OptimizedBlock;", "recommendedBlock?: OptimizedBlock;")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)

def fix_overview():
    path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\Overview.tsx"
    try:
        with open(path, "r", encoding="utf-8") as f:
            code = f.read()
        code = code.replace("recommendedBlock: OptimizedBlock;", "recommendedBlock?: OptimizedBlock;")
        with open(path, "w", encoding="utf-8") as f:
            f.write(code)
    except: pass

def fix_requests():
    for filename in ["NewBlockRequest.tsx", "Requests.tsx"]:
        path = f"c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\{filename}"
        try:
            with open(path, "r", encoding="utf-8") as f:
                code = f.read()
            code = code.replace("blocksApi.submitRequest(", "blocksApi.createRequest(")
            with open(path, "w", encoding="utf-8") as f:
                f.write(code)
        except: pass

fix_api_index()
try: fix_blockplans()
except: pass
try: fix_command()
except: pass
try: fix_overview()
except: pass
try: fix_requests()
except: pass

print("Fixes applied.")
