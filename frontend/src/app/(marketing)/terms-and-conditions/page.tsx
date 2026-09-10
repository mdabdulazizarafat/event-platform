import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Somavesh',
  description: 'Terms and conditions for using Somavesh services.',
};

export default function TermsAndConditionsPage() {
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
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Conditions</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        {/* Content */}
        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Overview & Acceptance of Terms</h2>
          <p>
            Welcome to <strong>Somavesh</strong>. These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User," "Customer," or "you") and Somavesh ("Company," "we," "our," or "us"). These Terms govern your access to and use of our website, event management software, and all related technical services.
          </p>
          <p>
            By purchasing tickets, registering an account, or interacting with our platform, you acknowledge that you have read, understood, and agree to be legally bound by these Terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Products & Services Provided</h2>
          <p>
            Somavesh specializes in comprehensive event management and ticketing solutions. Our platform includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Digital event discovery and ticket purchasing.</li>
            <li>Cloud-managed organizer dashboards for managing events and attendees.</li>
            <li>Secure QR-code ticket generation and scanning software.</li>
          </ul>
          <p>
            We reserve the right to modify, upgrade, suspend, or discontinue any aspect of our software features at our discretion, without prior notice.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. User Responsibilities & Conduct</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Accuracy of Information:</strong> You agree to provide true, accurate, and complete information during registration.</li>
            <li><strong>Lawful Usage:</strong> You agree not to use Somavesh for any unlawful, deceptive, fraudulent, or harmful purposes, including creating fake events.</li>
            <li><strong>Content Restrictions:</strong> Organizers are solely liable for the content of their events. You strictly agree not to organize material that is offensive, defamatory, obscene, or violating any laws.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Orders, Payments, & Ticketing</h2>
          <p>
            Prices for event tickets are specified on our platform by the respective organizers. Payment must be cleared in full through our authorized payment processing gateways before a ticket is issued. Somavesh acts as an intermediary ticketing platform; specific refund policies for events are determined by the event organizers.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Somavesh shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our platform, cancellation of events by organizers, or any disputes between attendees and organizers.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">6. Intellectual Property Rights</h2>
          <p>
            All branding elements, source code, and user interface designs created by Somavesh are the exclusive intellectual property of Somavesh. Users retain full ownership of the text and images they personally upload to their event profiles.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">7. Governing Law & Jurisdiction</h2>
          <p>
            These Terms & Conditions shall be governed by, construed, and enforced in accordance with the laws of the People's Republic of Bangladesh. Disputes shall be brought exclusively before the courts of law located in Dhaka, Bangladesh.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>
          </p>
        </article>

      </div>
    </div>
  );
}
