import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shapes } from "lucide-react";

import type { Category } from "@/types/catalog";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="hover-lift-sm bg-card border-border/60 shadow-luxury-sm w-[calc((100%-1.5rem)/3)] shrink-0 snap-start overflow-hidden rounded-2xl border sm:hidden"
    >
      <div className="bg-muted relative aspect-square">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="150px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <Shapes className="size-7" />
          </div>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        <p className="line-clamp-1 text-xs font-semibold">{category.name}</p>
        {typeof category.products_count === "number" && (
          <p className="text-muted-foreground text-[10px]">{category.products_count}+ Products</p>
        )}
        <span className="text-primary inline-flex items-center gap-0.5 text-[10px] font-medium">
          Explore
          <ArrowRight className="size-2.5" />
        </span>
      </div>
    </Link>
  );
}

const TINTS = [
  "from-primary/15 to-primary/0",
  "from-accent/25 to-accent/0",
  "from-secondary to-secondary/0",
];

export function CategoryCardLarge({ category, index }: { category: Category; index: number }) {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="group hover-lift-sm bg-card border-border/60 shadow-luxury-sm relative hidden aspect-4/3 overflow-hidden rounded-2xl border sm:block"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${TINTS[index % TINTS.length]}`} />
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(min-width: 1024px) 20vw, 45vw"
          className="object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105 dark:mix-blend-normal"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-1 p-4">
        <p className="text-lg font-semibold text-white">{category.name}</p>
        <p className="line-clamp-1 text-xs text-white/80">
          {category.description ?? `Explore our ${category.name.toLowerCase()} collection.`}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-white">
          Explore
          <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}
