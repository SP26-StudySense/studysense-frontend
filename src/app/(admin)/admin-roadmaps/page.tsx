import { RoadmapListPage, type Roadmap } from "@/features/admin/admin-roadmaps/RoadmapListPage";

// Mock data for roadmap list
const MOCK_ROADMAPS: Roadmap[] = [
  {
    id: "1",
    title: "Frontend Development Roadmap",
    description: "Complete roadmap for learning modern frontend development",
    categoryId: "1",
    categoryName: "Programming",
    subjectId: "1",
    subjectName: "Frontend Development",
    totalNodes: 11,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    title: "UI/UX Design Fundamentals",
    description: "Learn the essentials of user interface and experience design",
    categoryId: "2",
    categoryName: "Design",
    subjectId: "2",
    subjectName: "UI/UX Design",
    totalNodes: 8,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    title: "Backend Development with Node.js",
    description: "Master backend development using Node.js and Express",
    categoryId: "1",
    categoryName: "Programming",
    subjectId: "3",
    subjectName: "Backend Development",
    totalNodes: 15,
    createdAt: "2024-01-05T11:30:00Z",
    updatedAt: "2024-01-22T10:15:00Z",
  },
];

export default function RoadmapListRoute() {
  return <RoadmapListPage initialRoadmaps={MOCK_ROADMAPS} />;
}
