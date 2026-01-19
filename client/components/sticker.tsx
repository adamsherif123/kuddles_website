import Image from "next/image"
import { cn } from "@/lib/utils"

type StickerProps = {
  src: string
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  className?: string
  hideOnMobile?: boolean
}

const sizeClasses = {
  sm: "w-12 h-12 md:w-16 md:h-16",
  md: "w-16 h-16 md:w-24 md:h-24",
  lg: "w-24 h-24 md:w-32 md:h-32",
  xl: "w-32 h-32 md:w-40 md:h-40",
}

const positionClasses = {
  "top-left": "-top-4 -left-4 md:-top-6 md:-left-6",
  "top-right": "-top-4 -right-4 md:-top-6 md:-right-6",
  "bottom-left": "-bottom-4 -left-4 md:-bottom-6 md:-left-6",
  "bottom-right": "-bottom-4 -right-4 md:-bottom-6 md:-right-6",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
}

export function Sticker({
  src,
  alt,
  size = "md",
  position = "top-right",
  className,
  hideOnMobile = false,
}: StickerProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none z-10",
        sizeClasses[size],
        positionClasses[position],
        hideOnMobile && "hidden md:block",
        className,
      )}
    >
      <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-contain drop-shadow-md" />
    </div>
  )
}
