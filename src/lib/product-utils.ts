import type { Product } from "./products";

export function expandLegacyProducts(products: Product[]): Product[] {
  const expanded: Product[] = [];
  for (const product of products) {
    if (product.frontImage) {
      expanded.push(product);
    } else if (product.images && product.images.length > 0) {
      product.images.forEach((img, index) => {
        expanded.push({
          ...product,
          id: `${product.id}-img-${index}`,
          images: [img],
          originalImages: product.originalImages?.[index] ? [product.originalImages[index]] : [img],
        });
      });
    } else {
      expanded.push(product);
    }
  }
  return expanded;
}
