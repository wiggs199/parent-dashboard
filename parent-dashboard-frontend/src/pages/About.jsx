import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function About() {
  return (
    <LegalLayout title={`About ${SITE.name}`}>
      <p className="text-base font-medium text-ink">
        {SITE.name} began with my son.
      </p>
      <p>
        When he was experiencing a speech delay, I found myself trying to keep
        track of everything &mdash; home exercises, therapy appointments, school
        forms, insurance letters, and all the little details that came with
        supporting his progress. Somehow, the information I needed most was
        scattered across a dozen different places.
      </p>
      <p>
        Every time a school or an insurer asked what we&rsquo;d been doing, it
        meant a late night piecing it back together from memory. So I built the
        tool I wished existed: one calm place to keep the log, the documents,
        and the notes &mdash; and to pull a clear summary out of it when someone
        needs one.
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
