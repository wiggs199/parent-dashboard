import { Sparkles } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card } from "../components/ui";

export default function AISummary() {
  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="Neutral, observational summaries drawn only from what you've logged."
      />

      <Card className="mb-6 p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pine-soft text-pine">
            <Sparkles size={18} strokeWidth={1.75} />
          </span>
          <p className="text-sm leading-relaxed text-ink-soft">
            Weekly and monthly summaries will appear here once you've built up a
            few logs. They describe what was recorded — no scoring, no advice, no
            evaluation of progress.
          </p>
        </div>
      </Card>

      <p className="text-xs text-ink-faint">
        This is an organizational support tool. Summaries are not a clinical
        assessment.
      </p>
    </div>
  );
}
