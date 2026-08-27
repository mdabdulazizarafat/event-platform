import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Ayojok',
  description: 'Terms and conditions for using Ayojok services.',
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "August 12, 2026";

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <header className="mb-12 border-b border-primary/10 pb-8">
          <h1 className="text-4xl font-extrabold text-foreground font-heading mb-4">Terms & Conditions</h1>
          <p className="text-on-surface-variant font-sans">Last Updated: {lastUpdated}</p>
        </header>

        {/* Content */}
        <article className="prose prose-slate prose-lg max-w-none text-on-surface-variant font-sans">
          <p>
            Welcome to <strong>Ayojok</strong>. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Acceptance of Terms</h2>
          <p>
            By creating an account, hosting an event, or purchasing a ticket, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. Event Hosting (Organizers)</h2>
          <p>
            If you are an organizer hosting an event through Ayojok:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>You are solely responsible for your event and ensuring it complies with all local laws and regulations.</li>
            <li>You must accurately describe the event, including any fees, location details, and refund policies.</li>
            <li>Ayojok is not responsible for the execution, quality, or safety of any event hosted on our platform.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">4. Purchasing Tickets (Attendees)</h2>
          <p>
            If you are purchasing a ticket through Ayojok:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>You agree to pay all charges incurred by you or any users of your account at the prices in effect when such charges are incurred.</li>
            <li>Refund policies are set by the individual Event Organizers. Ayojok does not issue refunds unless directed by the Organizer or required by law.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">5. Intellectual Property</h2>
          <p>
            All content, features, and functionality on the platform (including text, graphics, logos, and software) are owned by Ayojok and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall Ayojok, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            <a href="mailto:ayojok@rongplan.com" className="text-primary hover:underline">legal@rongplan.com</a>
          </p>
        </article>

      </div>
    </div>
  );
}
