# MMM-SystemStats

Modern MagicMirror² module to display real-time system stats with low overhead, optimized for Raspberry Pi.

## Features

- CPU usage
- CPU temperature
- RAM usage
- Disk usage
- Uptime
- Clean, readable UI (custom CSS)

## Requirements

- MagicMirror² installed
- Node.js version compatible with your MagicMirror² release
- Linux/Raspberry Pi recommended

## Installation

From your MagicMirror² `modules` directory:

```bash
git clone https://github.com/mysh3ll/MMM-SystemStats.git
cd MMM-SystemStats
npm install
```

## MagicMirror Configuration

Add this block to `config/config.js`:

```js
{
  module: "MMM-SystemStats",
  position: "top_right",
  config: {
    updateInterval: 5000
  }
}
```

## Options

- `updateInterval` (number): refresh interval in milliseconds.  
  Recommended default: `5000`.
- `showIcons` (boolean): show local SVG icons next to metric labels. Default: `true`.
- `iconSize` (number): icon size in pixels. Default: `14`.
- `maxBackoffFactor` (number): max retry multiplier on repeated errors.  
  Example: with `updateInterval: 5000` and `maxBackoffFactor: 8`, retries can back off up to `40000ms`.
- `thresholds` (object): warning/critical thresholds used for metric colors.
  - `cpu`, `temp`, `ram`, `disk`
  - each metric supports `{ warning, critical }`

Example:

```js
{
  module: "MMM-SystemStats",
  position: "top_right",
  config: {
    updateInterval: 5000,
    showIcons: true,
    iconSize: 14,
    maxBackoffFactor: 8,
    thresholds: {
      cpu: { warning: 65, critical: 90 },
      temp: { warning: 70, critical: 85 },
      ram: { warning: 75, critical: 92 },
      disk: { warning: 85, critical: 96 }
    }
  }
}
```

## Development

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm test
```

## Module Structure

```text
MMM-SystemStats/
├── MMM-SystemStats.js
├── MMM-SystemStats.css
├── node_helper.js
├── translations/
├── public/
└── package.json
```

## Short Roadmap

- Add SVG icons
- Add visual thresholds (green/orange/red)
- Improve sensor error handling
