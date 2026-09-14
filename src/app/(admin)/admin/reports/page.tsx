import { Flag } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/panel";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Moderation"
        description="Review reported users, reviews, and content."
      />
      <Panel>
        <EmptyState
          icon={Flag}
          title="No reports yet"
          description="CineTrack doesn't currently collect user-submitted reports. This area is ready to receive reported users, reviews, and content once the reporting feature is added to the backend."
        />
      </Panel>
    </div>
  );
}
