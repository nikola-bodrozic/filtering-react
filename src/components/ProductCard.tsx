import { useState } from "react";
import "./ProductCard.css";

interface ProductCardProps {
  title: string;
  price?: {
    unit_amount: number;
    currency: string;
  };
  description?: string;
}

export default function ProductCard({
  title,
  price,
  description = "",
}: ProductCardProps) {
  const [show, setShow] = useState(true);
  const [numItems, setNumItems] = useState(0);
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const { name, id } = event.currentTarget;
    console.log(`${name}, ${id}`);
    setNumItems(1);
    setShow(!show);
  }
  function inc() {
    setNumItems((prev) => prev + 1);
  }
  function dec() {
    if (numItems > 1) setNumItems((prev) => prev - 1);
    else {
      setShow(true);
      setNumItems(0);
    }
  }
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
        <div className="price">
          {price?.currency} {price?.unit_amount.toFixed(2)}
        </div>
        {show ? (
          <button
            name="atc"
            id="cartButton"
            className="add-to-cart-btn"
            onClick={handleClick}
          >
            Add to Cart
          </button>
        ) : (
          <>
            {numItems === 1 ? (
              <button onClick={dec}>🗑️</button>
            ) : (
              <button onClick={dec}>-</button>
            )}
            {numItems}
            <button onClick={inc}>+</button>
          </>
        )}
      </div>
      {numItems === 0 ? (
        <>{""}</>
      ) : (
        <button
          onClick={() => {
            alert(numItems);
          }}
        >
          Checkout
        </button>
      )}
    </div>
  );
}
