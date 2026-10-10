import { Link } from 'react-router-dom';
import { unicorn } from './AssistantEmbed';
import { Plus } from 'lucide-react';
import ProductImage from './ProductImage';
import Rating from './Rating';
import { money } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../lib/types';

// Common colour names → swatch fills; unknown names fall back to a neutral dot.
const SWATCH: Record<string, string> = {
  black: '#1B1A17', white: '#FFFFFF', 'off-white': '#F4EFE3', grey: '#9CA3AF', graphite: '#4B4F54', charcoal: '#36454F',
  navy: '#1F2A44', crimson: '#C8102E', red: '#D62828', maroon: '#7A1F2B', blush: '#F4C2C2', sage: '#A3B18A', olive: '#6B7040',
  green: '#1F7A4D', teal: '#14808A', mint: '#AEE1C9', sand: '#D8C3A5', stone: '#C9C1B1', cream: '#F3E9D2', sunflower: '#FFC93C',
  midnight: '#1E2235', tortoise: '#7B4B2A', ivory: '#FFFFF0', terracotta: '#C8643B', forest: '#2F4F3A',
};
export const swatch = (name: string) => SWATCH[name.toLowerCase()] || '#E9DFC9';

export default function ProductCard({ product, tone = 'bg-yellow' }: { product: Product; tone?: string }) {
  const { add } = useCart();
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const hasChoices = product.variantCount > 1;

  return (
    <article className="lift group relative flex flex-col overflow-hidden rounded-blob border-2 border-ink bg-paper">
      <Link to={`/p/${product.handle}`} className="relative block">
        <ProductImage src={product.image} alt={product.title} className="aspect-[4/3] w-full" />
        <span className={`sticker absolute bottom-3 right-3 rounded-full border-2 border-ink px-3 py-1 font-display text-lg font-semibold shadow-sticker ${tone}`}>
          {product.priceMax > product.price && <span className="mr-1 text-xs font-bold">from</span>}
          {money(product.price)}
        </span>
        {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-crimson px-2.5 py-0.5 text-xs font-bold text-paper">−{discount}%</span>}
        {!product.inStock && <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-paper">Sold out</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="eyebrow">{product.vendor} · {product.productType}</p>
        <Link to={`/p/${product.handle}`} className="font-display text-lg font-bold leading-snug hover:underline">{product.title}</Link>
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1" aria-label={`Colours: ${product.colors.join(', ')}`}>
            {product.colors.slice(0, 5).map((c) => <span key={c} title={c} className="h-3.5 w-3.5 rounded-full border border-ink/40" style={{ background: swatch(c) }} />)}
            {product.colors.length > 5 && <span className="text-xs text-muted">+{product.colors.length - 5}</span>}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <Rating value={product.rating} count={product.ratingCount} />
          {hasChoices ? (
            <Link to={`/p/${product.handle}`} className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-3 py-1 text-sm font-semibold hover:bg-yellow">
              {product.variantCount} options
            </Link>
          ) : (
            <button
              onClick={() => add(product.id, 1, product.defaultVariantId).then(() => unicorn('track', 'add_to_cart', { productId: product.id, variantId: product.defaultVariantId, quantity: 1 })).catch((e) => alert(e.message))}
              disabled={!product.inStock}
              className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-paper px-3 py-1 text-sm font-semibold hover:bg-orange disabled:opacity-40"
              aria-label={`Add ${product.title} to bag`}
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
