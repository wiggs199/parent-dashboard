import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="September 2026">
      <p>
        {SITE.name} is a tool that helps a parent or caregiver organize
        information about their child's activities, notes, and documents. This
        policy explains what we collect, why, and what we do with it. It is a
        starting point and should be reviewed by a professional before wider
        launch.
      </p>

      <LegalSection heading="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information</strong> — your email address, an
            optional name, and a hashed (never plain-text) password.
          </li>
          <li>
            <strong>Content you enter</strong> — the names you give your
            children, activity logs (dates, types, mood ratings, notes), and any
            documents you upload.
          </li>
          <li>
            <strong>Basic technical data</strong> — standard server logs (IP
            address, request time) kept for security and debugging.
          </li>
        </ul>
        <p>
          You decide what to put in. Please avoid entering more sensitive detail
          than you need for your own organization.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          Only to provide the service: to sign you in, show you your own data,
          and (in a future version) generate plain summaries of what you logged.
          We do not sell your data or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="Who can see it">
        <p>
          Your data is scoped to your account — other users cannot see it. We
          use infrastructure providers to run the service (currently Render for
          the application and Neon for the database, both in the United States).
          They process data on our behalf under their own terms. We disclose
          data otherwise only if required by law.
        </p>
      </LegalSection>

      <LegalSection heading="Children's data">
        <p>
          The account holder is an adult parent or caregiver. Information about a
          child is entered by that adult for their own record-keeping. This is
          not a service directed at children, and children do not have accounts.
        </p>
      </LegalSection>

      <LegalSection heading="Retention and deletion">
        <p>
          We keep your data until you delete it or ask us to. Email{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-sage-dark hover:underline">
            {SITE.contactEmail}
          </a>{" "}
          to request export or deletion of your account and its contents.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Passwords are hashed with bcrypt. Traffic is served over HTTPS. No
          system is perfectly secure, but we aim to follow sensible practices
          and keep the amount of data collected small.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If this policy changes materially, we'll update the date above and,
          where practical, notify you by email.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-sage-dark hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
