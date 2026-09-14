import { Bell } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/panel";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Announcements"
        description="Manage platform announcements and delivery."
      />
      <Panel>
        <EmptyState
          icon={Bell}
          title="No announcements yet"
          description="The platform doesn't yet support in-app announcements. This area is structured to let you create and target announcements once a notification backend is added."
        />
      </Panel>
    </div>
  );
}
