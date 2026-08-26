import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Ayojok',
  description: 'Learn how Ayojok handles and protects your data.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 12, 2026";

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <header className="mb-12 border-b border-primary/10 pb-8">
          <h1 className="text-4xl font-extrabold text-foreground font-heading mb-4">Privacy Policy</h1>
          <p className="text-on-surface-variant font-sans">Last Updated: {lastUpdated}</p>
        </header>

        {/* Content */}
        <article className="prose prose-slate prose-lg max-w-none text-on-surface-variant font-sans">
          <p>
            At <strong>Ayojok</strong>, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal data when you visit our website, use our platform, or otherwise interact with our services.
          </p>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, register for an event, contact support, or subscribe to our newsletter. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Contact Information:</strong> Name, email address, phone number, and physical address.</li>
            <li><strong>Account Data:</strong> Passwords and preferences.</li>
            <li><strong>Payment Information:</strong> Processed securely by our payment partners; we do not store full credit card numbers.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide, maintain, and improve our platform and services.</li>
            <li>Process transactions and send related information (e.g., confirmations and receipts).</li>
            <li>Send technical notices, updates, security alerts, and support messages.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Communicate with you about products, services, offers, and events offered by Ayojok and others.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">3. Sharing of Information</h2>
          <p>
            We do not sell your personal data. We may share your information as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>With Event Organizers:</strong> When you register for an event, we share your details with the organizer so they can manage the event.</li>
            <li><strong>With Service Providers:</strong> We use third-party vendors (like payment processors and cloud hosting) who need access to your data to do work for us.</li>
            <li><strong>For Legal Reasons:</strong> We may share information to comply with laws or respond to lawful requests and legal process.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">4. Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>

          <h2 className="text-2xl font-bold text-[#0a2540] mt-10 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:privacy@rongplan.com" className="text-primary hover:underline">privacy@rongplan.com</a>
          </p>
        </article>

      </div>
    </div>
  );
}
