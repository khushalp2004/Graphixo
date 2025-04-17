import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - GraphiXo',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly when you use our services, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Account information (email, name when you register)</li>
          <li>Content you upload or create with our tools</li>
          <li>Payment information for premium services</li>
          <li>Communications with our support team</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, maintain and improve our services</li>
          <li>Develop new features and functionality</li>
          <li>Process transactions and send related information</li>
          <li>Respond to your comments and questions</li>
        </ul>
      </section>

      {/* Add more sections as needed */}
    </div>
  );
}