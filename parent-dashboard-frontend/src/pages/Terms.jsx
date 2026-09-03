import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Use" updated="September 2026">
      <p>
        By creating an account you agree to these terms. They are a starting
        point and should be reviewed by a professional before wider launch.
      </p>

      <LegalSection heading="What this is">
        <p>
          {SITE.name} is an organizational support tool. It is{" "}
          <strong>not</strong> therapy, medical advice, diagnosis, or an
          assessment of any child's progress or ability. Nothing in the app,
          including any automated summary, should be treated as professional
          guidance. Always rely on qualified professionals for care decisions.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          You're responsible for keeping your login details private and for the
          content you enter. Enter information about a child only if you are that
          child's parent or legal guardian, or are otherwise authorized to do
          so.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>
          Don't use the service to break the law, to store content you have no
          right to store, or to attempt to access other users' data or disrupt
          the service.
        </p>
      </LegalSection>

      <LegalSection heading="Availability and changes">
        <p>
          The service is provided "as is," without warranties of any kind. It's
          early software — features may change or break, and we may modify or
          discontinue it. We'll give reasonable notice of major changes where we
          can.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          To the extent permitted by law, {SITE.name} and its operator are not
          liable for indirect or consequential losses, or for decisions made in
          reliance on the app. Keep your own copies of anything important.
        </p>
      </LegalSection>

      <LegalSection heading="Ending your use">
        <p>
          You can delete your account at any time. We may suspend or close an
          account that violates these terms.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of {SITE.jurisdiction}, without
          regard to conflict-of-law rules.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-pine-dark hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
