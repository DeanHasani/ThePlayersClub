import Image from "next/image"

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export default function LoadingSpinner({ size = 64, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="animate-spin">
        <Image
          src="/images/logo.svg"
          alt="Loading..."
          width={size}
          height={size}
          className="w-16 h-16 sm:w-20 sm:h-20"
          priority
        />
      </div>
      <p className="mt-4 text-sm text-gray-600 animate-pulse">Loading...</p>
    </div>
  )
}
