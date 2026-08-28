import Image from "next/image";
import Link from "next/link";
import { Shapes } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Category } from "@/types/catalog";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.id}`}>
      <Card className="group hover-lift press-scale gap-0 overflow-hidden py-0">
        <div className="bg-muted relative aspect-4/3 overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 20vw, 40vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <Shapes className="size-8" />
            </div>
          )}
          <div className="via-black/5 absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="p-3.5 text-center">
          <p className="text-sm font-medium">{category.name}</p>
        </div>
      </Card>
    </Link>
  );
}
