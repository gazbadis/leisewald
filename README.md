# 🌲 Leisewald

Eine moderne, kinderfreundliche Ruhe-App für Klassenräume. Je leiser die Klasse ist, desto mehr Tiere erscheinen im Wald.

## Features

- 🎙️ Mikrofonzugriff zur Live-Lautstärkemessung
- 🌳 Ruhiger animierter Wald-Hintergrund
- 🐦🦋🦌 Tiere erscheinen bei Ruhe und verschwinden bei Lärm
- ⚙️ Einstellbarer Lautstärke-Schwellenwert
- 🖥️ Vollbildmodus für Beamer und Smartboards
- 📱 Responsives Layout für verschiedene Bildschirmgrößen
- 🔒 Läuft komplett lokal im Browser (kein Backend)

## Technik

- React + Vite
- HTML, CSS, JavaScript
- Audioanalyse via Web Audio API

## Startanleitung

### Voraussetzungen

- Node.js 18+ (empfohlen: aktuelle LTS)

### Installation & Start

```bash
npm install
npm run dev
```

Dann im Browser öffnen (normalerweise):

- `http://localhost:5173`

### Produktions-Build

```bash
npm run build
npm run preview
```

## Hinweise für den Unterricht

- Beim ersten Start nach Mikrofonfreigabe fragen lassen.
- Den Schwellenwert je nach Raumlautstärke kalibrieren.
- Für den Einsatz im Klassenzimmer den Vollbildmodus aktivieren.
