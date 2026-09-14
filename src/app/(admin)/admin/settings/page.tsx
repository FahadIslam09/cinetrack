import { PageHeader, Panel } from "@/components/admin/panel";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Platform-level configuration. Only settings actually supported by the backend are shown."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="General" description="Core platform identity">
          <Row label="Site name" value="CineTrack" />
          <Row label="Primary language" value="English" />
          <Row label="Theme" value="Dark (user-facing)" />
        </Panel>

        <Panel title="User & Account" description="Registration and profile rules">
          <Row label="Sign-in method" value="Google OAuth" />
          <Row label="Username format" value="3–20 chars, a–z 0–9 _" />
          <Row label="Usernames" value="Permanent" />
        </Panel>

        <Panel title="Content" description="Media and review configuration">
          <Row label="Media types" value="Movies, Series, Anime" />
          <Row label="Rating scale" value="Poor → Masterpiece (5 levels)" />
          <Row label="Spoiler shield" value="Enabled" />
        </Panel>

        <Panel title="Community" description="Feedback and moderation">
          <Row label="Feature request statuses" value="6 states" />
          <Row label="Request priorities" value="Low, Medium, High" />
          <Row label="Reports / moderation" value="Not yet available" />
        </Panel>
      </div>

      <p className="text-xs text-slate-400">
        These values reflect the platform's current backend configuration. Additional
        configurable settings will appear here as backend support is added.
      </p>
    </div>
  );
}
