# TUI Playground

A collection of Terminal UI experiments and prototypes exploring interface design patterns for command-line-inspired web applications.

## Experiments

### 🎯 Storyline Activity Monitor

An interactive activity monitor designed to explore and visualize the sequence of operations and steps performed by a language model.

**Features:**
- Keyboard-driven navigation (Shift+↑/↓ to focus, ←/→ to navigate)
- 13 different visualization styles (from verbose text to color-coded symbols)
- Detailed step inspection with code snippets
- Terminal-first, monospace-compatible design
- Real-time activity simulation

**[Try it live →](https://ahuhmm.github.io/tui-playground/storyline/)**

**Key Design Principles:**
- No emoji icons (CLI-compatible)
- Monospace grid-based layouts
- Color perception psychology (perceptual temperature system)
- Activity categorization (cognitive/operational/system)

## Project Structure

```
tui-playground/
├── index.html              # Main landing page
├── storyline/              # Storyline Activity Monitor experiment
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── variations.html     # Visualization style showcase
│   └── variations.css
└── README.md
```

## Development

This is a static site project. Simply open `index.html` in a browser or serve the directory with any static file server.

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## GitHub Pages

This project is deployed to GitHub Pages: https://ahuhmm.github.io/tui-playground/

## Future Experiments

Stay tuned for more TUI experiments exploring:
- Command palette interfaces
- Log viewers and debuggers
- File tree navigators
- Progress indicators and status displays

## License

MIT
