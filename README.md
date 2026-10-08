# Romière — Forever Guided

Een nieuwe, exclusieve website voor [romiere.nl](https://romiere.nl): dezelfde producten, prijzen, teksten en huiskleuren, in een high-end vormgeving.

## Concept: Maison Romière

Een lichte, redactionele vormgeving in de stijl van grote juweliershuizen: witte, crème en zandkleurige secties, sieraden in boogvormige "vitrines", Bodoni-typografie op modeformaat, wijnrood en goud als accent, en ingetogen beweging. Er zijn bewust geen donkere achtergronden.

- **Openingsanimatie** – bij het eerste bezoek wordt het wijnrode logo op crème "getekend"; daarna opent het doek. Tussen pagina's schuift een zandkleurig doek voorbij.
- **Home** – *Forever Guided* rond een boogvormig beeld met wisselende campagnefoto's (de letters wisselen van kleur waar ze over de foto lopen), een manifest dat woord voor woord oplicht tijdens het scrollen, de collectie die horizontaal voorbijschuift, *The meaning collection* (de betekenis achter Florea, Éclat en Amour Rouge), een categorie-index met meebewegende beelden, het Romière-ritueel, een statement en een polaroid-wand *Seen on you*.
- **Collection** (`shop.html#…`) – filters (New in, Bestsellers, Necklaces, Bracelets, Earrings, Sets), sortering en redactionele tegels.
- **Product** (`product.html#<slug>`) – galerij met zoom, een vastgezet paneel met finish-keuze (goud/zilver) en winkeltas, details & verzorging, de betekenis van het sieraad en bijpassende pieces.
- **Story** – vijf hoofdstukken (Chapitre I–V): Forever Guided, Not just a trend, Every detail has a meaning, Craftsmanship & materials, The Signature Edit.
- **Client care** (`contact.html`) – contactformulier (opent een e-mail aan info@romiere.nl), FAQ, verzending en retourbeleid.
- **Overal** – volledig scherm menu met beelden, zoeken, winkeltas met teller tot gratis verzending, eigen cursor op desktop en een footer met het logo op volle breedte.

Respecteert `prefers-reduced-motion`: animaties en scroll-effecten worden dan uitgeschakeld.

## Huisstijl

Kleuren van de huidige site: wijnrood `#510000`, ink `#1d1a18`, crème `#f7f3ee`, zand `#e7ddd2`, goud `#a68159`. Logo in `assets/img/brand/` (transparant, wijnrood en wit). Typografie: Bodoni Moda (titels) en Manrope (tekst), via Google Fonts.

## Producten

`assets/js/catalog.js` bevat de 31 producten uit de huidige webshop (naam, prijs, voorraad, categorieën, goud/zilver-opties, beschrijving, details en betekenis). Productfoto's staan als WebP in `assets/img/products/` (600 px en 1200 px); campagnebeelden en polaroids in `assets/img/editorial/`.

## Lokaal bekijken

Het is een statische site zonder build-stap:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Nog te koppelen voor livegang

- **Checkout** – de winkeltas werkt volledig, maar afrekenen moet nog aan de betaalomgeving (bijv. WooCommerce) gekoppeld worden. Zet daarvoor `checkoutUrl` in `CONFIG` bovenin `assets/js/main.js`.
- **Nieuwsbrief** – het formulier toont nu alleen een bedankmelding; koppel het aan je mailingtool (bijv. Klaviyo of Mailchimp).
