import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - GraphiXo',
  description: 'Learn how we use cookies to enhance your experience on GraphiXo',
};

export default function CookiePolicy() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="mb-6 text-gray-300">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
        <p className="mb-4">
          Cookies are small text files stored on your device when you visit websites. 
          They help websites remember information about your visit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Essential Cookies:</strong> Necessary for the website to function properly
          </li>
          <li>
            <strong>Performance Cookies:</strong> Help us understand how visitors interact with our site
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your preferences and settings
          </li>
          <li>
            <strong>Targeting Cookies:</strong> Used for advertising purposes
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
        <p className="mb-4">
          You can control and/or delete cookies through your browser settings. 
          However, disabling essential cookies may affect website functionality.
        </p>
        <p>
          For more information about cookies, visit <a href="https://www.allaboutcookies.org" 
          className="text-purple-400 hover:underline" target="_blank">allaboutcookies.org</a>.
        </p>
      </section>
    </main>
  );
}