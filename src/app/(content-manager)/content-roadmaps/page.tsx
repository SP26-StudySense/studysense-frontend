import { RoadmapListPage } from "@/features/content-manager/roadmaps";
import { MOCK_PAGINATED_RESPONSE } from "@/features/content-manager";

export default function ContentRoadmapsPage() {
  const initialData = MOCK_PAGINATED_RESPONSE(0, 6);
  return <RoadmapListPage initialData={initialData} />;
}
