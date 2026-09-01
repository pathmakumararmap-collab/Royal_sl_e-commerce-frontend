import Link from "next/link";

export function FlashSaleBanner() {
  return (
    <section className="container-page pt-6 sm:pt-10">
      <Link
        
      href="/products?sort=latest"
      className="hover-lift-sm shadow-luxury-sm block overflow-hidden"
>
      
        {/* Plain <img>, not next/image — the optimizer would strip the GIF's animation frames. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Flash_sale_promotional_video_ani_202608311300-ezgif.com-video-to-gif-converter.gif"
          alt="Flash Sale — up to 50% off, limited time"
          className="aspect-[800/193] w-full object-cover"
        />
      </Link>
    </section>
  );
}