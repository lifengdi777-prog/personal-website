import { Minus, Square, X } from 'lucide-react';
import { useRef, useState } from 'react';

const MIN_WIDTH = 260;
const MIN_HEIGHT = 140;

export default function RetroWindow({ title, children, initialPosition, zIndex, onClose, onMinimize, onFocus }) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(null);
  const [maximized, setMaximized] = useState(false);
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const toggleMaximize = () => setMaximized((value) => !value);

  const startDrag = (event) => {
    if (event.button !== 0 || maximized) return;

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

  const startResize = (event) => {
    if (event.button !== 0 || maximized) return;

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = windowRef.current.getBoundingClientRect();
    resizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
    };
    onFocus();
  };

  const moveResize = (event) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;

    const maxWidth = window.innerWidth - position.x - 8;
    const maxHeight = window.innerHeight - position.y - 8;
    const nextWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, resize.width + event.clientX - resize.startX));
    const nextHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, resize.height + event.clientY - resize.startY));
    setSize({ width: nextWidth, height: nextHeight });
  };

  const stopResize = (event) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;

    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // Stop control-button presses from also starting a window drag.
  const stopControlDrag = (event) => event.stopPropagation();

  const sized = size && !maximized;
  const style = { zIndex };
  if (!maximized) {
    style.transform = `translate(${position.x}px, ${position.y}px)`;
  }
  if (sized) {
    style.width = `${size.width}px`;
    style.height = `${size.height}px`;
  }

  return (
    <section
      ref={windowRef}
      className={`retro-window${maximized ? ' retro-window--maximized' : ''}${sized ? ' retro-window--sized' : ''}`}
      style={style}
      onPointerDown={onFocus}
    >
      <header
        className="retro-window__titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={toggleMaximize}
      >
        <span>{title}</span>
        <div className="retro-window__controls">
          <button type="button" onPointerDown={stopControlDrag} onClick={onMinimize} title="Minimize">
            <Minus size={13} />
          </button>
          <button
            type="button"
            onPointerDown={stopControlDrag}
            onClick={toggleMaximize}
            title={maximized ? 'Restore' : 'Maximize'}
          >
            <Square size={12} />
          </button>
          <button type="button" onPointerDown={stopControlDrag} onClick={onClose} title="Close">
            <X size={13} />
          </button>
        </div>
      </header>
      <div className="retro-window__body">{children}</div>
      {!maximized && (
        <div
          className="retro-window__resize"
          title="Resize"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
        />
      )}
    </section>
  );
}
