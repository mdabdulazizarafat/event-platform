import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Events Policy | Somavesh',
  description: 'Rules for what types of events are permitted on the Somavesh platform.',
};

export default function EventsPolicyPage() {
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
            Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Policy</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <p>
            Somavesh provides a platform for creators, businesses, and communities to gather. To maintain a safe and trusted environment, all events created on our platform must comply with this Events Policy.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Prohibited Events</h2>
          <p>
            You may not use Somavesh to host, promote, or sell tickets to the following types of events:
          </p>
          <ul>
            <li><strong>Illegal Activities:</strong> Events that promote, encourage, or facilitate illegal acts, including the sale of illegal substances or unregulated goods.</li>
            <li><strong>Hate and Violence:</strong> Events organized by hate groups, or events that promote violence, terrorism, or discrimination against protected classes (based on race, ethnicity, religion, sexual orientation, gender identity, or disability).</li>
            <li><strong>Explicit Content:</strong> Events centered around non-consensual sexual content, illegal pornography, or the exploitation of minors.</li>
            <li><strong>Scams and Fraud:</strong> Pyramid schemes, multi-level marketing (MLM) recruitment events, or misleading financial investment seminars designed to defraud attendees.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Age-Restricted Events</h2>
          <p>
            If your event involves activities restricted by age (e.g., alcohol consumption, mature themes), you must clearly state the age requirements in your event description. It is the organizer's responsibility to verify age at the door or during the registration process.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. High-Risk Events</h2>
          <p>
            Certain events, such as large-scale festivals, political rallies, or extreme sports, may be subject to additional review by the Somavesh Trust & Safety team. We reserve the right to request proof of insurance, necessary permits, or security plans before allowing ticket sales to proceed.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Platform Review and Removal</h2>
          <p>
            Somavesh relies on a combination of automated systems and community reports to identify violations of this policy. We reserve the right to unpublish, suspend, or permanently remove any event that violates these rules, without prior notice. 
          </p>
          <p>
            Organizers found in violation may also have their payouts withheld and their accounts permanently banned.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Reporting a Violation</h2>
          <p>
            If you come across an event that you believe violates this policy, please report it immediately by contacting our support team at <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
