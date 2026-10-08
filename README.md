# Romière — Forever Guided

Een nieuwe, exclusieve website voor [romiere.nl](https://romiere.nl): dezelfde producten, prijzen, teksten en huiskleuren, in een high-end vormgeving.

## Pagina's

| Bestand | Inhoud |
| --- | --- |
| `index.html` | Homepage: hero, bestsellers, The Signature Edit, categorieën, statement, new in, gifting, materialen, Instagram, USP's |
| `shop.html` | Collectie met filters (`?c=new-in`, `bestsellers`, `necklaces`, `bracelets`, `earrings`, `sets`) en sortering |
| `product.html?p=<slug>` | Productpagina: galerij met lightbox, finish-keuze (goud/zilver), aantal, winkeltas, details, betekenis, gerelateerde producten |
| `story.html` | The Romière Story, Craftsmanship & materials, The Signature Edit |
| `contact.html` | Contactformulier (opent een e-mail aan info@romiere.nl), FAQ, verzending en retourbeleid |

Header, menu's, zoekfunctie, winkeltas (bewaard in de browser), nieuwsbrief en footer worden gedeeld via `assets/js/main.js`.

## Huisstijl

Kleuren van de huidige site: wijnrood `#510000`, ink `#1d1a18`, crème `#f7f3ee`, zand `#e7ddd2`, goud `#a68159`. Het logo staat in `assets/img/brand/` (transparant, in wijnrood en wit). Typografie: Cormorant Garamond (titels) en Jost (tekst), via Google Fonts.

## Producten

`assets/js/catalog.js` bevat de 31 producten uit de huidige webshop (naam, prijs, voorraad, categorieën, goud/zilver-opties, beschrijving, details en betekenis). Productfoto's staan als WebP in `assets/img/products/` (600 px en 1200 px).

## Lokaal bekijken

Het is een statische site zonder build-stap:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Nog te koppelen voor livegang

- **Checkout** – de winkeltas werkt volledig, maar afrekenen moet nog aan de betaalomgeving (bijv. WooCommerce) gekoppeld worden. Zet daarvoor `checkoutUrl` in `CONFIG` bovenin `assets/js/main.js`.
- **Nieuwsbrief** – het formulier toont nu alleen een bedankmelding; koppel het aan je mailingtool (bijv. Klaviyo of Mailchimp).
