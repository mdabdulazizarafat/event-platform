import React from 'react';

export const metadata = {
  title: 'Return Policy | Somavesh',
  description: 'Return and refund policy for using Somavesh services.',
};

export default function ReturnPolicyPage() {
  const lastUpdated = "August 31, 2026";

  return (
    <div className="min-h-screen bg-background pb-16">

              {/* Hero Section */}
      <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-24 pb-4 md:pt-36 md:pb-8">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
        <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

        {/* Bottom gradient fade to blend hero bg with main page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        <div className="w-full px-6 md:px-24 py-8 md:py-16 text-left z-10 relative">
          <h1 className="text-display-ticket text-foreground mb-6">
            Return <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Policy</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        {/* Content */}
        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Eligibility for Refunds</h2>
          <p>
            Due to the nature of digital event ticketing, refunds are governed by the specific policies set by individual event organizers. However, Somavesh strictly regulates refunds under the following standard conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>The event is officially canceled or indefinitely postponed by the organizer.</li>
            <li>A technical error on the Somavesh platform resulted in duplicate charges or failure to deliver the digital ticket.</li>
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
            If you believe you are eligible for a refund due to event cancellation or technical failure, please contact <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a> within 3 days of the incident or event date. Include your full name, order number, and description of the issue.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Refund Processing</h2>
          <p>
            If a refund is approved, the funds will be reversed directly to the Original Payment Method used during checkout. Please allow 5 to 7 Business Days for the funds to clear back into your account, dependent on your banking institution's settlement timeline.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Return Policy, please contact us at:
            <br />
            <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>
            <br />
            Standard Response Time: Within 24 to 48 hours
          </p>
        </article>

      </div>
    </div>
  );
}
