import { RoadmapEditPage } from "@/features/content-manager/roadmaps/RoadmapEditPage";
import { MOCK_ROADMAP_DETAIL, MOCK_NODE_CONTENTS } from "@/features/content-manager/mock-data";

export default function ContentRoadmapEditPage({ params }: { params: { id: string } }) {
  // In real app, fetch roadmap detail by id
  // For now, use comprehensive mock data with full graph structure
  
  return (
    <RoadmapEditPage 
      roadmapDetail={MOCK_ROADMAP_DETAIL} 
      nodeContents={MOCK_NODE_CONTENTS}
    />
  );
}
