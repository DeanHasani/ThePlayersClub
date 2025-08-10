import Image from "next/image"

export default function TermsConditionsPage() {
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
            {/* Paste your Terms & Conditions here */}
            <p>
              The following terms and conditions apply to all orders placed by the customer (hereinafter referred to as “you”) with The Players, hereinafter referred to as “we”, “us” or “our”, via our official website theplayersofficial.com or mobile version of the site (jointly referred to as “The Players Website”).
            </p>

            <p>
              By using theplayersofficial.com and/or placing an order, you agree to be bound by these terms and conditions (the “Terms”). Please ensure that you have read and understood the Terms before placing your order.
            </p>

            <p>
              We reserve the right to limit delivery access to certain regions during specific periods of the year, including but not limited to instances of extreme weather conditions, customs delays, or other unforeseen logistical challenges.
            </p>

            <p>
                The appearance of any products or services on theplayersofficial.com at a given time does not imply or guarantee their availability at any future date. We reserve the right to modify, limit, or discontinue any product at our discretion and without prior notice.
            </p>

            <p>
                We may amend these Terms from time to time. The version of the Terms that will apply to your order is the one available on theplayersofficial.com at the time of your purchase.
            </p><br/>

            <p>
                <u>
                In order to maintain a secure and smooth experience on our site, you agree not to:
                </u>
            </p>
            <p>
                Post or transmit content that may harm our platform, brand, or customers;
            </p>
            <p>
                Use any tools or technologies (including bots, crawlers, or scripts) to manipulate, extract, or replicate content;
            </p>
            <p>
                Interfere with the accessibility or security of theplayersofficial.com.
            </p>
            <p>
                Violation of these terms may result in suspension or termination of access to our services.
            </p><br/>
            <p>
                <u>
                Ownership of Rights
                </u>
            </p>
            <p>
                All content on theplayersofficial.com — including text, images, logos, graphics, and product designs — is the intellectual property of The Players.
            </p>
            <p>
                Any use of the site or its contents for commercial purposes without express written consent is strictly prohibited.
            </p>
            <p>
                If your package is significantly delayed or lost, please contact us at: tplsclub@gmail.com
            </p><br/>
            <p>
                <u>
                Prices & Delivery Charges
                </u>
            </p>
            <p>
                All prices displayed on our site include applicable taxes (e.g. VAT), unless stated otherwise.
            </p>
            <p>
                Shipping charges are shown clearly during the checkout process based on destination and delivery method selected.
            </p>
            <p>
                If you place an order with a destination in the EU, import duties may apply, and The Players is not responsible for covering these charges or refunding any shipping costs.
            </p>
            <p>
                For orders outside the EU, duties and taxes may be applicable depending on local laws. These fees are the responsibility of the customer.
            </p>
            <p>
                If we are unable to fulfill your order (due to stock or payment issues), we will notify you promptly. In such cases, any payment made will be refunded to your original payment method. If alternative solutions are needed, our customer service team will assist you directly.
            </p><br/>
            <p>
                <u>
                Disclaimer of Accuracy & Liability
                </u>
            </p>
            <p>
                We make every effort to ensure the accuracy and completeness of all information on our site — including product details, prices, sizing, and availability — but we do not guarantee that all content is free from errors.
            </p>
            <p>
                The Players will not be held liable for any inaccuracies or omissions, nor for damages arising from reliance on the information presented.
            </p><br/><br/>
            <b>
                <p>
                Company Information
                </p>
                <p>
                The Players
                </p>
                <p>
                Independent Brand – Designed in Tirana
                </p>
                <p>
                +355 69 000 0000
                </p>
                <p>
                <u>
                Email: tplsclub@gmail.com
                </u>
                </p>
            </b>
        </div>
        </div>
    </div>
    </div>
  )
}
