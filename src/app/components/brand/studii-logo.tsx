import type { ImgHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

/** Public URL for the square app-mark SVG (dual “i” icon). */
export const STUDII_BRAND_ICON_SRC = "/brand/studii_app_logo.svg";

/** Public URL for the horizontal Studii wordmark SVG. */
export const STUDII_BRAND_WORDMARK_SRC = "/brand/studii_text_logo.svg";

type BaseBrandImageProps = {
  /** Wrapper element classes (layout, sizing, hover). */
  className?: string;
  /** Applied directly on the `<img>` for intrinsic scaling. */
  imageClassName?: string;
  /** Accessible replacement text for the image. */
  alt?: string;
  /** When true, loads the image eagerly (e.g. above-the-fold nav). */
  priority?: boolean;
};

/**
 * Returns shared `<img>` attributes for vector brand assets loaded from `/public`.
 */
function buildBrandImgAttrs(priority: boolean): Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "loading" | "decoding"
> {
  return {
    loading: priority ? "eager" : "lazy",
    decoding: "async",
  };
}

/**
 * Renders the square Studii app icon (dual “i” mark) from `studii_app_logo.svg`.
 */
export function StudiiLogoIcon({
  className,
  imageClassName,
  alt = "Studii",
  priority = false,
}: BaseBrandImageProps) {
  return (
    <div className={cn("shrink-0", className)}>
      <img
        src={STUDII_BRAND_ICON_SRC}
        alt={alt}
        className={cn("h-full w-full object-contain", imageClassName)}
        {...buildBrandImgAttrs(priority)}
      />
    </div>
  );
}

/**
 * Renders the Studii wordmark SVG for readable branding contexts.
 */
export function StudiiLogoWordmark({
  className,
  imageClassName,
  alt = "Studii",
  priority = false,
}: BaseBrandImageProps) {
  return (
    <div className={cn(className)}>
      <img
        src={STUDII_BRAND_WORDMARK_SRC}
        alt={alt}
        className={cn("h-full w-auto object-contain object-left max-w-none", imageClassName)}
        {...buildBrandImgAttrs(priority)}
      />
    </div>
  );
}

export type StudiiLogoCombinedVariant = "navbar" | "full";

export type StudiiLogoCombinedProps = {
  /** Row wrapper classes (alignment, sizing, hover transitions). */
  className?: string;
  /** Spacing Tailwind utilities between marks. */
  gapClassName?: string;
  /**
   * `navbar`: hides the wordmark below the `md` breakpoint (icon-only on small screens).
   * `full`: always shows icon and wordmark together.
   */
  variant?: StudiiLogoCombinedVariant;
  /** Passed to {@link StudiiLogoIcon} wrapper. */
  iconClassName?: string;
  /** Passed to the icon `<img>`. */
  iconImageClassName?: string;
  /** Passed to {@link StudiiLogoWordmark} wrapper. */
  wordmarkClassName?: string;
  /** Passed to the wordmark `<img>`. */
  wordmarkImageClassName?: string;
  /** Accessible replacement text for both marks. */
  alt?: string;
  /** When true, loads images eagerly for LCP-critical placements. */
  priority?: boolean;
};

/**
 * Composes icon + wordmark for navbars and hero headers with optional responsive hiding.
 */
export function StudiiLogoCombined({
  className,
  gapClassName = "gap-2 md:gap-3",
  variant = "full",
  iconClassName,
  iconImageClassName,
  wordmarkClassName,
  wordmarkImageClassName,
  alt = "Studii",
  priority = false,
}: StudiiLogoCombinedProps) {
  const responsiveWordmark = cn(
    wordmarkClassName,
    variant === "navbar" && "hidden min-w-0 md:block"
  );

  return (
    <div className={cn("flex flex-row items-center", gapClassName, className)}>
      <StudiiLogoIcon
        className={iconClassName}
        imageClassName={iconImageClassName}
        alt={alt}
        priority={priority}
      />
      <StudiiLogoWordmark
        className={responsiveWordmark}
        imageClassName={wordmarkImageClassName}
        alt={alt}
        priority={priority}
      />
    </div>
  );
}
