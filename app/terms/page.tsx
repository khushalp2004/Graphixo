import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - GraphiXo',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using GraphiXo's services, you agree to be bound by these Terms. 
          If you do not agree, you may not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. User Responsibilities</h2>
        <p className="mb-4">
          You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Upload illegal or infringing content</li>
          <li>Use our services for any unlawful purpose</li>
          <li>Attempt to reverse engineer our technology</li>
          <li>Share your account credentials</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Intellectual Property</h2>
        <p className="mb-4">
          You retain ownership of any content you upload. By using our services, you grant us 
          a limited license to process your content solely to provide the services.
        </p>
      </section>

      {/* Add more sections as needed */}
    </div>
  );
}