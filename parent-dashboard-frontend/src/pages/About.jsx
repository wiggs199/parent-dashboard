import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function About() {
  return (
    <LegalLayout title={`About ${SITE.name}`}>
      <p className="text-base font-medium text-ink">
        {SITE.name} began with my son, Chase.
      </p>
      <p>
        When he experienced a speech delay, I found myself trying to keep track
        of everything &mdash; home exercises, therapy appointments, school
        forms, insurance paperwork, and all the little details that came with
        supporting his progress. The information I needed most was scattered
        everywhere: in my Notes app, a folder on the counter, buried email
        attachments, and spreadsheets that quickly became outdated.
      </p>
      <p>
        Whenever I needed to share his history or provide documentation, I found
        myself piecing everything back together.
      </p>
      <p>
        So I built the tool I wished existed: one calm place to keep the logs,
        documents, and notes &mdash; and to turn them into a clear summary
        whenever someone needs one.
      </p>

      <LegalSection heading="Who it&rsquo;s for">
        <p>
          It began with speech, but the problem isn&rsquo;t specific to any one
          diagnosis. If you&rsquo;re a parent keeping track of appointments,
          exercises, notes, and paperwork for your child &mdash; occupational or
          physical therapy, learning support, behavioral or social goals,
          managing a chronic condition, or just staying on top of regular
          doctor visits &mdash; {SITE.name} is built for that. It doesn&rsquo;t
          assume anything about why you&rsquo;re tracking. It just gives the
          information one place to live.
        </p>
      </LegalSection>

      <LegalSection heading="What it is">
        <p>
          An organizing tool for parents and caregivers. It holds what
          you&rsquo;ve been tracking anyway and makes it easy to find, review,
          and share.
        </p>
      </LegalSection>

      <LegalSection heading="What it is not">
        <p>
          {SITE.name} is not therapy, medical advice, diagnosis, or an
          assessment of any child&rsquo;s progress or ability. It doesn&rsquo;t
          score anything, doesn&rsquo;t recommend exercises or treatment, and
          doesn&rsquo;t tell you whether your child is &ldquo;on track.&rdquo;
          Those are conversations for you and the professionals who know your
          child. This is just the place the information lives.
        </p>
      </LegalSection>

      <LegalSection heading="Where things stand">
        <p>
          This is early, and it&rsquo;s small &mdash; a personal project, not a
          company. Features are still being added, and your feedback genuinely
          shapes what gets built next. If something is broken, confusing, or
          missing, I want to hear about it.
        </p>
      </LegalSection>

      <LegalSection heading="Get in touch">
        <p>
          Questions, feedback, or a problem:{" "}
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="font-medium text-pine-dark hover:underline"
          >
            {SITE.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
