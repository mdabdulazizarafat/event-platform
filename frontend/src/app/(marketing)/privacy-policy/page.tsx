import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Somavesh',
  description: 'Learn how Somavesh handles and protects your data.',
};

export default function PrivacyPolicyPage() {
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
          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Somavesh is an event discovery, registration, and event management platform designed to make event management seamless, beautiful, and accessible for everyone from solo organizers to large enterprises.
          </p>
          <p className="mb-4">
            This Privacy Policy explains how Somavesh may collect, use, disclose, store, and otherwise process personal information when you use <strong>somavesh.com</strong>, Somavesh services, event registration and ticketing features, organizer tools, check-in functionality, and related services.
          </p>
          <p className="mb-4">
            In this Privacy Policy, <strong>"Somavesh," "we," "us," and "our"</strong> refer to Somavesh and its operator, subject to confirmation of the legal entity identified below. <strong>"You" and "your"</strong> refer to a person who visits or uses Somavesh, including participants, organizers, and other users.
          </p>
          <p className="mb-4">
            This Privacy Policy applies to information processed through Somavesh. It does not necessarily apply to third-party websites, applications, payment providers, or other services that may be linked to or integrated with Somavesh.
          </p>
          <p className="mb-4">
            Because Somavesh enables independent organizers to create and operate events, the privacy practices of a particular event may also depend on the information requested by that organizer and how the organizer uses information received through the platform.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            The information we collect depends on how you use Somavesh. You may browse some parts of the platform without providing an account, while other features require information to provide the requested service.
          </p>
          <p className="mb-4">
            Depending on your use of Somavesh, we may collect the following categories of information.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">2.1 Information You Provide Directly</h3>
          <p className="mb-4">
            You may provide information when creating an account, registering for an event, purchasing or requesting a ticket, creating an event, contacting us, or using other Somavesh features.
          </p>
          <p className="mb-4">
            Depending on the service you use, this may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Account credentials</li>
            <li>Profile information</li>
            <li>Organization information</li>
            <li>Event information</li>
            <li>Ticket information</li>
            <li>Registration information</li>
            <li>Registration form responses</li>
            <li>Team or group information</li>
            <li>Information required for event participation</li>
            <li>Information provided when communicating with Somavesh support</li>
            <li>Information submitted to an organizer through an event registration form</li>
            <li>Payment-related information or transaction details</li>
          </ul>
          <p className="mb-4">
            We do not necessarily collect every category of information from every user.
          </p>
          <p className="mb-4">
            You should provide information that is accurate and appropriate for the purpose for which it is requested.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">2.2 Information Collected Through Event Registration</h3>
          <p className="mb-4">
            Organizers may configure registration forms for their events.
          </p>
          <p className="mb-4">
            Depending on the particular event, a registration form may request information needed for purposes such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Registering participants</li>
            <li>Issuing or managing tickets</li>
            <li>Confirming eligibility or participation</li>
            <li>Managing event attendance</li>
            <li>Communicating event information</li>
            <li>Organizing teams or groups</li>
            <li>Preparing certificates</li>
            <li>Meeting event-specific requirements</li>
            <li>Providing services associated with the event</li>
          </ul>
          <p className="mb-4">
            The information requested through an event registration form may therefore differ from one event to another.
          </p>
          <p className="mb-4">
            Organizers are responsible for determining what information they request through their event registration forms and for ensuring that their collection and use of that information comply with applicable law and their obligations to participants.
          </p>
          <p className="mb-4">
            Somavesh provides the technology through which organizers may collect and manage this information, subject to the applicable relationship between Somavesh and the organizer.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">2.3 Payment Information</h3>
          <p className="mb-4">
            Somavesh may support multiple payment methods and payment providers, which may include <strong>bKash, Nagad, Upay, Visa, Mastercard, and other supported payment methods</strong>.
          </p>
          <p className="mb-4">
            Depending on the payment method selected, a payment may be processed by a third-party payment provider rather than directly by Somavesh.
          </p>
          <p className="mb-4">
            When a third-party payment provider processes a payment, that provider may collect and process payment information under its own privacy policy and terms.
          </p>
          <p className="mb-4">
            Somavesh may receive information such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Payment status</li>
            <li>Transaction reference</li>
            <li>Amount</li>
            <li>Currency</li>
            <li>Payment method</li>
            <li>Transaction date and time</li>
            <li>Other information necessary to confirm or reconcile a transaction</li>
          </ul>
          <p className="mb-4">
            <strong>Somavesh does not state through this Privacy Policy that it stores full payment-card numbers, PINs, passwords, or other sensitive payment credentials unless specifically confirmed in the applicable implementation.</strong>
          </p>
          <p className="mb-4">
            The exact payment providers, payment-processing arrangements, and information exchanged between Somavesh and those providers should be confirmed before publication.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">2.4 Event, Ticket, and Attendance Information</h3>
          <p className="mb-4">
            When you register for or participate in an event, Somavesh may process information associated with your participation.
          </p>
          <p className="mb-4">
            This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Event registration status</li>
            <li>Ticket status</li>
            <li>Ticket identifiers</li>
            <li>QR-code or ticket verification information</li>
            <li>Check-in status</li>
            <li>Attendance records</li>
            <li>Event participation information</li>
            <li>Certificate-related information</li>
            <li>Information needed for event operations</li>
          </ul>
          <p className="mb-4">
            This information may be used to issue and validate tickets, facilitate event access, operate check-in processes, maintain event records, and help organizers manage their events.
          </p>
          <p className="mb-4">
            A QR code or ticket identifier may function as a way to identify or validate a registration or ticket. Its specific contents and technical implementation may vary by event and platform functionality.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">2.5 Information Collected Automatically</h3>
          <p className="mb-4">
            When you access or use Somavesh, certain information may be collected automatically by Somavesh or by service providers supporting the platform.
          </p>
          <p className="mb-4">
            Depending on the implementation, this may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Log information</li>
            <li>Session information</li>
            <li>Referrer information</li>
            <li>Pages or features accessed</li>
            <li>Platform interactions and usage information</li>
            <li>Approximate location derived from technical information</li>
            <li>Cookie information</li>
            <li>Similar technical identifiers</li>
          </ul>
          <p className="mb-4">
            The precise categories of automatically collected information depend on the technologies currently implemented on Somavesh.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">3. How We Use Information</h2>
          <p className="mb-4">
            We may use information for the following purposes, depending on how you use Somavesh and the context in which the information was collected.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.1 Providing and Operating the Platform</h3>
          <p className="mb-4">
            We may use information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Create and maintain accounts</li>
            <li>Authenticate users</li>
            <li>Provide event discovery features</li>
            <li>Display event information</li>
            <li>Process event registrations</li>
            <li>Issue and manage digital tickets</li>
            <li>Facilitate event participation</li>
            <li>Support QR-based ticket verification and check-in</li>
            <li>Provide organizer dashboards</li>
            <li>Support event operations</li>
            <li>Provide customer and technical support</li>
          </ul>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.2 Processing Transactions</h3>
          <p className="mb-4">
            We may use transaction-related information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Facilitate ticket purchases or other event-related transactions</li>
            <li>Confirm payment status</li>
            <li>Maintain transaction records</li>
            <li>Reconcile transactions</li>
            <li>Process refunds where applicable</li>
            <li>Respond to payment-related inquiries</li>
            <li>Detect and prevent payment-related fraud or abuse</li>
          </ul>
          <p className="mb-4">
            Where a payment is processed by a third-party provider, that provider may independently process payment information under its own terms and privacy practices.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.3 Communications</h3>
          <p className="mb-4">
            We may use information to send service-related communications, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Registration confirmations</li>
            <li>Ticket information</li>
            <li>Payment confirmations or status updates</li>
            <li>Event updates</li>
            <li>Changes to event information</li>
            <li>Check-in information</li>
            <li>Account notifications</li>
            <li>Security notifications</li>
            <li>Responses to support requests</li>
          </ul>
          <p className="mb-4">
            These communications may be necessary to provide the services you requested and may continue even if you opt out of optional marketing communications.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.4 Marketing Communications</h3>
          <p className="mb-4">
            Where Somavesh sends optional marketing or promotional communications, we may use your contact information for those communications where permitted by applicable law.
          </p>
          <p className="mb-4">
            Where an applicable opt-out mechanism is provided, you may use it to stop receiving optional marketing communications.
          </p>
          <p className="mb-4">
            Opting out of marketing communications does not necessarily stop essential service or transactional communications.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.5 Improving Somavesh</h3>
          <p className="mb-4">
            We may use information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Understand how the platform is used</li>
            <li>Improve usability and functionality</li>
            <li>Improve platform performance</li>
            <li>Diagnose technical problems</li>
            <li>Develop and test new features</li>
            <li>Understand event and platform usage patterns</li>
            <li>Improve reliability and user experience</li>
          </ul>
          <p className="mb-4">
            Where appropriate, we may use aggregated or otherwise de-identified information for analytical and product-development purposes.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.6 Security and Fraud Prevention</h3>
          <p className="mb-4">
            We may process information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Detect suspicious activity</li>
            <li>Prevent fraudulent registrations or transactions</li>
            <li>Protect user accounts</li>
            <li>Prevent unauthorized access</li>
            <li>Protect organizers and participants</li>
            <li>Investigate abuse or violations of platform rules</li>
            <li>Monitor and respond to security incidents</li>
            <li>Protect the availability and integrity of Somavesh</li>
          </ul>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">3.7 Legal and Compliance Purposes</h3>
          <p className="mb-4">
            We may process or disclose information when reasonably necessary to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Comply with applicable law</li>
            <li>Respond to valid legal process</li>
            <li>Respond to lawful requests from competent authorities</li>
            <li>Establish, exercise, or defend legal claims</li>
            <li>Investigate suspected unlawful activity</li>
            <li>Enforce applicable terms, policies, or agreements</li>
            <li>Protect the rights, property, or safety of Somavesh, users, organizers, or others</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">4. How We Share Information</h2>
          <p className="mb-4">
            We do not treat all information held by Somavesh as information that is automatically available to every organizer or user.
          </p>
          <p className="mb-4">
            Information may be shared with different recipients depending on why it was collected and what service is being provided.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">4.1 Event Organizers</h3>
          <p className="mb-4">
            When you register for an event through Somavesh, certain information may be made available to the organizer of that event when necessary to operate the event.
          </p>
          <p className="mb-4">
            Depending on the event and registration form, this may include information such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Ticket information</li>
            <li>Registration responses</li>
            <li>Team or group information</li>
            <li>Registration status</li>
            <li>Check-in or attendance status</li>
            <li>Other information you submitted specifically for that event</li>
          </ul>
          <p className="mb-4">
            The information available to an organizer depends on the event, the registration process, the organizer's configuration, and the functionality provided by Somavesh.
          </p>
          <p className="mb-4">
            <strong>Organizers do not automatically receive unrestricted access to all personal information held by Somavesh.</strong>
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">4.2 Authorized Event co-organizer</h3>
          <p className="mb-4">
            Organizers may designate and authorize a co-organizer to perform operational functions.
          </p>
          <p className="mb-4">
            Where applicable, an authorized co-organizer may receive or access information necessary for functions such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Checking tickets</li>
            <li>Verifying QR codes</li>
            <li>Confirming registrations</li>
            <li>Managing attendance</li>
            <li>Supporting participants</li>
            <li>Operating the event</li>
          </ul>
          <p className="mb-4">
            Access should be limited according to the functionality and permissions available to the organizer or co-organizer member.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">4.3 Payment Providers</h3>
          <p className="mb-4">
            Payment-related information may be processed or shared with payment providers when necessary to facilitate a transaction.
          </p>
          <p className="mb-4">
            These providers may include providers supporting payment methods such as bKash, Nagad, Upay, Visa, Mastercard, or other supported methods.
          </p>
          <p className="mb-4">
            Payment providers may have their own privacy policies and terms governing their processing of personal and payment information.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">4.4 Technology and Infrastructure Providers</h3>
          <p className="mb-4">
            Somavesh may use third-party service providers to operate and support the platform.
          </p>
          <p className="mb-4">
            Depending on the implementation, these providers may support:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Cloud hosting</li>
            <li>Email delivery</li>
            <li>SMS delivery</li>
            <li>Monitoring</li>
            <li>Infrastructure management</li>
            <li>Other technical services</li>
          </ul>
          <p className="mb-4">
            These providers may process information on behalf of Somavesh where necessary to provide their services.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">4.5 Legal and Regulatory Disclosures</h3>
          <p className="mb-4">
            We may disclose information where required by applicable law, valid legal process, or a lawful request from an authorized authority.
          </p>
          <p className="mb-4">
            We may also disclose information where reasonably necessary to protect rights, safety, property, security, or the integrity of Somavesh and its users.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">4.6 Business Transfers</h3>
          <p className="mb-4">
            If Somavesh or relevant business assets are involved in a merger, acquisition, restructuring, financing, reorganization, sale, or similar business transaction, information may be transferred or disclosed as part of that transaction, subject to applicable law.
          </p>
          <p className="mb-4">
            Where appropriate, the receiving entity may become responsible for the information in accordance with the applicable transaction and privacy requirements.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">5. Organizer-Provided and Organizer-Controlled Data</h2>
          <p className="mb-4">
            Somavesh is designed to connect organizers and participants.
          </p>
          <p className="mb-4">
            Organizers may create events, publish event information, configure registration forms, manage participants, operate check-in, and perform other event-management activities through Somavesh.
          </p>
          <p className="mb-4">
            When you submit information through an organizer's event registration form:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-6">
            <li>You provide information through the Somavesh platform.</li>
            <li>The information may be made available to the relevant organizer for purposes connected with that event.</li>
            <li>Somavesh may process and store that information to provide the platform and related services.</li>
            <li>The organizer may use the information for legitimate event-related purposes, subject to applicable law and the organizer's own responsibilities.</li>
          </ol>
          <p className="mb-4">
            Organizers are responsible for determining the information they request from participants and for handling information they receive through Somavesh in accordance with applicable law and their obligations.
          </p>
          <p className="mb-4">
            For example, an organizer may need participant information to manage registration, issue certificates, organize teams, communicate event updates, or conduct event check-in.
          </p>
          <p className="mb-4">
            Somavesh does not, however, transfer all responsibility for personal information to organizers. Somavesh remains responsible for its own processing activities and obligations relating to information it handles through its platform.
          </p>
          <p className="mb-4">
            The exact allocation of responsibilities between Somavesh and an organizer may also depend on the applicable agreement between Somavesh and that organizer.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">6. Cookies and Similar Technologies</h2>
          <p className="mb-4">
            Somavesh may use cookies and similar technologies to support the operation and security of the platform.
          </p>
          <p className="mb-4">
            Depending on the technologies implemented, these may be used for:
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">Essential Functions</h3>
          <p className="mb-4">
            To enable core platform functionality, authentication, sessions, and other necessary features.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">Security</h3>
          <p className="mb-4">
            To help detect unauthorized activity, abuse, or suspicious behavior.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">Preferences</h3>
          <p className="mb-4">
            To remember certain settings or preferences where applicable.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">Analytics and Performance</h3>
          <p className="mb-4">
            Where implemented, analytics technologies may help us understand how users interact with Somavesh and identify opportunities to improve performance and usability.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">7. Data Retention</h2>
          <p className="mb-4">
            We may retain personal information for as long as reasonably necessary for the purposes described in this Privacy Policy, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide and maintain Somavesh services</li>
            <li>Maintain account and event records</li>
            <li>Maintain ticket and attendance records</li>
            <li>Maintain transaction records</li>
            <li>Support security and fraud prevention</li>
            <li>Resolve disputes</li>
            <li>Investigate abuse</li>
            <li>Meet applicable legal, accounting, or regulatory requirements</li>
            <li>Enforce agreements and protect legal rights</li>
          </ul>
          <p className="mb-4">
            Retention periods may vary depending on the type of information, the purpose for which it was collected, the nature of the event or transaction, and applicable legal or operational requirements.
          </p>
          <p className="mb-4">
            Closing an account does not necessarily result in the immediate deletion of every record associated with that account.
          </p>
          <p className="mb-4">
            We may need to retain some information for legitimate business, security, dispute-resolution, or legal purposes.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">8. Data Security</h2>
          <p className="mb-4">
            We use reasonable technical and organizational measures designed to protect personal information against unauthorized access, alteration, disclosure, loss, or misuse.
          </p>
          <p className="mb-4">
            Depending on the system and information involved, security measures may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Access controls</li>
            <li>Authentication mechanisms</li>
            <li>Encryption where applicable</li>
            <li>Secure infrastructure</li>
            <li>Monitoring and logging</li>
            <li>Restricted access to personal information</li>
            <li>Security procedures</li>
            <li>Measures designed to identify and respond to security incidents</li>
          </ul>
          <p className="mb-4">
            However, no online service or electronic transmission can be guaranteed to be completely secure.
          </p>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and should notify Somavesh if you believe your account has been accessed without authorization.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">9. Your Privacy Choices and Rights</h2>
          <p className="mb-4">
            Depending on applicable law and the circumstances of the processing, you may have rights concerning your personal information.
          </p>
          <p className="mb-4">
            These may include the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Request access to personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request updates to information</li>
            <li>Request deletion of certain information</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Object to or request restriction of certain processing</li>
            <li>Request data portability where legally applicable</li>
          </ul>
          <p className="mb-4">
            These rights are not absolute and may be subject to applicable legal or legitimate exceptions.
          </p>
          <p className="mb-4">
            For example, Somavesh may need to retain certain information to comply with legal obligations, maintain transaction records, prevent fraud, resolve disputes, or protect security.
          </p>
          <p className="mb-4">
            To make a privacy request, contact us using the information provided in the <strong>Contact Us</strong> section.
          </p>
          <p className="mb-4">
            We may need to verify your identity before responding to certain requests.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">10. Account Information</h2>
          <p className="mb-4">
            If you have a Somavesh account, you should keep your account information accurate and up to date.
          </p>
          <p className="mb-4">
            Depending on available functionality, you may be able to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>View your account information</li>
            <li>Update profile details</li>
            <li>Change certain account information</li>
            <li>Manage account settings</li>
            <li>Request account closure</li>
          </ul>
          <p className="mb-4">
            If a particular account-management function is not available directly through the platform, you may contact Somavesh support for assistance.
          </p>
          <p className="mb-4">
            Account closure does not necessarily require or result in immediate deletion of every record associated with the account.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">11. Communications</h2>
          <p className="mb-4">
            Somavesh may send communications that are necessary to provide services.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">11.1 Transactional and Service Communications</h3>
          <p className="mb-4">
            These may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Registration confirmations</li>
            <li>Ticket confirmations</li>
            <li>Payment status</li>
            <li>Event changes</li>
            <li>Event reminders</li>
            <li>Check-in information</li>
            <li>Account notifications</li>
            <li>Security alerts</li>
            <li>Support responses</li>
          </ul>
          <p className="mb-4">
            These communications may be necessary for the service and may not be subject to the same opt-out mechanisms as optional marketing messages.
          </p>

          <h3 className="text-xl font-bold text-foreground font-heading mt-8 mb-3">11.2 Marketing Communications</h3>
          <p className="mb-4">
            Where Somavesh sends optional marketing communications, you may be provided with an unsubscribe or other opt-out mechanism where required or appropriate.
          </p>
          <p className="mb-4">
            Opting out of marketing communications will not necessarily prevent Somavesh from sending essential service, transactional, account, or security communications.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">12. Children's and Minors' Privacy</h2>
          <p className="mb-4">
            Somavesh may be used in connection with events that have different audiences, including events that may be attended by or designed for minors.
          </p>
          <p className="mb-4">
            Somavesh does not establish a universal minimum participant age through this Privacy Policy unless applicable law, platform terms, or an event separately specify such an age requirement.
          </p>
          <p className="mb-4">
            Some events may have their own age requirements or may require parental or guardian involvement.
          </p>
          <p className="mb-4">
            Organizers are responsible for designing and operating their events and registration processes in accordance with applicable requirements concerning minors, including any requirements relating to parental or guardian consent where applicable.
          </p>
          <p className="mb-4">
            Where Somavesh becomes aware that information has been collected in a manner that violates applicable requirements concerning minors, appropriate steps may be taken based on the circumstances and applicable law.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">13. Third-Party Links and Services</h2>
          <p className="mb-4">
            Somavesh may contain links to or integrations with third-party websites, applications, payment services, communication services, social platforms, or other external services.
          </p>
          <p className="mb-4">
            Those third parties may collect and process information independently from Somavesh.
          </p>
          <p className="mb-4">
            Their privacy practices are governed by their own privacy policies and terms.
          </p>
          <p className="mb-4">
            We encourage you to review the privacy practices of third-party services before providing information to them.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">14. International Data Processing</h2>
          <p className="mb-4">
            Somavesh is initially focused on Bangladesh and may use third-party infrastructure or service providers that operate in different locations.
          </p>
          <p className="mb-4">
            Depending on the platform's technical architecture and service providers, personal information may potentially be processed or stored outside Bangladesh.
          </p>
          <p className="mb-4">
            Where applicable, international transfers or processing will be handled in accordance with applicable law and the relevant contractual and technical arrangements.
          </p>
          <p className="mb-4">
            The specific countries, hosting providers, and international transfer mechanisms should be confirmed before this section is finalized.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">15. Data Deletion</h2>
          <p className="mb-4">
            You may request deletion of certain personal information by contacting Somavesh using the contact information provided below.
          </p>
          <p className="mb-4">
            Depending on the circumstances, we may be able to delete or anonymize information that is no longer required for legitimate purposes.
          </p>
          <p className="mb-4">
            However, deletion may not be immediate or absolute.
          </p>
          <p className="mb-4">
            We may retain certain information where necessary to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Complete or document transactions</li>
            <li>Maintain event records</li>
            <li>Prevent fraud or abuse</li>
            <li>Maintain security</li>
            <li>Resolve disputes</li>
            <li>Establish or defend legal claims</li>
            <li>Comply with applicable law</li>
            <li>Meet legitimate record-keeping requirements</li>
          </ul>
          <p className="mb-4">
            Information contained in backup systems may also remain for a limited period while those systems are securely overwritten or otherwise managed according to applicable retention practices.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">16. Security and Fraud Prevention</h2>
          <p className="mb-4">
            Somavesh may process information to protect the platform and its users.
          </p>
          <p className="mb-4">
            This may include processing information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Detect suspicious account activity</li>
            <li>Prevent fraudulent registrations</li>
            <li>Detect potentially fraudulent ticket transactions</li>
            <li>Prevent unauthorized access</li>
            <li>Protect organizer accounts</li>
            <li>Protect participant accounts</li>
            <li>Investigate abuse</li>
            <li>Identify attempts to misuse the platform</li>
            <li>Respond to security incidents</li>
          </ul>
          <p className="mb-4">
            Where appropriate, automated or technical systems may be used to identify suspicious activity. Such systems may be supplemented by human review or other safeguards depending on the circumstances.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">17. Legal Basis and Applicable Law</h2>
          <p className="mb-4">
            Somavesh may process personal information where permitted or required by applicable law.
          </p>
          <p className="mb-4">
            Depending on the jurisdiction and circumstances, processing may be necessary to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide a service requested by you</li>
            <li>Perform or administer an agreement</li>
            <li>Operate and secure the platform</li>
            <li>Comply with legal obligations</li>
            <li>Protect legitimate interests</li>
            <li>Prevent fraud and abuse</li>
            <li>Respond to legal requirements</li>
            <li>Obtain or rely on consent where consent is legally required</li>
          </ul>
          <p className="mb-4">
            The specific legal basis for processing may differ depending on the user, jurisdiction, information, and purpose.
          </p>
          <p className="mb-4">
            Somavesh initially operates in the Bangladesh context and does not make a blanket claim through this Privacy Policy that it is subject to any particular foreign data-protection regime.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">18. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            Somavesh may update this Privacy Policy from time to time.
          </p>
          <p className="mb-4">
            When we make changes, we will publish the updated version on the Somavesh website and update the <strong>"Last Updated"</strong> date.
          </p>
          <p className="mb-4">
            For significant changes, we may provide additional notice where appropriate or required by applicable law.
          </p>
          <p className="mb-4">
            Your continued use of Somavesh after an updated Privacy Policy becomes effective will be subject to the updated policy to the extent permitted by applicable law.
          </p>

          <h2 className="text-2xl font-bold text-foreground font-heading mt-10 mb-4">19. Contact Us</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy, want to make a privacy request, or have concerns about how personal information is handled, please contact Somavesh.
          </p>
          <p className="mb-4">
            <strong>Support Email:</strong> <a href="mailto:support@somavesh.com" className="text-primary hover:underline">support@somavesh.com</a>
          </p>
          <p className="mb-4">
            When contacting us about a privacy request, please provide enough information for us to understand your request. We may request additional information to verify your identity where appropriate.
          </p>
        </article>
      </div>
    </div>
  );
}
