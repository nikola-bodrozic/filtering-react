import './ProductCard.css';

interface ProductCardProps {
  title: string;
  price: number;
  description?: string;
  onAddToCart: () => void;
}

export default function ProductCard({
  title,
  price,
  description = '',
  onAddToCart
}: ProductCardProps) {

  return (
    <div className="product-card">
      <div className="image-container">

        <div className="placeholder-image">
          <span>Image placeholder</span>
        </div>

      </div>

      <div className="product-info">
        <h3>{title}</h3>
        {description && <p className="description">{description}</p>}
        <div className="price">${price.toFixed(2)}</div>
        <button
          className="add-to-cart-btn"
          onClick={onAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
