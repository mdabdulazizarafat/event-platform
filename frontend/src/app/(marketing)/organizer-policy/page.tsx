import React from 'react';

export const metadata = {
  title: 'Organizer Policy | Somavesh',
  description: 'Terms, obligations, and policies for event organizers on Somavesh.',
};

export default function OrganizerPolicyPage() {
  const lastUpdated = "September 10, 2026";

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
            Organizer <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Policy</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <p>
            This Organizer Policy is a binding agreement between event organizers and Somavesh. By creating and hosting an event on the Somavesh platform, you agree to comply with the rules and obligations outlined below.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Payouts and Fees</h2>
          <p>
            Somavesh charges a standard processing fee for all paid tickets sold through our platform. Organizers agree not to circumvent this fee structure by taking offline payments for digital tickets unless explicitly authorized. Payouts are generally processed within 5-7 business days after the successful conclusion of the event, provided there are no unresolved refund disputes.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Refunds and Chargebacks</h2>
          <p>
            Organizers must clearly state their own refund policy on the event page. However, in the event of an event cancellation, significant date/venue change, or a failure to deliver the promised services, Somavesh reserves the right to issue refunds to attendees on the organizer's behalf and deduct the refunded amount from the organizer's payout or invoice the organizer for the balance.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. Data Privacy and Attendee Information</h2>
          <p>
            As an organizer, you will have access to certain personal data of your attendees (e.g., names, emails). You agree to use this information solely for the purpose of managing the specific event they registered for. You may not sell, rent, or use attendee data for unsolicited marketing without obtaining explicit, separate consent from the attendee.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Intellectual Property</h2>
          <p>
            Organizers must have the necessary rights, licenses, and permissions for all content (images, logos, music, video) used on their event pages or presented during their events. Somavesh is not liable for intellectual property infringement committed by an organizer.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Taxes</h2>
          <p>
            Organizers are solely responsible for determining, collecting, and remitting any applicable sales tax, VAT, or other taxes related to the sale of their event tickets. Somavesh simply acts as a platform and payment facilitator.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">6. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Somavesh, its affiliates, and its employees from any claims, damages, liabilities, and expenses arising from your events, your attendees, or your breach of this policy.
          </p>
        </article>
      </div>
    </div>
  );
}
