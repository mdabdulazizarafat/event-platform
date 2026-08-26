import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Shield, Calendar, Users, Megaphone } from 'lucide-react';

export const metadata = {
  title: 'Organizer Guidelines | Ayojok',
  description: 'Best practices, rules, and guidelines for hosting events on Ayojok.',
};

export default function OrganizerGuidelinePage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header */}
      <section className="bg-foreground text-surface py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-6">
            Organizer Guidelines
          </h1>
          <p className="text-xl text-surface-dim font-sans">
            Everything you need to know to host successful, safe, and engaging events on the Ayojok platform.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-16">

        <div className="space-y-16">

          {/* Section 1 */}
          <div className="glass-card p-8 md:p-10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="text-primary" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-heading">Trust & Safety</h2>
            </div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6 font-sans">
              Creating a safe environment for your attendees is our top priority. As an organizer, you are responsible for ensuring your events comply with local laws and our community standards.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans">Accurately describe your event. Do not use misleading titles or descriptions.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans">Ensure the venue is safe, accessible, and properly licensed for the type of event you are hosting.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans">Clearly state refund policies and respond promptly to attendee inquiries.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="glass-card p-8 md:p-10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="text-secondary" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-heading">Event Setup Best Practices</h2>
            </div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6 font-sans">
              A well-crafted event page is the key to driving ticket sales and registrations. Follow these tips to optimize your event listing.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans"><strong>High-Quality Assets:</strong> Use professional, high-resolution images for your event banner.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans"><strong>Detailed Agenda:</strong> Provide a clear schedule of what attendees can expect, including speakers or performances.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans"><strong>Clear Ticket Types:</strong> Name your ticket tiers intuitively (e.g., Early Bird, General Admission, VIP) and clearly list what is included in each.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="glass-card p-8 md:p-10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Megaphone className="text-tertiary" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-heading">Marketing & Communication</h2>
            </div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6 font-sans">
              Engaging with your audience before, during, and after the event builds loyalty and anticipation.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans">Use the built-in email tools to send reminders 48 hours before the event starts.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans">Promote your unique event link across your social media channels.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant font-sans">Send a post-event survey to gather feedback for future improvements.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-surface-elevated p-10 rounded-3xl border border-primary/10 shadow-sm">
          <Users className="text-primary w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4 font-heading">Ready to put these into practice?</h2>
          <p className="text-on-surface-variant text-lg mb-8 max-w-xl mx-auto font-sans">
            Start drafting your next event and see how our platform makes these best practices a breeze to implement.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all"
          >
            Create an Event
          </Link>
        </div>

      </section>
    </div>
  );
}
