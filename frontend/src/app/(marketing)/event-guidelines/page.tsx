import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Event Guidelines | Somavesh',
  description: 'Guidelines for attending and participating in events on Somavesh.',
};

export default function EventGuidelinesPage() {
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
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Guidelines</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <p>
            Welcome to Somavesh! Our platform is dedicated to creating safe, engaging, and seamless event experiences for everyone. These Event Guidelines outline our expectations for attendees and participants to ensure a positive environment across all events hosted on our platform.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Respectful Behavior</h2>
          <p>
            We expect all attendees to treat organizers, speakers, staff, and fellow participants with respect. Harassment, discrimination, or abusive behavior in any form—whether verbal, physical, or digital—will not be tolerated. Event organizers reserve the right to remove individuals who violate these standards without a refund.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Ticketing and Registration</h2>
          <ul>
            <li><strong>Authenticity:</strong> Tickets must be purchased or acquired exclusively through the Somavesh platform. Scalped or unauthorized transferred tickets may be invalidated.</li>
            <li><strong>Identification:</strong> You may be required to present a valid photo ID matching the name on your registration upon entry.</li>
            <li><strong>Cancellations:</strong> If you can no longer attend a free event, please cancel your registration to free up space for others. For paid events, please refer to our <Link href="/return-policy" className="text-primary hover:underline">Return Policy</Link>.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. Health and Safety</h2>
          <p>
            Your safety is paramount. Attendees must comply with all health and safety guidelines communicated by the event organizer and the venue. Failure to adhere to safety protocols may result in denial of entry or removal from the event.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Digital Conduct</h2>
          <p>
            For virtual and hybrid events, attendees must maintain a professional digital presence. Do not share event links with unauthorized users, and refrain from spamming chat channels, disrupting presentations, or sharing inappropriate content.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Reporting Violations</h2>
          <p>
            If you witness or experience a violation of these guidelines, please report it immediately to the event organizer or the on-site staff. You can also escalate serious issues to the Somavesh Trust & Safety team at <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
