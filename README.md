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
├── node_helper.js
├── styles/main.css
├── public/
└── package.json
```

## Short Roadmap

- Add SVG icons
- Add visual thresholds (green/orange/red)
- Improve sensor error handling
