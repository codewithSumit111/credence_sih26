import re

file_path = "c:\\Users\\HP\\Desktop\\credence\\credence_sih26\\src\\pages\\Plan.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add mapping function
mapping_func = """
const mapApiBlockToBlockItem = (b: any): BlockItem => ({
  id: b.id || b.block_id,
  track: b.track || b.track_id || 'TR-00',
  section: b.section || b.location_station_id || 'N/A',
  timeWindow: `${b.startTime || '00:00'} - ${b.endTime || '00:00'}`,
  startTime: b.startTime || '00:00',
  endTime: b.endTime || '00:00',
  duration: `${b.duration || 0} min`,
  departments: b.departments || ['ENG'],
  jobs: `${b.jobIds?.length || 1} ${b.bundled ? '(Bundled)' : ''}`,
  jobCount: b.jobIds?.length || 1,
  priority: (b.priorityScore > 0.5 ? 'HIGH' : b.priorityScore > 0.3 ? 'MEDIUM' : 'LOW'),
  status: b.status || 'AI-OPTIMIZED',
  affectedTrains: b.trainImpact ? (b.trainImpact > 0 ? 1 : 0) : (b.affectedTrains?.length || 0),
});
"""

# Replace `const [blocks, setBlocks] = useState<BlockItem[]>(BLOCKS_DATA);`
# with dynamic fetching.
content = content.replace("const [blocks, setBlocks] = useState<BlockItem[]>(BLOCKS_DATA);",
"""const [blocks, setBlocks] = useState<BlockItem[]>([]);
  
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const data = await blocksApi.getBlocks();
        setBlocks(data.map(mapApiBlockToBlockItem));
      } catch (e) {
        setBlocks(BLOCKS_DATA);
      }
    };
    fetchBlocks();
  }, []);
""")

# Add mapping func before default export component starts
content = content.replace("export default function Plan() {", mapping_func + "\nexport default function Plan() {")

# Rewrite handleRunOptimizer
new_optimizer = """  const handleRunOptimizer = async () => {
    setOptimizing(true);
    setOptimizerStep(0);
    try {
      const stepInterval = setInterval(() => {
        setOptimizerStep(prev => prev < OPTIMIZER_STEPS.length - 1 ? prev + 1 : prev);
      }, 800);
      
      const newPlan = await blocksApi.optimizeWeekly();
      clearInterval(stepInterval);
      
      setOptimizerStep(OPTIMIZER_STEPS.length);
      setBlocks(newPlan.map(mapApiBlockToBlockItem));
      toast.success('CP-SAT Optimization Complete', { description: `Generated ${newPlan.length} optimal possession blocks.` });
    } catch (e) {
      toast.error('Optimization failed', { description: 'Failed to run CP-SAT pipeline. Preserving current plan.' });
    } finally {
      setOptimizing(false);
      setOptimizerStep(-1);
    }
  };"""

content = re.sub(
    r"const handleRunOptimizer = async \(\) => \{.*?toast\.success\('CP-SAT Optimization Complete'[^\}]+\}\;\s*\};",
    new_optimizer,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Plan.tsx patched successfully!")
