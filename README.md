# Comic Book Maker

A Progressive Web Application (PWA) for creating, editing, and sharing digital comic books.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The dev server will start at `http://localhost:5173`

### PWA Features

- **Installable**: Users can install the app to their home screen
- **Offline Support**: Core functionality works without internet
- **Auto-save**: Projects are automatically saved (coming soon)

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **vite-plugin-pwa** - PWA support with Workbox

## Project Structure

```
comic-book-maker/
├── public/              # Static assets & PWA icons
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles (Tailwind)
├── index.html          # HTML template
├── vite.config.js      # Vite + PWA configuration
└── package.json
```

## Next Steps (Phase 1 Roadmap)

1. [ ] Set up IndexedDB with Dexie.js
2. [ ] Implement File System Access API
3. [ ] Build canvas workspace with Fabric.js/Konva.js
4. [ ] Create panel manipulation system
5. [ ] Add image upload and positioning
6. [ ] Implement text tools (bubbles, captions)
7. [ ] Add page management
8. [ ] Export functionality
