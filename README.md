# Premium Shoes EG

Front-end ecommerce website for Premium Shoes EG, an Egypt-based original outlet sneaker store. The current launch focus is Adidas Samba outlet drops, with the structure prepared for future outlet products.

## Purpose

The website presents available outlet shoes, upcoming drops, product details, cart/wishlist features, and a cash-on-delivery checkout flow. It is built as a static front-end project for client presentation and can later be connected to Firebase for products, orders, and an admin dashboard.

## Main Features

- Homepage with original outlet positioning and Samba-focused carousel.
- Products page for available Samba pairs and upcoming outlet drops.
- Product detail page with gallery images, size/color options, quantity selection, and add-to-cart.
- Cart sidebar with item quantities and localStorage persistence.
- Wishlist sidebar with saved items.
- Checkout page with customer details, order review, cash-on-delivery confirmation, and EmailJS order email.
- Contact page with EmailJS contact form and WhatsApp link.
- Responsive navigation, mobile menu, and dark/light mode saved in localStorage.
- Basic SEO metadata and social preview tags.

## Project Structure

```text
assets/images/       Product, banner, and intro images
css/                 Page and global styles
data/products.json   Product catalog data
js/                  Shared and page-specific JavaScript
pages/               Products, detail, checkout, about, and contact pages
index.html           Homepage
```

## How To Run

Because the site loads `data/products.json` with `fetch`, open it through a local web server instead of double-clicking `index.html`.

Example:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

If using VS Code, the Live Server extension also works.

## Client Editing Notes

- Product data is stored in `data/products.json`.
- Samba product images are stored under `assets/images/black-white`, `white-black`, `creamy-green`, and `navy-gum`.
- Coming soon products should be marked with `isComingSoon: true`.
- Available products should have `isInStock: true`.
- Homepage Samba cards are selected from products with `homeDrop: true`.

## Future Improvements

- Connect Firebase for product management, order storage, and dashboard features.
- Add admin controls for stock, prices, and order status.
- Add deployed production URL and custom domain.
- Compress large images before final hosting.
- Add final QA screenshots for desktop, tablet, and mobile.

