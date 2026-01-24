import { AdminRoadmapPage } from "@/features/admin/admin-roadmaps";
import { RoadmapNodeData } from "@/features/roadmaps/components/RoadmapNode";
import { RoadmapEdge } from "@/features/roadmaps/components/RoadmapGraph";

// Mock data - reusing from user roadmap
const MOCK_NODES: RoadmapNodeData[] = [
  {
    id: "1",
    title: "HTML Basics",
    status: "done",
    completedTasks: 4,
    totalTasks: 4,
    duration: 120,
    difficulty: "beginner",
    x: 320,
    y: 20,
  },
  {
    id: "2",
    title: "CSS Fundamentals",
    status: "done",
    completedTasks: 4,
    totalTasks: 4,
    duration: 180,
    difficulty: "beginner",
    x: 80,
    y: 180,
  },
  {
    id: "3",
    title: "JavaScript Basics",
    status: "done",
    completedTasks: 5,
    totalTasks: 5,
    duration: 240,
    difficulty: "beginner",
    x: 480,
    y: 180,
  },
  {
    id: "4",
    title: "Tailwind CSS",
    status: "in_progress",
    completedTasks: 2,
    totalTasks: 4,
    duration: 150,
    difficulty: "intermediate",
    x: 20,
    y: 360,
  },
  {
    id: "5",
    title: "React Fundamentals",
    status: "in_progress",
    completedTasks: 3,
    totalTasks: 5,
    duration: 300,
    difficulty: "intermediate",
    x: 280,
    y: 360,
  },
  {
    id: "6",
    title: "Git & Version Control",
    status: "done",
    completedTasks: 4,
    totalTasks: 4,
    duration: 120,
    difficulty: "beginner",
    x: 560,
    y: 360,
  },
  {
    id: "7",
    title: "Component Libraries",
    status: "not_started",
    completedTasks: 0,
    totalTasks: 4,
    duration: 180,
    difficulty: "intermediate",
    x: 20,
    y: 540,
  },
  {
    id: "8",
    title: "TypeScript",
    status: "not_started",
    completedTasks: 0,
    totalTasks: 5,
    duration: 240,
    difficulty: "intermediate",
    x: 240,
    y: 540,
  },
  {
    id: "9",
    title: "React Hooks Deep",
    status: "not_started",
    completedTasks: 0,
    totalTasks: 4,
    duration: 200,
    difficulty: "intermediate",
    x: 460,
    y: 540,
  },
  {
    id: "10",
    title: "CI/CD Pipelines",
    status: "locked",
    completedTasks: 0,
    totalTasks: 3,
    duration: 150,
    difficulty: "advanced",
    x: 680,
    y: 540,
  },
  {
    id: "11",
    title: "Next.js Fundamentals",
    status: "locked",
    completedTasks: 0,
    totalTasks: 6,
    duration: 300,
    difficulty: "advanced",
    x: 350,
    y: 720,
  },
];

const MOCK_EDGES: RoadmapEdge[] = [
  { from: "1", to: "2" },
  { from: "1", to: "3" },
  { from: "2", to: "4" },
  { from: "3", to: "5" },
  { from: "3", to: "6" },
  { from: "4", to: "7" },
  { from: "5", to: "8" },
  { from: "5", to: "9" },
  { from: "6", to: "10" },
  { from: "8", to: "11" },
  { from: "9", to: "11" },
];

export default function RoadmapPage() {
  const handleAddNode = () => {
    console.log("Add node");
  return (
    <div className="h-[calc(100vh-160px)]">
      <AdminRoadmapPage initialNodes={MOCK_NODES} initialEdges={MOCK_EDGES} />
    </div>
  );
}}
