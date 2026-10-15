// Drop-in <img> for product photos that discourages casual saving: blocks
// the right-click / long-press context menu and native image dragging on
// the image itself only. Deterrent, not protection — screenshots, devtools
// and the network tab still work by design. Click/touch events are left
// alone, so parent onClick, swipe and scroll behave exactly as before.
// Inline styles (not classes) so no stylesheet or visual change is needed.

const preventDefault = (e) => e.preventDefault()

/**
 * @param {import('react').ImgHTMLAttributes<HTMLImageElement>} props
 */
export function ProtectedImage({ style, ...props }) {
  return (
    <img
      {...props}
      draggable={false}
      onContextMenu={preventDefault}
      onDragStart={preventDefault}
      style={{
        // iOS Safari: suppress the long-press "Save Image" sheet.
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        ...style,
      }}
    />
  )
}
