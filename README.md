# Cantina Toniolli — concept "La Valle Verticale"

Concept **non ufficiale** di sito per [Cantina Toniolli](https://www.cantinatoniolli.com/) (Cembra Lisignago, Val di Cembra — Trentino), realizzato a scopo dimostrativo.

La pagina è costruita come un'ascesa: dal fondovalle a 238 m fino alle vigne alte a 905 m. Un altimetro fisso segue lo scroll e indica quota e zona attraversata.

## Sezioni

Preloader con contatore di quota · hero con titolo sfalsato e dezoom · manifesto che si accende parola per parola · La Valle con immagini sticky, contatori e isoipse animate · strip delle stagioni in scorrimento orizzontale · I Baiti in parallax · Le Etichette in scroll orizzontale bloccato (BAIT n.1–4) · La Famiglia con parole in clip-reveal · Visita con marquee reattivo alla velocità di scroll.

## Stack

HTML, CSS e JavaScript puri. GSAP + ScrollTrigger + Lenis da CDN. Fraunces, Archivo e IBM Plex Mono. Nessuna build: si apre servendo la cartella.

```
python3 -m http.server 8028
```

Parametri di debug: `?nosmooth` disattiva lo smooth scroll, `?static` disattiva anche le animazioni in loop.

Rispetta `prefers-reduced-motion`, naviga da tastiera, target touch ≥ 44 px.

## Crediti

Fotografie e testi © Cantina Toniolli, usati per la sola dimostrazione.
Design e sviluppo — Luca Salvemini.
