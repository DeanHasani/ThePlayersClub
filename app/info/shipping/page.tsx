import Image from "next/image"

export default function ShippingPage() {
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
            {/* Paste your Shipping information here */}
            <p>
              You will typically receive your order within 2 to 7 business days after we confirm your payment.
              Please note that delivery times may be extended during collection drops, holiday periods, or limited-time sales, due to higher order volumes.
            </p>
            <p>
              All shipments may be subject to import duties, customs tariffs, and VAT, which are set by the destination country. These fees are based on the country of origin/manufacturing of the items and are applied once your package arrives at your local customs office.
              The Players does not collect duties or taxes during checkout and cannot predict the specific charges you may incur.
              If such charges apply, they must be paid by you in order for your package to be released from customs.
              For more details about import policies in your country, we recommend contacting your local customs office.
              Shipping costs are automatically calculated at checkout based on order weight and shipping destination.
            </p>

            <p>
                <b>
              Return & Refund Policy
              </b>
            </p>

            <p>
              All sales are final. We do not offer refunds.<br/>
              -Exchanges, cancellations, or returns are only accepted in limited cases and must be requested via email.<br/>
              -If approved, the customer is responsible for covering all return shipping costs to our facility.<br/>
              -Returned items must be in unused condition, with original packaging and tags.<br/>
              We recommend reviewing sizing and product information carefully before placing your order.<br/>
              For any questions, reach out to us at: tplsclub@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
