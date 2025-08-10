import Image from "next/image"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 pb-32 sm:pb-16">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-8">
            {/* Replace with your logo */}
            <Image
              src="/images/logo.svg"
              alt="The Players Club"
              width={96}
              height={96}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="font-mono text-gray-800 leading-relaxed space-y-6 text-base">
            {/* Paste your Privacy Policy here */}
            <p>
              At The Players, your privacy is important to us. This Privacy Policy explains how The Players ("we," "us," or "our") collect, use, share, and protect your personal information when you use our website and services.
            </p>

            <p><b>Collection and Use of Personal Data</b></p>
            <p>
              Personal data means any information that can identify you directly or indirectly. This includes data you provide to us as well as data collected automatically when you use our service.
              We collect and process your data to provide and improve our products, ensure security, communicate with you, and comply with legal obligations.
            </p>

            <p>
              <b>Types of Data We Collect</b><br/>
              <u>DATA YOU PROVIDE</u><br/>
              When you create an account, place an order, contact customer support, or participate in surveys, we collect information such as your name, email, shipping and billing address, payment details, and other contact information.<br/>
              <u>DATA FROM YOUR USE OF OUR SERVICES</u><br/>
              We may collect technical data such as your device type, IP address, browser type, operating system, location data (with your permission), and usage patterns to optimize and personalize your experience.
            </p>
            <p><b>Cookies and Tracking Technologies</b></p>
            <p>We use cookies and similar technologies to improve site functionality, personalize content, measure ad performance, and understand user behavior. You can control or disable cookies via your browser settings, but this may affect your experience.</p>
            <p><b>Sharing Your Data</b></p>
            <p>We only share personal data with trusted partners to help deliver our services, such as payment processors and shipping companies. We do not sell your personal information or share it for third-party marketing without your explicit consent.
            We may disclose data if legally required or to protect our rights, users, or comply with law enforcement.</p>
            <p><b>Your Rights</b></p>
            <p>You have the right to access, correct, or delete your personal data, and to restrict or object to certain processing. You may also request a copy of your data in a portable format. To exercise your rights, please contact us at tplsclub@gmail.com. We will respond within 30 days.</p>
            <p><b>Third-Party Websites and Services</b></p>
            <p>Our website may contain links to third-party websites or services. We are not responsible for their privacy practices. We recommend reviewing their privacy policies before using their services.
            We use third-party tools such as Google Analytics and Facebook Pixel to analyze site usage and improve marketing efforts.</p>
            <p><b>Data Security and Retention</b></p>
            <p>We implement technical and organizational measures to protect your data against unauthorized access or loss. We keep your personal information only as long as necessary to fulfill the purposes described in this policy or as required by law.</p>
            <p><b>Changes to This Privacy Policy</b></p>
            <p>We may update this policy periodically to reflect changes in our practices, technology, or legal requirements. Continued use of our services after changes means you accept the new policy. If you disagree, please contact us to close your account.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
