import Image from "next/image"

export default function ContactPage() {
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
            {/* Paste your Contact information here */}
            <p>
              We love hearing from you, so if there’s anything you’d like to ask us, we’re here to help in every way we can:
            </p>
            <p>
                <b>
                    <p>
                    e-mail: tplsclub@gmail.com 
                    </p>
                    <p>
                    WhatsApp: +355 68 800 4174
                    </p>
                </b>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
