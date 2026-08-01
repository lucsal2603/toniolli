# Cantina Toniolli — concept "La Valle Verticale"

Concept **non ufficiale** di sito per [Cantina Toniolli](https://www.cantinatoniolli.com/) (Cembra Lisignago, Val di Cembra — Trentino), realizzato a scopo dimostrativo.

La pagina è costruita come un'ascesa: dal fondovalle a 238 m fino alle vigne alte a 905 m. Un altimetro fisso segue lo scroll e indica quota e zona attraversata.

## Sezioni

Preloader con contatore di quota · hero con titolo sfalsato e dezoom · manifesto che si accende parola per parola · La Valle con immagini sticky, contatori e curve di livello animate · le quattro stagioni della vigna in scorrimento orizzontale · il metodo di lavoro · I Baiti e la griglia che lega ogni bait alla sua vigna · Le Etichette in scroll orizzontale bloccato con scheda tecnica per ogni vino · La Famiglia · la linea del tempo della valle · visite, contatti e mappa.

Sotto tutto scorre un livello animato: pulviscolo dorato su hero e famiglia, bollicine dietro il metodo classico, aloni che respirano dietro i titoli, parallasse e Ken Burns sulle fotografie.

## Stack

HTML, CSS e JavaScript puri. GSAP + ScrollTrigger + Lenis da CDN. Erode e Cabinet Grotesk (Fontshare) con Space Mono per le letture strumentali. Nessuna build: si apre servendo la cartella.

```
python3 -m http.server 8028
```

Parametri di debug: `?nosmooth` disattiva lo smooth scroll, `?static` disattiva anche le animazioni in loop.

Rispetta `prefers-reduced-motion`, naviga da tastiera, target touch ≥ 44 px.

## Contenuti

Buona parte dei testi di dettaglio e tutti i dati tecnici dei vini sono **materiale di riempimento**, scritto per rendere il concept presentabile. L'elenco completo di ciò che va confermato con la cantina è in [DA-VERIFICARE.md](DA-VERIFICARE.md): leggerlo prima di mostrare il sito a chiunque.

## Crediti

Le sottolineature animate dei link sono un port in CSS puro di **skiper40** di [Skiper UI](https://skiper-ui.com) (@gurvinder-singh02), rilasciato per uso libero con attribuzione. Il componente originale è React e Tailwind: qui è stato riscritto perché il sito non usa framework.

Fotografie e testi originali © Cantina Toniolli, usati per la sola dimostrazione.
Design e sviluppo — Luca Salvemini.
