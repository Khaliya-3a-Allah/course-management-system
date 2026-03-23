/**
 * TermsContent — Terms & Conditions text for the course platform.
 * Rendered as children inside the Modal component.
 */
export default function TermsContent() {
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
      <Section title="1. Acceptance of Terms">
        By creating an account on LearnHub, you agree to be bound by these Terms
        and Conditions. If you do not agree to all the terms stated here, you
        may not access or use the platform.
      </Section>

      <Section title="2. User Accounts">
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activities that occur under your account. You
        must provide accurate, current, and complete information during
        registration. LearnHub reserves the right to suspend or terminate
        accounts that violate these terms.
      </Section>

      <Section title="3. Course Content & Intellectual Property">
        All course materials, including videos, documents, quizzes, and
        supplementary resources, are the intellectual property of their
        respective instructors or LearnHub. You may not reproduce, distribute,
        or create derivative works from any course content without explicit
        written permission from the content owner.
      </Section>

      <Section title="4. Student Responsibilities">
        As a student, you agree to use course materials solely for personal
        educational purposes. You will not share your account access with
        others, submit plagiarized work, or engage in any activity that
        disrupts the learning experience for other users.
      </Section>

      <Section title="5. Instructor Responsibilities">
        As an instructor, you warrant that you have the right to publish all
        content you upload. You agree to provide accurate course descriptions,
        respond to student inquiries in a timely manner, and maintain the
        quality of your course materials. Instructors may not include
        misleading information or engage in deceptive practices.
      </Section>

      <Section title="6. Acceptable Use">
        You agree not to use the platform to transmit harmful, offensive, or
        illegal content. Harassment, hate speech, spam, and any form of
        discriminatory behavior are strictly prohibited. Violations may result
        in immediate account termination.
      </Section>

      <Section title="7. Privacy">
        LearnHub collects and processes personal data in accordance with our
        Privacy Policy. By using the platform, you consent to the collection of
        data necessary to provide and improve our services. We do not sell your
        personal information to third parties.
      </Section>

      <Section title="8. Limitation of Liability">
        LearnHub is provided on an &ldquo;as is&rdquo; basis. We make no
        warranties regarding the accuracy, completeness, or reliability of any
        course content. LearnHub shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the
        platform.
      </Section>

      <Section title="9. Changes to Terms">
        LearnHub reserves the right to modify these Terms and Conditions at any
        time. Continued use of the platform after changes are posted
        constitutes acceptance of the updated terms. We will notify registered
        users of significant changes via email.
      </Section>

      <p className="text-[0.75rem] text-text-faint italic mt-2 font-body">
        Last updated: March 2026. If you have questions about these terms,
        please contact support@learnhub.com.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-[0.88rem] font-bold text-text-secondary m-0 font-body">{title}</h3>
      <p className="text-[0.82rem] text-text-muted leading-relaxed m-0 font-body">{children}</p>
    </div>
  );
}
