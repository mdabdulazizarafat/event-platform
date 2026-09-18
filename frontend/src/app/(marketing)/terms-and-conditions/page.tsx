import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Somavesh',
  description: 'Terms and conditions for using Somavesh services.',
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "18 September 2026";

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
          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. About These Terms</h2>
          <p className="mb-4">
            These Terms apply to your use of the Somavesh platform and related services.
          </p>
          <p className="mb-4">
            Somavesh provides technology and infrastructure that can help organizers create and manage events and help participants discover, register for, and attend events.
          </p>
          <p className="mb-4">
            Depending on how you use Somavesh, you may be an organizer, co-organizer, participant, team member, or another type of user.
          </p>
          <p className="mb-4">
            Additional policies and terms may apply to particular uses of Somavesh, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Somavesh Privacy Policy</strong></li>
            <li><strong>Organizer Policy</strong></li>
            <li><strong>Events Policy</strong></li>
            <li><strong>Organizer Guidelines</strong></li>
            <li><strong>Events Guidelines</strong></li>
            <li><strong>Ticket conditions & refund policies</strong></li>
          </ul>
          <p className="mb-4">
            These documents should be read together where they apply to your use of Somavesh.
          </p>
          <p className="mb-4">
            If there is a conflict between these Terms and a specific event's terms concerning an event-specific matter, the applicable event-specific terms may govern that matter to the extent permitted by applicable law.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Definitions</h2>
          <p className="mb-4">
            For purposes of these Terms:
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Somavesh"</h3>
          <p className="mb-4">
            "Somavesh" means the Somavesh event discovery, registration, and event management service operated by Rong Plan, together with its associated websites, applications, systems, tools, and services.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Platform"</h3>
          <p className="mb-4">
            "Platform" means the websites, applications, dashboards, systems, interfaces, tools, infrastructure, and functionality made available by Somavesh.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"User"</h3>
          <p className="mb-4">
            "User" means any person or entity that accesses or uses Somavesh.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Participant"</h3>
          <p className="mb-4">
            "Participant" means a person who discovers, registers for, purchases a ticket to, or attends an Event.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Organizer"</h3>
          <p className="mb-4">
            "Organizer" means a person, company, organization, institution, club, community, or other entity that creates, publishes, manages, promotes, or operates an Event through Somavesh.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Event"</h3>
          <p className="mb-4">
            "Event" means a conference, workshop, competition, program, gathering, meeting, festival, seminar, training, performance, or other activity published or managed through Somavesh.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Registration"</h3>
          <p className="mb-4">
            "Registration" means the process through which a User submits information to participate in an Event.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Event co-organizer"</h3>
          <p className="mb-4">
            "Event co-organizer" means an individual authorized by an Organizer to assist with event operations.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Content"</h3>
          <p className="mb-4">
            "Content" means text, images, photographs, videos, logos, graphics, documents, event information, descriptions, schedules, comments, and other materials submitted, uploaded, displayed, or otherwise made available through Somavesh.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Services"</h3>
          <p className="mb-4">
            "Services" means the features, functionality, technology, infrastructure, and other services provided by Somavesh.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">"Third-Party Service"</h3>
          <p className="mb-4">
            "Third-Party Service" means a service, website, application, payment provider, infrastructure provider, communication service, or other service operated by an entity other than Somavesh.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. Acceptance of Terms</h2>
          <p className="mb-4">
            By using Somavesh, you confirm that:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>You have read and understood these Terms;</li>
            <li>You agree to comply with these Terms;</li>
            <li>You will comply with applicable laws and regulations;</li>
            <li>You will comply with applicable event-specific requirements and Somavesh policies.</li>
          </ul>
          <p className="mb-4">
            Where legally permitted, your use of Somavesh constitutes acceptance of these Terms.
          </p>
          <p className="mb-4">
            If you are using Somavesh on behalf of an organization or other legal entity, you represent that you have the authority to accept these Terms on its behalf.
          </p>
          <p className="mb-4">
            Certain Services may be subject to additional terms. Where additional terms apply, you must comply with those terms as well.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. Eligibility and Age Requirements</h2>
          <p className="mb-4">
            You may use Somavesh only if you are legally capable of entering into the applicable agreement or otherwise have the required authorization under applicable law.
          </p>
          <p className="mb-4">
            Where a User is below the legally applicable age of contractual capacity, appropriate involvement or authorization from a parent or legal guardian may be required.
          </p>
          <p className="mb-4">
            Some Events may have their own age restrictions or eligibility requirements. Those requirements are determined by the relevant Organizer unless otherwise stated by Somavesh.
          </p>
          <p className="mb-4">
            Organizers are responsible for clearly communicating any Event-specific age or eligibility requirements applicable to their Events.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Account Registration</h2>
          <p className="mb-4">
            Some Somavesh Services may require you to create an account.
          </p>
          <p className="mb-4">
            When creating or maintaining an account, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide accurate and reasonably current information;</li>
            <li>Keep your account information updated;</li>
            <li>Protect your login credentials;</li>
            <li>Take reasonable steps to prevent unauthorized access;</li>
            <li>Notify Somavesh where you reasonably believe your account has been compromised;</li>
            <li>Use your account only for legitimate purposes.</li>
          </ul>
          <p className="mb-4">
            You must not:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Impersonate another person or organization;</li>
            <li>Create an account using false or misleading information;</li>
            <li>Access another person's account without authorization;</li>
            <li>Create accounts for fraudulent or abusive purposes;</li>
            <li>Misrepresent your affiliation with an organization or Event.</li>
          </ul>
          <p className="mb-4">
            You are responsible for activity conducted through your account to the extent permitted by applicable law, including where you have failed to take reasonable steps to protect your credentials.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">6. Using Somavesh</h2>
          <p className="mb-4">
            Somavesh is intended to support legitimate event discovery, registration, participation, and event management.
          </p>
          <p className="mb-4">
            Depending on the Services available to you, Somavesh may allow you to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Discover Events;</li>
            <li>View Event information;</li>
            <li>Register for Events;</li>
            <li>Receive digital Tickets;</li>
            <li>Access QR-based Ticket functionality;</li>
            <li>Manage event participation;</li>
            <li>Create and publish Events;</li>
            <li>Configure registration forms;</li>
            <li>Manage Participants;</li>
            <li>Manage Event co-organizer;</li>
            <li>Manage schedules and Event operations;</li>
            <li>Communicate with Participants;</li>
            <li>Use check-in tools;</li>
            <li>Access supported event data and analytics.</li>
          </ul>
          <p className="mb-4">
            You must use Somavesh only for lawful and legitimate purposes.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">7. Event Listings</h2>
          <p className="mb-4">
            Organizers may create and publish Event listings through Somavesh.
          </p>
          <p className="mb-4">
            An Event listing may contain information including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Event name;</li>
            <li>Event description;</li>
            <li>Date and time;</li>
            <li>Venue or online access information;</li>
            <li>Speakers or presenters;</li>
            <li>Event schedule;</li>
            <li>Ticket types;</li>
            <li>Ticket prices;</li>
            <li>Capacity;</li>
            <li>Registration requirements;</li>
            <li>Organizer information;</li>
            <li>Other Event-related information.</li>
          </ul>
          <p className="mb-4">
            Organizers are responsible for ensuring that the information they publish is accurate, lawful, complete enough for its intended purpose, and not misleading.
          </p>
          <p className="mb-4">
            Somavesh does not represent that every Event listing, Organizer, speaker, venue, or item of Event information has been independently verified by Somavesh.
          </p>
          <p className="mb-4">
            Somavesh may, where permitted by applicable law and its policies, review, moderate, restrict, edit, suspend, or remove Event listings or related Content.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">8. Somavesh's Role in Events</h2>
          <p className="mb-4">
            Somavesh generally provides the technology and infrastructure that enables Organizers and Participants to interact.
          </p>
          <p className="mb-4">
            Unless Somavesh is specifically identified as an Organizer or is otherwise expressly acting in another capacity, Somavesh is not automatically:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>The Organizer of an Event;</li>
            <li>The host or producer of an Event;</li>
            <li>The owner or operator of the Event venue;</li>
            <li>The employer of an Event co-organizer;</li>
            <li>The speaker, performer, trainer, or presenter at an Event;</li>
            <li>The party responsible for determining an Event's schedule;</li>
            <li>The party responsible for delivering an Organizer's promised Event experience.</li>
          </ul>
          <p className="mb-4">
            Organizers remain responsible for the Events they create and operate, including their Event information, operations, applicable legal obligations, venue arrangements, communications, Participants, co-organizer, and Event delivery.
          </p>
          <p className="mb-4">
            At the same time, nothing in these Terms is intended to exclude responsibilities that Somavesh may have under applicable law or in circumstances where Somavesh is expressly acting in a particular capacity.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">9. Event Registration</h2>
          <p className="mb-4">
            Registration requirements may vary from Event to Event.
          </p>
          <p className="mb-4">
            An Organizer may require Participants to provide information such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Name;</li>
            <li>Contact information;</li>
            <li>Institution or organization;</li>
            <li>Identification or eligibility information;</li>
            <li>Preferences;</li>
            <li>Responses to registration questions;</li>
            <li>Other information reasonably required for the Event.</li>
          </ul>
          <p className="mb-4">
            Participants are responsible for providing accurate information.
          </p>
          <p className="mb-4">
            A registration may be subject to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Event capacity;</li>
            <li>Organizer approval;</li>
            <li>Eligibility requirements;</li>
            <li>Payment;</li>
            <li>Completion of required registration information;</li>
            <li>Other Event-specific requirements.</li>
          </ul>
          <p className="mb-4">
            Registration does not automatically guarantee admission unless the applicable Event terms indicate otherwise.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">10. Ticketing</h2>
          <p className="mb-4">
            Where an Event uses Ticketing functionality, the applicable Ticket terms may vary according to the Organizer and Event.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.1 Ticket Issuance</h3>
          <p className="mb-4">
            A Ticket may be issued following successful registration or payment, depending on the Event.
          </p>
          <p className="mb-4">
            A Ticket may be delivered digitally through Somavesh or through another supported communication method.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.2 Ticket Validity</h3>
          <p className="mb-4">
            A Ticket is valid only according to the conditions applicable to the relevant Event.
          </p>
          <p className="mb-4">
            An Organizer may impose reasonable conditions concerning:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Entry;</li>
            <li>Identity verification;</li>
            <li>Eligibility;</li>
            <li>Ticket type;</li>
            <li>Event capacity;</li>
            <li>Entry times;</li>
            <li>Age requirements;</li>
            <li>Transferability;</li>
            <li>Refunds;</li>
            <li>Other Event requirements.</li>
          </ul>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.3 Digital Tickets</h3>
          <p className="mb-4">
            Where digital Tickets are provided, Participants are responsible for retaining access to their Ticket and presenting it as required.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.4 QR Tickets</h3>
          <p className="mb-4">
            Where QR functionality is used, a QR code may be used to verify a Ticket or registration at an Event.
          </p>
          <p className="mb-4">
            Participants must not attempt to forge, duplicate, manipulate, misuse, or fraudulently reproduce Tickets or QR codes.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.5 Ticket Ownership and Use</h3>
          <p className="mb-4">
            Unless otherwise stated by the Organizer, a Ticket is associated with the registration information provided for the relevant Participant.
          </p>
          <p className="mb-4">
            Participants must comply with any Event-specific requirements regarding identity verification and Ticket use.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.6 Duplicate or Lost Tickets</h3>
          <p className="mb-4">
            Where a Ticket is lost, inaccessible, duplicated, or otherwise unavailable, Somavesh or the Organizer may provide assistance where operationally possible.
          </p>
          <p className="mb-4">
            Any replacement, reissuance, cancellation, or verification will be subject to the applicable Event and Platform rules.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.7 Ticket Transferability</h3>
          <p className="mb-4">
            Tickets are not automatically transferable unless transfer is expressly permitted by the relevant Event or Somavesh functionality.
          </p>
          <p className="mb-4">
            Where transfer is permitted, the Participant must follow the applicable transfer process.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">10.8 Event-Specific Ticket Rules</h3>
          <p className="mb-4">
            Ticket prices, refund rules, transfer rules, entry conditions, and other Ticket conditions may differ between Events.
          </p>
          <p className="mb-4">
            Participants should review the applicable Event information before completing a registration or purchase.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">11. QR Tickets and Check-In</h2>
          <p className="mb-4">
            Somavesh may provide QR-based Ticket and check-in functionality.
          </p>
          <p className="mb-4">
            QR codes may be scanned or otherwise processed by authorized Event co-organizer for purposes including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Verifying registration;</li>
            <li>Confirming Ticket validity;</li>
            <li>Recording attendance;</li>
            <li>Managing Event entry;</li>
            <li>Preventing duplicate or unauthorized entry.</li>
          </ul>
          <p className="mb-4">
            Check-in information may be recorded in connection with the relevant Event.
          </p>
          <p className="mb-4">
            Participants must not interfere with the check-in process or attempt to bypass Ticket verification.
          </p>
          <p className="mb-4">
            Organizers are responsible for using check-in functionality only for legitimate Event operations and within the permissions granted to them.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">12. Payments</h2>
          <p className="mb-4">
            Some Somavesh Events may require payment.
          </p>
          <p className="mb-4">
            Payment functionality may be supported through Somavesh and/or Third-Party Services.
          </p>
          <p className="mb-4">
            Depending on the implementation of a particular transaction, payment processing may involve third-party providers.
          </p>
          <p className="mb-4">
            Potential payment methods may include supported services such as mobile financial services, cards, or other payment methods made available through Somavesh.
          </p>
          <p className="mb-4">
            Examples may include <strong>bKash, Nagad, Upay, Visa, Mastercard</strong>, or other supported payment methods. Availability may vary.
          </p>
          <p className="mb-4">
            Somavesh does not necessarily directly process or store every payment credential used in connection with a transaction.
          </p>
          <p className="mb-4">
            You agree to provide accurate payment information and use payment methods that you are authorized to use.
          </p>
          <p className="mb-4">
            A payment may fail or remain incomplete for reasons including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Insufficient funds;</li>
            <li>Incorrect payment information;</li>
            <li>Payment provider restrictions;</li>
            <li>Technical problems;</li>
            <li>Fraud or security controls;</li>
            <li>Network or service interruptions;</li>
            <li>Other reasons determined by the relevant payment provider.</li>
          </ul>
          <p className="mb-4">
            Where a payment fails, access to a paid Event or Ticket may not be completed unless the transaction is completed through an accepted payment method.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">13. Ticket Prices and Fees</h2>
          <p className="mb-4">
            Ticket prices are generally determined by the relevant Organizer.
          </p>
          <p className="mb-4">
            Additional fees may apply where disclosed during the transaction.
          </p>
          <p className="mb-4">
            Depending on the applicable transaction and law, the amount payable may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Ticket price;</li>
            <li>Payment processing fees;</li>
            <li>Taxes or other applicable charges.</li>
          </ul>
          <p className="mb-4">
            Any applicable Somavesh fees should be disclosed where required and reasonably possible before completion of the relevant transaction.
          </p>
          <p className="mb-4">
            Somavesh does not establish the Ticket price of every Event.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">14. Refunds</h2>
          <p className="mb-4">
            Refund eligibility may vary according to the Event and applicable circumstances.
          </p>
          <p className="mb-4">
            A refund may be affected by:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>The Event-specific refund policy;</li>
            <li>Organizer policies;</li>
            <li>Cancellation or postponement of an Event;</li>
            <li>Applicable law;</li>
            <li>Payment provider rules;</li>
            <li>The nature of the transaction;</li>
            <li>Duplicate or erroneous payments;</li>
            <li>Fraud or unauthorized transactions;</li>
            <li>Other circumstances affecting the transaction.</li>
          </ul>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">14.1 Participant-Requested Cancellation</h3>
          <p className="mb-4">
            A Participant-requested cancellation does not automatically create a right to a refund.
          </p>
          <p className="mb-4">
            Whether a refund is available will generally depend on the applicable Event refund terms and applicable law.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">14.2 Organizer Cancellation</h3>
          <p className="mb-4">
            Where an Organizer cancels an Event, refund arrangements may be governed by the applicable Event terms, Organizer obligations, payment arrangements, and applicable law.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">14.3 Postponement or Event Changes</h3>
          <p className="mb-4">
            A postponed or materially changed Event does not automatically create the same outcome in every case. Refund eligibility may depend on the circumstances and applicable Event terms.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">14.4 Duplicate or Erroneous Payments</h3>
          <p className="mb-4">
            Where a duplicate payment or payment error occurs, the matter may be reviewed by Somavesh, the Organizer, and/or the relevant payment provider.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">14.5 Fraudulent or Unauthorized Transactions</h3>
          <p className="mb-4">
            Transactions suspected to be fraudulent or unauthorized may be investigated and may be subject to cancellation, reversal, restriction, or other appropriate action.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">15. Event Cancellation, Postponement, and Changes</h2>
          <p className="mb-4">
            Organizers may need to cancel, postpone, reschedule, relocate, or materially change an Event.
          </p>
          <p className="mb-4">
            Changes may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Event date;</li>
            <li>Event time;</li>
            <li>Venue;</li>
            <li>Speakers;</li>
            <li>Schedule;</li>
            <li>Capacity;</li>
            <li>Ticket conditions;</li>
            <li>Event format.</li>
          </ul>
          <p className="mb-4">
            Where Somavesh has the relevant contact information and functionality, Somavesh may assist with communicating material Event changes to affected Participants.
          </p>
          <p className="mb-4">
            However, the Organizer remains primarily responsible for communicating Event changes and managing the operational consequences of those changes.
          </p>
          <p className="mb-4">
            Participants should review communications from the Organizer and Somavesh regarding any Event they have registered for.
          </p>
          <p className="mb-4">
            Refunds or other remedies resulting from cancellation, postponement, or material Event changes will depend on the applicable Event terms, Organizer obligations, applicable law, and circumstances of the transaction.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">16. Participant Responsibilities</h2>
          <p className="mb-4">
            Participants agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide accurate registration information;</li>
            <li>Use valid Tickets;</li>
            <li>Follow Event rules;</li>
            <li>Follow venue rules;</li>
            <li>Follow reasonable instructions from authorized co-organizer;</li>
            <li>Respect other Participants, Organizers, speakers, co-organizers, and venue personnel;</li>
            <li>Comply with applicable law;</li>
            <li>Use QR Tickets and check-in functionality honestly;</li>
            <li>Avoid interfering with Event operations;</li>
            <li>Avoid fraudulent registration or Ticket activity.</li>
          </ul>
          <p className="mb-4">
            Participants are responsible for determining whether an Event is suitable for them based on the information provided by the Organizer.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">17. Organizer Responsibilities</h2>
          <p className="mb-4">
            Organizers are responsible for the Events they create and manage through Somavesh.
          </p>
          <p className="mb-4">
            Organizers must comply with the <strong>Organizer Policy</strong> and applicable <strong>Organizer Guidelines</strong>.
          </p>
          <p className="mb-4">
            Depending on the Event and applicable law, Organizer responsibilities may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Providing accurate Event information;</li>
            <li>Operating Events lawfully;</li>
            <li>Providing appropriate venue arrangements;</li>
            <li>Managing Event schedules;</li>
            <li>Managing speakers and presenters;</li>
            <li>Communicating with Participants;</li>
            <li>Managing co-organizer;</li>
            <li>Establishing applicable Ticket conditions;</li>
            <li>Handling Event cancellation or postponement;</li>
            <li>Complying with applicable refund obligations;</li>
            <li>Managing Event safety and operations;</li>
            <li>Using Participant information appropriately;</li>
            <li>Ensuring that registration questions and collected information are appropriate and lawful;</li>
            <li>Managing Event check-in;</li>
            <li>Delivering the Event substantially as represented.</li>
          </ul>
          <p className="mb-4">
            Organizers should not publish Events that they are not authorized or prepared to conduct.
          </p>
          <p className="mb-4">
            Organizers are also responsible for ensuring that their Event Content does not infringe the rights of others or violate applicable law.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">18. Organizer Permissions</h2>
          <p className="mb-4">
            Somavesh may support different Organizer roles, including roles such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Co-organizer;</li>
            <li>Manager / Scanner;</li>
          </ul>
          <p className="mb-4">
            Organizers are responsible for granting permissions appropriately.
          </p>
          <p className="mb-4">
            Organizers should only grant access to people who need it for legitimate Event operations.
          </p>
          <p className="mb-4">
            Co-organizer must:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Use their access only for authorized purposes;</li>
            <li>Protect information accessible through their role;</li>
            <li>Not misuse Participant information;</li>
            <li>Not share access credentials improperly;</li>
            <li>Not use Organizer tools for unrelated purposes.</li>
          </ul>
          <p className="mb-4">
            Organizers remain responsible for the actions of individuals to whom they grant Organizer or co-organizer permissions, subject to applicable law.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">19. Prohibited Activities</h2>
          <p className="mb-4">
            Users must not use Somavesh to:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-6">
            <li>Commit or facilitate fraud;</li>
            <li>Impersonate another person, organization, or institution;</li>
            <li>Create fake or misleading Events;</li>
            <li>Create fraudulent registrations;</li>
            <li>Manipulate or forge Tickets;</li>
            <li>Manipulate or misuse QR codes;</li>
            <li>Obtain unauthorized access to accounts or systems;</li>
            <li>Attempt to circumvent Platform security;</li>
            <li>Introduce malware, malicious code, or harmful software;</li>
            <li>Conduct automated abuse or excessive scraping;</li>
            <li>Interfere with Platform operations;</li>
            <li>Harass, threaten, or abuse other Users;</li>
            <li>Publish materially misleading Event information;</li>
            <li>Operate unlawful schemes;</li>
            <li>Misuse personal information;</li>
            <li>Infringe intellectual property or other legal rights;</li>
            <li>Send unauthorized spam or abusive communications;</li>
            <li>Attempt to disrupt Event check-in or Event operations;</li>
            <li>Circumvent access controls or restrictions;</li>
            <li>Use Somavesh for any unlawful or fraudulent purpose.</li>
          </ol>
          <p className="mb-4">
            Somavesh may take reasonable action in response to prohibited activity, including restricting accounts, Events, Tickets, or functionality.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">20. User Content</h2>
          <p className="mb-4">
            Users and Organizers may submit or publish Content through Somavesh.
          </p>
          <p className="mb-4">
            Content may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Event descriptions;</li>
            <li>Images;</li>
            <li>Logos;</li>
            <li>Videos;</li>
            <li>Speaker information;</li>
            <li>Documents;</li>
            <li>Schedules;</li>
            <li>Registration information;</li>
            <li>Other Event-related materials.</li>
          </ul>
          <p className="mb-4">
            You remain responsible for Content that you submit.
          </p>
          <p className="mb-4">
            By submitting Content, you represent that you have the necessary rights, permissions, licenses, or authority to submit and use that Content through Somavesh.
          </p>
          <p className="mb-4">
            You must not submit Content that:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Infringes another person's rights;</li>
            <li>Is unlawfully obtained;</li>
            <li>Is materially misleading;</li>
            <li>Violates applicable law;</li>
            <li>Violates applicable Somavesh policies;</li>
            <li>Contains malicious code;</li>
            <li>Improperly exposes another person's confidential or personal information.</li>
          </ul>
          <p className="mb-4">
            You retain ownership of your Content unless otherwise agreed.
          </p>
          <p className="mb-4">
            By submitting Content to Somavesh, you grant Somavesh a non-exclusive, worldwide, royalty-free license, for the duration reasonably necessary to provide and operate the Services, to host, store, reproduce, display, transmit, format, adapt, and technically process that Content as necessary to provide the Services and make the Content available through the functionality you choose to use.
          </p>
          <p className="mb-4">
            This license does not transfer ownership of your Content to Somavesh.
          </p>
          <p className="mb-4">
            Somavesh may remove or restrict Content where reasonably necessary to comply with law, enforce its policies, protect Users, protect the Platform, or address legitimate complaints.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">21. Intellectual Property</h2>
          <p className="mb-4">
            Somavesh and its licensors may own or control rights in the Platform and its associated materials, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Somavesh name;</li>
            <li>Somavesh logo;</li>
            <li>Brand assets;</li>
            <li>Website;</li>
            <li>Software;</li>
            <li>Interfaces;</li>
            <li>Platform design;</li>
            <li>Documentation;</li>
            <li>Platform-generated materials;</li>
            <li>Other proprietary materials.</li>
          </ul>
          <p className="mb-4">
            Except as expressly permitted by Somavesh or applicable law, you may not copy, reproduce, modify, distribute, sell, lease, reverse engineer, publicly display, or otherwise exploit Somavesh's proprietary materials beyond your permitted use of the Services.
          </p>
          <p className="mb-4">
            Using Somavesh does not transfer ownership of Somavesh's intellectual property to you.
          </p>
          <p className="mb-4">
            Organizer and User Content remains subject to Section 20.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">22. Copyright and Intellectual Property Complaints</h2>
          <p className="mb-4">
            Users must not upload or publish Content unless they have the necessary rights or permissions to do so.
          </p>
          <p className="mb-4">
            If you believe Content available through Somavesh infringes your copyright or another intellectual property right, you may contact Somavesh using the contact information below.
          </p>
          <p className="mb-4">
            Where appropriate, Somavesh may review reported Content and take action consistent with applicable law and its policies.
          </p>
          <p className="mb-4">
            Somavesh does not represent that every intellectual property complaint will result in removal of the reported Content.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">23. Privacy</h2>
          <p className="mb-4">
            Your use of Somavesh involves the processing of information as described in the <strong>Somavesh Privacy Policy</strong>.
          </p>
          <p className="mb-4">
            The Privacy Policy explains how Somavesh may collect, use, store, disclose, and otherwise process personal information.
          </p>
          <p className="mb-4">
            Organizers may also collect information directly from Participants through Organizer-controlled registration forms or Event operations.
          </p>
          <p className="mb-4">
            Organizers are responsible for using Participant information in accordance with applicable law, the applicable Somavesh policies, and the representations they make to Participants.
          </p>
          <p className="mb-4">
            The Privacy Policy should be reviewed together with these Terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">24. Third-Party Services</h2>
          <p className="mb-4">
            Somavesh may rely on or integrate with Third-Party Services.
          </p>
          <p className="mb-4">
            These may include services relating to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Payment processing;</li>
            <li>Cloud infrastructure;</li>
            <li>Email;</li>
            <li>SMS;</li>
            <li>Authentication;</li>
            <li>Analytics;</li>
            <li>Communications;</li>
            <li>Other technology infrastructure.</li>
          </ul>
          <p className="mb-4">
            Third-Party Services may be subject to their own terms and privacy policies.
          </p>
          <p className="mb-4">
            Where a transaction or function depends on a Third-Party Service, the availability and operation of that service may be outside Somavesh's direct control.
          </p>
          <p className="mb-4">
            Somavesh remains responsible for the aspects of its own Services that are subject to applicable law and these Terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">25. Platform Availability</h2>
          <p className="mb-4">
            Somavesh aims to provide reliable Services but does not guarantee that the Platform will always be available, uninterrupted, error-free, or free from delays.
          </p>
          <p className="mb-4">
            Services may occasionally be unavailable or limited because of:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Scheduled maintenance;</li>
            <li>Updates;</li>
            <li>Infrastructure problems;</li>
            <li>Security incidents;</li>
            <li>Internet or network problems;</li>
            <li>Third-Party Service outages;</li>
            <li>Technical failures;</li>
            <li>Events outside Somavesh's reasonable control.</li>
          </ul>
          <p className="mb-4">
            Where reasonably practical, Somavesh may take steps to restore affected Services.
          </p>
          <p className="mb-4">
            Nothing in this section limits obligations that cannot lawfully be excluded.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">26. Security</h2>
          <p className="mb-4">
            Users must not attempt to compromise or circumvent the security of Somavesh.
          </p>
          <p className="mb-4">
            Prohibited conduct includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Unauthorized access;</li>
            <li>Security testing without authorization;</li>
            <li>Circumventing authentication;</li>
            <li>Attempting to access restricted information;</li>
            <li>Introducing malicious software;</li>
            <li>Attacking or disrupting Platform infrastructure;</li>
            <li>Exploiting vulnerabilities for unauthorized purposes;</li>
            <li>Interfering with security controls.</li>
          </ul>
          <p className="mb-4">
            Somavesh may take reasonable technical or administrative measures to protect the Platform, Users, Events, and information processed through the Services.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">27. Suspension and Termination</h2>
          <p className="mb-4">
            Somavesh may, where reasonably necessary and subject to applicable law:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Restrict or suspend an account;</li>
            <li>Restrict Platform functionality;</li>
            <li>Suspend or remove an Event;</li>
            <li>Restrict Ticket functionality;</li>
            <li>Suspend Organizer capabilities;</li>
            <li>Remove Content;</li>
            <li>Terminate an account.</li>
          </ul>
          <p className="mb-4">
            Possible reasons may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Violation of these Terms;</li>
            <li>Violation of applicable policies;</li>
            <li>Fraud;</li>
            <li>Security concerns;</li>
            <li>Illegal activity;</li>
            <li>Abuse;</li>
            <li>Material misrepresentation;</li>
            <li>Payment-related concerns;</li>
            <li>Risk to Participants;</li>
            <li>Risk to Somavesh or its infrastructure;</li>
            <li>Other legitimate operational or legal reasons.</li>
          </ul>
          <p className="mb-4">
            Where appropriate, Somavesh may provide notice or an opportunity to address an issue before taking action, although immediate action may be appropriate where necessary to protect Users, the Platform, or comply with law.
          </p>
          <p className="mb-4">
            Where an account, Event, or Organizer is suspended or terminated, the effect on existing registrations, Tickets, payments, and Event data may depend on the circumstances.
          </p>
          <p className="mb-4">
            Suspension or termination does not automatically create a right to a refund.
          </p>
          <p className="mb-4">
            Nothing in this section limits rights that cannot lawfully be excluded.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">28. Appeals and Support</h2>
          <p className="mb-4">
            Users may contact Somavesh regarding issues such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Account restrictions;</li>
            <li>Event restrictions;</li>
            <li>Ticket problems;</li>
            <li>Payment issues;</li>
            <li>Registration problems;</li>
            <li>Privacy concerns;</li>
            <li>Other Platform-related issues.</li>
          </ul>
          <p className="mb-4">
            Support contact:
          </p>
          <p className="mb-4">
            <strong><a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a></strong>
          </p>
          <p className="mb-4">
            Where Somavesh provides a specific appeal or review process, users should follow that process.
          </p>
          <p className="mb-4">
            A support request does not automatically suspend the effect of an account or Event restriction.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">29. Disclaimers</h2>
          <p className="mb-4">
            Somavesh provides a platform that enables Organizers and Participants to interact.
          </p>
          <p className="mb-4">
            To the extent permitted by applicable law, Somavesh does not guarantee:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>That every Event will take place as originally advertised;</li>
            <li>That an Organizer will perform all promised obligations;</li>
            <li>That Event information supplied by an Organizer will always be accurate;</li>
            <li>That a venue, speaker, schedule, or other Event component will remain unchanged;</li>
            <li>That every Event will meet a Participant's expectations;</li>
            <li>That Third-Party Services will always be available;</li>
            <li>That the Platform will always be uninterrupted or error-free.</li>
          </ul>
          <p className="mb-4">
            Organizers remain responsible for the Events they create and operate.
          </p>
          <p className="mb-4">
            Participants should consider Event-specific information and terms before registering or purchasing Tickets.
          </p>
          <p className="mb-4">
            These disclaimers do not exclude or limit responsibilities that Somavesh cannot lawfully exclude or limit.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">30. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, Somavesh and its relevant personnel, affiliates, licensors, and service providers will not be responsible for indirect, incidental, special, consequential, or similar losses arising from or relating to your use of the Platform where such limitation is legally permitted.
          </p>
          <p className="mb-4">
            This may include losses arising from circumstances such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Organizer conduct;</li>
            <li>Participant conduct;</li>
            <li>Event cancellation or changes;</li>
            <li>Event quality or outcome;</li>
            <li>Venue-related circumstances;</li>
            <li>Third-Party Services;</li>
            <li>User-generated Content;</li>
            <li>Platform interruption;</li>
            <li>Unauthorized activity by third parties.</li>
          </ul>
          <p className="mb-4">
            However, nothing in these Terms excludes or limits liability where doing so would be unlawful, including liability that cannot legally be excluded or limited.
          </p>
          <p className="mb-4">
            Any applicable liability cap or other limitation should be determined in accordance with the nature of Somavesh's business, applicable law, and legal advice.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">31. Indemnification</h2>
          <p className="mb-4">
            To the extent permitted by applicable law, you agree to be responsible for claims, losses, liabilities, damages, costs, and reasonable expenses arising from your:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Material violation of these Terms;</li>
            <li>Violation of applicable law;</li>
            <li>Misuse of the Platform;</li>
            <li>Fraudulent or unauthorized activities;</li>
            <li>Content that you submit;</li>
            <li>Organizer activities, where you are acting as an Organizer;</li>
            <li>Infringement of another person's rights.</li>
          </ul>
          <p className="mb-4">
            This section does not apply to the extent that a claim results from Somavesh's own conduct that cannot lawfully be allocated to you.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">32. Force Majeure</h2>
          <p className="mb-4">
            Somavesh will not be responsible for delays or failures caused by circumstances beyond its reasonable control, to the extent permitted by applicable law.
          </p>
          <p className="mb-4">
            Such circumstances may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Natural disasters;</li>
            <li>Widespread infrastructure failures;</li>
            <li>Government actions;</li>
            <li>Internet or telecommunications disruptions;</li>
            <li>Widespread technology outages;</li>
            <li>Major service-provider failures;</li>
            <li>Public emergencies;</li>
            <li>Other unforeseeable or unavoidable circumstances beyond reasonable control.</li>
          </ul>
          <p className="mb-4">
            This section does not remove any rights or obligations that cannot lawfully be excluded.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">33. Governing Law and Dispute Resolution</h2>
          <p className="mb-4">
            Somavesh initially operates in Bangladesh.
          </p>
          <p className="mb-4">
            The governing law applicable to these Terms and the mechanism for resolving disputes must be determined based on the legal structure and applicable requirements of Rong Plan.
          </p>
          <p className="mb-4">
            Until these provisions are finalized, users should contact Somavesh through the support or legal contact information provided on the Platform regarding disputes or legal concerns.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">34. Changes to These Terms</h2>
          <p className="mb-4">
            Somavesh may update these Terms from time to time.
          </p>
          <p className="mb-4">
            When the Terms are updated, Somavesh may publish the revised version on the Platform and update the "Last Updated" date.
          </p>
          <p className="mb-4">
            Where legally or reasonably appropriate, Somavesh may provide additional notice of material changes.
          </p>
          <p className="mb-4">
            Your continued use of Somavesh after an updated version becomes effective may constitute acceptance of the revised Terms where legally permitted.
          </p>
          <p className="mb-4">
            If you do not agree to an updated version, you should stop using the applicable Services.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">35. Severability</h2>
          <p className="mb-4">
            If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, that provision will be interpreted or modified to the extent necessary to make it enforceable where legally possible.
          </p>
          <p className="mb-4">
            If it cannot be made enforceable, the relevant provision may be severed to the extent permitted by applicable law.
          </p>
          <p className="mb-4">
            The remaining provisions will continue to apply to the extent legally permitted.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">36. Entire Agreement</h2>
          <p className="mb-4">
            These Terms, together with the documents and policies expressly incorporated into them, form the agreement governing your use of Somavesh to the extent applicable.
          </p>
          <p className="mb-4">
            These documents may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Somavesh Privacy Policy;</li>
            <li>Organizer Policy;</li>
            <li>Events Policy;</li>
            <li>Organizer Guidelines;</li>
            <li>Events Guidelines;</li>
            <li>Event-specific terms;</li>
            <li>Other terms expressly presented to you when using particular Services.</li>
          </ul>
          <p className="mb-4">
            The <strong>Terms & Conditions</strong> establish the general rules governing use of Somavesh.
          </p>
          <p className="mb-4">
            The <strong>Privacy Policy</strong> explains how personal information is handled.
          </p>
          <p className="mb-4">
            The <strong>Organizer Policy</strong> establishes mandatory requirements applicable to Organizers.
          </p>
          <p className="mb-4">
            The <strong>Events Policy</strong> establishes mandatory requirements applicable to Events published through Somavesh.
          </p>
          <p className="mb-4">
            The <strong>Organizer Guidelines</strong> provide recommended practices for Organizers.
          </p>
          <p className="mb-4">
            The <strong>Events Guidelines</strong> provide recommended practices for creating and managing Events.
          </p>
          <p className="mb-4">
            Guidelines are intended as recommendations unless expressly stated otherwise. Policies and event-specific mandatory requirements may impose binding obligations where applicable.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">37. No Waiver</h2>
          <p className="mb-4">
            If Somavesh does not immediately enforce a provision of these Terms, that does not mean Somavesh has permanently waived its right to enforce that provision later.
          </p>
          <p className="mb-4">
            Any waiver should be interpreted only to the extent expressly provided.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">38. Assignment</h2>
          <p className="mb-4">
            You may not transfer or assign your rights or obligations under these Terms where such transfer is prohibited by applicable law or without required authorization.
          </p>
          <p className="mb-4">
            Somavesh may transfer or assign its rights and obligations in connection with a restructuring, merger, acquisition, sale of assets, corporate reorganization, or similar transaction, subject to applicable law.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">39. Contact</h2>
          <p className="mb-4">
            For questions, support requests, or concerns regarding Somavesh, please contact:
            <br />
            <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>
          </p>
          <p className="mb-4">
            For intellectual property matters:
          </p>
          <p className="mb-4">
            <a href="mailto:info@somavesh.com" className="text-primary hover:underline">info@somavesh.com</a>
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">40. Important Notice for Users</h2>
          <p className="mb-4">
            Somavesh is designed to make event discovery, registration, and event management more seamless.
          </p>
          <p className="mb-4">
            The platform helps connect Organizers and Participants through technology and infrastructure.
          </p>
          <p className="mb-4">
            Organizers remain responsible for the Events they create and operate, while Participants remain responsible for providing accurate information, using valid Tickets, following Event requirements, and complying with applicable rules.
          </p>
          <p className="mb-4">
            By using Somavesh, you agree to use the Platform responsibly and to comply with these Terms and the other applicable Somavesh policies.
          </p>
        </article>
      </div>
    </div>
  );
}
