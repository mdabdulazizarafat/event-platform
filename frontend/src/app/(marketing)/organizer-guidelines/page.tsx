import React from 'react';

export const metadata = {
  title: 'Organizer Guidelines | Somavesh',
  description: 'Guidelines for hosting and managing events on Somavesh.',
};

export default function OrganizerGuidelinesPage() {
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
            Organizer <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Guidelines</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        <article className="prose prose-slate prose-xl max-w-none text-on-surface-variant font-sans">
          <p>
            Hosting an event on Somavesh is a great way to build your community and share your passion. We have established these Organizer Guidelines to ensure that all events on our platform meet a high standard of quality, safety, and transparency.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Accurate Event Listings</h2>
          <p>
            Organizers must provide clear, accurate, and truthful information about their events. This includes the date, time, location, speaker lineup, and a detailed description of what attendees can expect. Misleading event titles, hidden fees, or bait-and-switch tactics are strictly prohibited.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Communication</h2>
          <p>
            We encourage proactive and respectful communication with your attendees. Organizers are responsible for:
          </p>
          <ul>
            <li>Promptly answering attendee inquiries via email or the provided contact methods.</li>
            <li>Notifying attendees of any significant changes to the event schedule, venue, or lineup.</li>
            <li>Sending cancellation notices as early as possible if an event cannot proceed.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. Ensuring Safety</h2>
          <p>
            For physical events, organizers must secure a safe venue that complies with local fire, health, and safety regulations. You are expected to have an emergency plan in place and adequate staffing to manage crowd control and attendee well-being.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Inclusivity and Accessibility</h2>
          <p>
            Somavesh is committed to inclusivity. We strongly encourage organizers to choose venues with ADA compliance and to make reasonable accommodations for attendees with disabilities (e.g., providing closed captioning for virtual events, designated seating for physical events). 
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Account Integrity</h2>
          <p>
            Do not share your organizer account credentials. If you are working with a team, invite them to your event dashboard as managers or co-organizers rather than sharing a single login.
          </p>

          <p className="mt-8">
            Failure to adhere to these guidelines may result in the suspension of your organizer privileges. For legal responsibilities, please review our <a href="/organizer-policy" className="text-primary hover:underline">Organizer Policy</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
