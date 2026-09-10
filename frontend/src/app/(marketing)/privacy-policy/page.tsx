import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Somavesh',
  description: 'Learn how Somavesh handles and protects your data.',
};

export default function PrivacyPolicyPage() {
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
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Policy</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        {/* Content */}
        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Introduction & Purpose</h2>
          <p>
            <strong>Somavesh</strong> ("we," "our," or "us") is committed to protecting the privacy and personal information of its users, customers, and visitors. This Privacy Policy outlines how Somavesh collects, stores, processes, uses, and protects your personal data when you use our event ticketing platform, organizer dashboards, mobile applications, websites, and any associated services (collectively, the "Services").
          </p>
          <p>
            By registering an account, purchasing a ticket, or utilizing any Somavesh Services, you explicitly agree to the collection and processing of your information in accordance with this Privacy Policy. If you do not agree with these terms, please do not access or use our Services.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Data We Collect</h2>
          <p>
            To provide our event management platform, we collect several categories of information, which may include personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Identification & Account Data:</strong> Full name, email address, phone number, organization name, date of birth, gender, occupation, and account password credentials.</li>
            <li><strong>Profile Data (Publicly Shareable):</strong> Bio, profile photograph, social media links, and any other details you choose to display on your public organizer or participant profile.</li>
            <li><strong>Ticketing & Event Data:</strong> Data generated when you register for events, scan tickets, or participate in events. This includes timestamps, event preferences, and attendance status.</li>
            <li><strong>Usage & Technical Data:</strong> Internet Protocol (IP) address, browser type and version, device type, operating system, time zone settings, referral sources, and exact timestamps of interactions.</li>
            <li><strong>Transaction Data:</strong> Order history, billing address, and payment confirmation status. Note: All financial transactions are processed through secure, encrypted third-party payment gateways. Somavesh does not store raw credit card numbers or banking credentials on our servers.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. How We Use Your Data</h2>
          <p>
            We process your personal data under legitimate business interests, contractual obligations, or explicit consent for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>To set up, maintain, and customize your Somavesh account.</li>
            <li>To facilitate event registration, ticket generation, and access control.</li>
            <li>To provide analytical insights for organizers, including event views, ticket sales, and attendance data.</li>
            <li>To send essential administrative notifications, automated ticket confirmations, product updates, security alerts, and customer support communications.</li>
            <li>To detect, prevent, and mitigate fraudulent, unauthorized, or illegal activities.</li>
          </ul>

          <p><strong>Data Commercialization Policy</strong><br />
            Somavesh strictly enforces a policy that your personal data is never sold, rented, or leased to third parties for independent marketing or commercial purposes.</p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Data Storage & Security</h2>
          <p>
            Somavesh utilizes industry-standard secure cloud infrastructure to store your personal and profile data. We implement technical and organizational safety measures to shield your information from unauthorized access, loss, or alteration.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Data Sharing & Third Parties</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Third-Party Service Providers:</strong> We partner with trusted vendors to handle essential infrastructure operations, such as cloud hosting, analytics, and payment processing.</li>
            <li><strong>Event Organizers:</strong> When you register for an event, your registration data is shared with the respective event organizer for access and event management purposes.</li>
            <li><strong>Legal Compliance:</strong> We may disclose your information if required to do so by applicable law, court order, or formal request from law enforcement or regulatory authorities in Bangladesh or other operating jurisdictions.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">6. User Rights & Data Control</h2>
          <p>
            As an Somavesh user, you hold the right to Access, Correction, Deletion, and Visibility Control of your data. To execute any of these rights, please contact us at <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">7. Cookies & Tracking Technologies</h2>
          <p>
            Somavesh uses cookies to monitor platform traffic, remember preferences, and keep you securely logged in.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">8. Data Retention</h2>
          <p>
            Your data is kept active on our servers for as long as your account remains open. Transaction invoices and purchase records will be retained longer as necessary to meet statutory legal, tax, and accounting compliance obligations.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>
          </p>
        </article>

      </div>
    </div>
  );
}
