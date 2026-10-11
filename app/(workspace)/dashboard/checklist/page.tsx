import { ListChecks } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ChecklistPage() {
  return (
    <section className="py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        Month-end, made clear
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Ledger checklist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A practical view of what is ready and what is still missing.
      </p>
      <Empty className="mt-8">
        <EmptyMedia>
          <ListChecks className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Your checklist will take shape here.</EmptyTitle>
        <EmptyDescription>
          Once your documents are in, you can review what is ready for your books.
        </EmptyDescription>
      </Empty>
    </section>
  );
}
