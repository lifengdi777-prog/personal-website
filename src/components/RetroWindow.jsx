import { Minus, Square, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function RetroWindow({ title, children, initialPosition, zIndex, onClose, onMinimize, onFocus }) {
  const [position, setPosition] = useState(initialPosition);
  const dragRef = useRef(null);

  const startDrag = (event) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: position.x,
      top: position.y,
    };
    onFocus();
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const nextX = Math.max(8, Math.min(window.innerWidth - 220, drag.left + event.clientX - drag.startX));
    const nextY = Math.max(8, Math.min(window.innerHeight - 150, drag.top + event.clientY - drag.startY));
    setPosition({ x: nextX, y: nextY });
  };

  const stopDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section
      className="retro-window"
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, zIndex }}
      onPointerDown={onFocus}
    >
      <header
        className="retro-window__titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <span>{title}</span>
        <div className="retro-window__controls">
          <button type="button" onClick={onMinimize} title="Minimize">
            <Minus size={13} />
          </button>
          <button type="button" title="Maximize">
            <Square size={12} />
          </button>
          <button type="button" onClick={onClose} title="Close">
            <X size={13} />
          </button>
        </div>
      </header>
      <div className="retro-window__body">{children}</div>
    </section>
  );
}