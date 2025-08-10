import Image from "next/image"

export default function AboutUsPage() {
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
            {/* Paste your About Us text here */}
            <p><b>The Story Behind The Players</b></p>
            <p>
              It all started with an idea — not just to create clothing, but to create something real.
              Something that spoke our language. The language of streets, hustle, ambition, and individuality.
              A style born not from runways, but from pavement. From concrete playgrounds, late-night rides, and conversations that mattered.
            </p>

            <p>
              The Players wasn’t made in a boardroom. It was built from the ground up — with passion, with risk, and with the belief that we don’t have to fit into someone else’s mold to be seen.
              We started with sketches on paper, sleepless nights, and samples no one ever saw.
              We kept pushing. We tested fabrics, cuts, and tones. We learned what looked good, what felt better, and what represented us.
              Because that’s what this is about — representing the ones who don’t just follow culture, but create it.
            </p>

            <p>
              “The Players” is for the ones who show up differently. The ones who walk with intent. Who know what they want, even if the world doesn’t get it yet.
              Every drop, every design, every stitch — it’s all for you.
              For the movers. The risk-takers. The lowkey icons.
              For the ones playing their own game, and playing it well.
              From Tirana to the world — we’re just getting started.
              You don’t need permission to stand out. You just need the right uniform.
            </p>
            <p>
            <b>
            We are The Players. And so are you.
            </b>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
