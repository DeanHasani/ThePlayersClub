import Image from "next/image"

export default function RefundPolicyPage() {
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
            {/* Paste your Refund Policy here */}
            <p>
              All sales are final. We do not offer refunds. Regarding exchanges, cancellations or returns the customer must pay the shipping of product back to our store.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
