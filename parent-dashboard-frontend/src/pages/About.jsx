import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function About() {
  return (
    <LegalLayout title={`About ${SITE.name}`}>
      <p>
        {SITE.name} started as one parent&rsquo;s attempt to get a handle on the
        paperwork. Between home exercises, therapy appointments, school forms,
        and insurance letters, the information about our child lived in a dozen
        places &mdash; the notes app, a folder on the counter, buried email
        attachments, a spreadsheet no one kept up. Every time a school or an
        insurer asked what we&rsquo;d been doing, it meant a late night piecing
        it back together from memory.
      </p>
      <p>
        So I built the tool I wished existed: one calm place to keep the log,
        the documents, and the notes &mdash; and to pull a clean summary out of
        it when someone needs one.
      </p>

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
