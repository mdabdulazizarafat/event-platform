import React from 'react';

export const metadata = {
  title: 'Return Policy | Ayojok',
  description: 'Return and refund policy for using Ayojok services.',
};

export default function ReturnPolicyPage() {
  const lastUpdated = "August 31, 2026";

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <header className="mb-12 border-b border-primary/10 pb-8">
          <h1 className="text-4xl font-extrabold text-foreground font-heading mb-4">Return Policy</h1>
          <p className="text-on-surface-variant font-sans">Last Updated: {lastUpdated}</p>
        </header>

        {/* Content */}
        <article className="prose prose-slate prose-lg max-w-none text-on-surface-variant font-sans">
          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Eligibility for Refunds</h2>
          <p>
            Due to the nature of digital event ticketing, refunds are governed by the specific policies set by individual event organizers. However, Ayojok strictly regulates refunds under the following standard conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>The event is officially canceled or indefinitely postponed by the organizer.</li>
            <li>A technical error on the Ayojok platform resulted in duplicate charges or failure to deliver the digital ticket.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Non-Refundable Scenarios</h2>
          <p>
            The following are generally excluded from refunds:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Change of mind or inability to attend the event due to personal reasons.</li>
            <li>User-induced errors, such as purchasing tickets for the wrong date or event.</li>
            <li>Violation of event rules leading to denial of entry by the organizer.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. Requesting a Refund</h2>
          <p>
            If you believe you are eligible for a refund due to event cancellation or technical failure, please contact <a href="mailto:support@ayojok.com" className="text-primary hover:underline">support@ayojok.com</a> within 3 days of the incident or event date. Include your full name, order number, and description of the issue.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Refund Processing</h2>
          <p>
            If a refund is approved, the funds will be reversed directly to the Original Payment Method used during checkout. Please allow 5 to 7 Business Days for the funds to clear back into your account, dependent on your banking institution's settlement timeline.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Return Policy, please contact us at:
            <br />
            <a href="mailto:support@ayojok.com" className="text-primary hover:underline">support@ayojok.com</a>
            <br />
            Standard Response Time: Within 24 to 48 hours
          </p>
        </article>

      </div>
    </div>
  );
}
