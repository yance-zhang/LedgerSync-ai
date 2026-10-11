import { Settings } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function SettingsPage() {
  return (
    <section className="py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        Your preferences
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Account and workspace preferences.</p>
      <Empty className="mt-8">
        <EmptyMedia>
          <Settings className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Your workspace settings are on the way.</EmptyTitle>
        <EmptyDescription>Account preferences will be available here.</EmptyDescription>
      </Empty>
    </section>
  );
}
