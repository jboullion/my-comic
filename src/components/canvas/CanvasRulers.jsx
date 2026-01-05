import { useMemo } from 'react'

/**
 * CanvasRulers Component
 *
 * L-shaped rulers on top and left of the canvas viewport.
 * Shows page coordinates that update with zoom and pan.
 */

const RULER_SIZE = 20

/**
 * Get tick interval based on zoom level
 */
function getTickInterval(zoom) {
  if (zoom >= 4) return 10
  if (zoom >= 2) return 20
  if (zoom >= 1) return 50
  if (zoom >= 0.5) return 100
  if (zoom >= 0.25) return 200
  return 500
}

/**
 * Generate tick marks for a ruler
 */
function generateTicks(start, end, interval, isMajor = false) {
  const ticks = []
  // Round start down to nearest interval
  const firstTick = Math.floor(start / interval) * interval

  for (let value = firstTick; value <= end; value += interval) {
    if (value >= start) {
      ticks.push({
        value,
        isMajor: isMajor || value % (interval * 5) === 0
      })
    }
  }
  return ticks
}

export default function CanvasRulers({
  zoom,
  panOffset,
  pageWidth,
  pageHeight,
  containerWidth,
  containerHeight,
  gridSize
}) {
  // Calculate ruler offset to account for ruler size
  const rulerOffset = RULER_SIZE

  // Calculate visible page range in page coordinates
  const visibleRange = useMemo(() => {
    // Viewport to page coordinate conversion
    const viewportToPageX = (vx) => (vx - panOffset.x - rulerOffset) / zoom
    const viewportToPageY = (vy) => (vy - panOffset.y - rulerOffset) / zoom

    return {
      startX: viewportToPageX(rulerOffset),
      endX: viewportToPageX(containerWidth),
      startY: viewportToPageY(rulerOffset),
      endY: viewportToPageY(containerHeight)
    }
  }, [zoom, panOffset.x, panOffset.y, containerWidth, containerHeight, rulerOffset])

  // Get tick interval based on zoom
  const tickInterval = useMemo(() => getTickInterval(zoom), [zoom])

  // Generate horizontal ticks (X axis)
  const horizontalTicks = useMemo(() => {
    return generateTicks(visibleRange.startX, visibleRange.endX, tickInterval)
  }, [visibleRange.startX, visibleRange.endX, tickInterval])

  // Generate vertical ticks (Y axis)
  const verticalTicks = useMemo(() => {
    return generateTicks(visibleRange.startY, visibleRange.endY, tickInterval)
  }, [visibleRange.startY, visibleRange.endY, tickInterval])

  // Convert page coordinate to viewport position
  const pageToViewportX = (pageX) => pageX * zoom + panOffset.x + rulerOffset
  const pageToViewportY = (pageY) => pageY * zoom + panOffset.y + rulerOffset

  return (
    <>
      {/* Corner box */}
      <div
        className="absolute top-0 left-0 bg-slate-800 z-50"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />

      {/* Horizontal ruler (top) */}
      <div
        className="absolute top-0 bg-slate-800 overflow-hidden z-40"
        style={{
          left: RULER_SIZE,
          height: RULER_SIZE,
          width: Math.max(0, containerWidth - RULER_SIZE)
        }}
      >
        <svg
          width={Math.max(0, containerWidth - RULER_SIZE)}
          height={RULER_SIZE}
          className="text-slate-400"
        >
          {/* Page bounds indicator */}
          {pageToViewportX(0) >= RULER_SIZE && pageToViewportX(0) <= containerWidth && (
            <line
              x1={pageToViewportX(0) - RULER_SIZE}
              y1={0}
              x2={pageToViewportX(0) - RULER_SIZE}
              y2={RULER_SIZE}
              stroke="#4c69f6"
              strokeWidth={1}
            />
          )}
          {pageToViewportX(pageWidth) >= RULER_SIZE && pageToViewportX(pageWidth) <= containerWidth && (
            <line
              x1={pageToViewportX(pageWidth) - RULER_SIZE}
              y1={0}
              x2={pageToViewportX(pageWidth) - RULER_SIZE}
              y2={RULER_SIZE}
              stroke="#4c69f6"
              strokeWidth={1}
            />
          )}

          {/* Tick marks and labels */}
          {horizontalTicks.map(({ value, isMajor }) => {
            const x = pageToViewportX(value) - RULER_SIZE
            if (x < 0 || x > containerWidth - RULER_SIZE) return null

            const tickHeight = isMajor ? 12 : 6

            return (
              <g key={`h-${value}`}>
                <line
                  x1={x}
                  y1={RULER_SIZE - tickHeight}
                  x2={x}
                  y2={RULER_SIZE}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                {isMajor && (
                  <text
                    x={x + 2}
                    y={10}
                    fontSize={9}
                    fill="currentColor"
                  >
                    {value}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Vertical ruler (left) */}
      <div
        className="absolute left-0 bg-slate-800 overflow-hidden z-40"
        style={{
          top: RULER_SIZE,
          width: RULER_SIZE,
          height: Math.max(0, containerHeight - RULER_SIZE)
        }}
      >
        <svg
          width={RULER_SIZE}
          height={Math.max(0, containerHeight - RULER_SIZE)}
          className="text-slate-400"
        >
          {/* Page bounds indicator */}
          {pageToViewportY(0) >= RULER_SIZE && pageToViewportY(0) <= containerHeight && (
            <line
              x1={0}
              y1={pageToViewportY(0) - RULER_SIZE}
              x2={RULER_SIZE}
              y2={pageToViewportY(0) - RULER_SIZE}
              stroke="#4c69f6"
              strokeWidth={1}
            />
          )}
          {pageToViewportY(pageHeight) >= RULER_SIZE && pageToViewportY(pageHeight) <= containerHeight && (
            <line
              x1={0}
              y1={pageToViewportY(pageHeight) - RULER_SIZE}
              x2={RULER_SIZE}
              y2={pageToViewportY(pageHeight) - RULER_SIZE}
              stroke="#4c69f6"
              strokeWidth={1}
            />
          )}

          {/* Tick marks and labels */}
          {verticalTicks.map(({ value, isMajor }) => {
            const y = pageToViewportY(value) - RULER_SIZE
            if (y < 0 || y > containerHeight - RULER_SIZE) return null

            const tickWidth = isMajor ? 12 : 6

            return (
              <g key={`v-${value}`}>
                <line
                  x1={RULER_SIZE - tickWidth}
                  y1={y}
                  x2={RULER_SIZE}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                {isMajor && (
                  <text
                    x={2}
                    y={y + 10}
                    fontSize={9}
                    fill="currentColor"
                  >
                    {value}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </>
  )
}
