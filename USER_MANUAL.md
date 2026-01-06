# Comic Book Maker - User Manual

A guide to creating digital comics with the Comic Book Maker app.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Projects](#projects)
3. [Pages](#pages)
4. [Canvas Navigation](#canvas-navigation)
5. [Adding Elements](#adding-elements)
6. [Selecting Elements](#selecting-elements)
7. [Transforming Elements](#transforming-elements)
8. [Element Properties](#element-properties)
9. [Layer Order](#layer-order)
10. [Asset Management](#asset-management)
11. [Exporting](#exporting)
12. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Getting Started

Comic Book Maker is a browser-based application for creating digital comic books. All your work is saved locally in your browser - no account required.

### Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No installation needed - runs entirely in your browser

---

## Projects

### Creating a New Project

1. From the **Projects** page, click the **New Project** button
2. Enter a title for your project
3. Click **Create** to open the editor

### Opening a Project

- **From the project list:** Click on any project card to open it
- **From a file:** Use **Open Project** to load a `.mycomic` file

### Saving Projects

Your work is **automatically saved** as you make changes. You'll see a "Saving..." indicator that changes to "Saved" when complete.

- **Manual save:** Press `Ctrl+S` (or `Cmd+S` on Mac)
- **Save as file:** Click the **Save As** button to download a `.mycomic` file you can share or backup

### Project Settings

Click the **Settings** button (gear icon) to configure project defaults:

- **Page Settings:** Default dimensions and background color
- **Text Defaults:** Font, size, color for new text elements
- **Speech Bubble Defaults:** Style, colors, fonts for new bubbles
- **Text Effect Defaults:** Styling for POW!/BAM! effects

Choose **Save** to update defaults for new elements only, or **Apply to All Pages** to update existing pages too.

---

## Pages

### Page Navigation

The left sidebar shows thumbnails of all pages. Click a thumbnail to switch to that page.

### Adding Pages

Click the **+** button at the bottom of the page list to add a new page. New pages inherit your project's default settings.

### Deleting Pages

Select a page and use the delete option to remove it. Projects must have at least one page.

### Per-Page Settings

Each page can have its own settings that override project defaults:

1. Go to the **Page** tab in the right sidebar
2. Adjust **Width/Height** or use a preset:
   - Standard Comic (800x1200)
   - Manga (600x900)
   - Square (1000x1000)
3. Set **Background Color** or enable **Transparent** background

---

## Canvas Navigation

### Zooming

- **Mouse wheel:** Scroll up to zoom in, down to zoom out
- **Faster zoom:** Hold `Ctrl` while scrolling
- **Zoom controls:** Use the floating buttons at bottom-center
- **Fit to screen:** Click the fit button to auto-size the page
- **Reset to 100%:** Click the percentage display

### Panning

- **Middle mouse button:** Click and drag to pan
- **Spacebar:** Hold Space and drag to pan
- Release to return to normal mode

### Grid and Rulers

Toggle these in the **Page** tab of the right sidebar:

- **Show Rulers:** Display measurement rulers along top and left edges
- **Show Grid:** Display grid lines over the canvas
- **Snap to Grid:** Elements snap to grid intersections when moved
- **Grid Size:** Adjust the grid spacing (default: 20px)

---

## Adding Elements

### Images

- **Upload button:** Click the image icon in the toolbar and select files
- **Drag and drop:** Drop image files directly onto the canvas
- **From assets:** Drag an image from the Assets tab to the canvas

### Speech Bubbles

1. Click the **Speech Bubble** button (B) in the toolbar
2. A bubble appears at the center of the canvas
3. Double-click to edit the text inside

### Text Elements

1. Click the **Text** button (T) in the toolbar
2. A text box appears at the center
3. Double-click to edit the text

### Text Effects

1. Click the **Text Effect** button (E) in the toolbar
2. A comic-style effect (POW!) appears
3. Customize the text and styling in the Properties panel

---

## Selecting Elements

### Single Selection

Click on any element to select it. Selected elements show blue handles.

### Multi-Selection

- **Ctrl+Click** (Cmd+Click on Mac): Toggle an element in/out of the selection
- **Shift+Click:** Add an element to the current selection

### Deselecting

Click on empty canvas space to deselect all elements.

### Selection Indicators

- **Primary selection** (first selected): Shows resize and rotate handles
- **Secondary selections** (additional): Shows dashed border outline

---

## Transforming Elements

### Moving

- **Drag:** Click and drag any selected element
- **Multi-move:** When multiple elements are selected, dragging one moves all of them together
- **Nudge:** Use arrow keys to move by 1px, or Shift+arrows for 10px

### Resizing

Drag the corner or edge handles to resize. For images, use the **Lock Aspect Ratio** option to maintain proportions.

### Rotating

Drag the circular handle above the element to rotate. Hold `Shift` while rotating to snap to 15-degree increments.

---

## Element Properties

Select an element to see its properties in the right sidebar **Properties** tab.

### Common Properties (All Elements)

- **Position:** X and Y coordinates
- **Size:** Width and height
- **Rotation:** Angle in degrees
- **Opacity:** Transparency (0-100%)

### Image Properties

- **Border:** Color and width
- **Corner Radius:** Roundness percentage
- **Corner Shape:** Round, Bevel, Notch, Scoop, or Squircle
- **Lock Aspect Ratio:** Maintain proportions when resizing

### Speech Bubble Properties

- **Text:** Content, font, size, color, alignment
- **Bubble Style:** Round or Cloud
- **Fill Color:** Background color
- **Stroke:** Border color and width
- **Corner Radius:** Roundness of corners

### Text Properties

- **Font:** Choose from Google Fonts
- **Size, Weight, Color**
- **Text Stroke:** Outline color and width
- **Alignment:** Left, center, or right

### Text Effect Properties

- **Text:** The effect text (e.g., POW!, BAM!)
- **Fill Color:** Main text color
- **Stroke:** Primary outline
- **Outer Stroke:** Secondary outline for extra pop
- **Effect Type:** None, Bend, or Perspective
- **Bend/Skew:** Adjust the curve or angle

### Multi-Selection Properties

When multiple elements are selected, the Properties panel shows shared properties:
- **Opacity:** Affects all selected elements
- **Font Size:** (If all are text-based elements)

Properties showing "Mixed" indicate different values across the selection.

---

## Layer Order

Elements stack on top of each other. Control the order with:

### Context Menu (Right-Click)

- **Bring to Front:** Move to the top
- **Bring Forward:** Move up one layer
- **Send Backward:** Move down one layer
- **Send to Back:** Move to the bottom

---

## Asset Management

### Assets Tab

The right sidebar **Assets** tab shows all imported images.

### Importing Images

- Drag image files into the Assets panel
- Or use the upload button in the toolbar

### Using Assets

- **Drag to canvas:** Drop an asset directly where you want it
- **Double-click:** Add to the center of the canvas
- **Click:** Select to view asset properties

### Asset Properties

When an asset is selected:
- View thumbnail and name
- Add to canvas button

---

## Exporting

### Export All Pages

1. Click the **Export** button in the header
2. Choose a format:
   - **WebP** (recommended): Best quality-to-size ratio
   - **PNG:** Lossless, larger files
   - **JPEG:** Smallest files, slight quality loss
3. Click **Export**
4. A ZIP file downloads containing all pages as numbered images

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl+S` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Shift+Z` or `Ctrl+Y` |
| Delete selection | `Delete` or `Backspace` |
| Nudge 1px | Arrow keys |
| Nudge 10px | `Shift` + Arrow keys |
| Pan canvas | `Space` + Drag |
| Zoom | Mouse wheel |
| Fast zoom | `Ctrl` + Mouse wheel |
| Select tool | `V` |
| Add text | `T` |
| Add speech bubble | `B` |
| Add text effect | `E` |
| Toggle selection | `Ctrl+Click` |
| Add to selection | `Shift+Click` |

---

## Tips

- **Double-click** text elements and speech bubbles to edit text inline
- **Hold Shift** while rotating to snap to 15-degree angles
- Use **Snap to Grid** for precise alignment
- **Ctrl+Click** to quickly toggle elements in and out of multi-selection
- The **primary element** (first selected) controls resize/rotate for the group
