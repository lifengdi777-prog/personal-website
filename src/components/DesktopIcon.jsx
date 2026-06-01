export default function DesktopIcon({ icon: Icon, label, onOpen }) {
  return (
    <button className="desktop-icon" type="button" onDoubleClick={onOpen} onClick={onOpen} title={label}>
      <span className="desktop-icon__glyph">
        <Icon size={30} strokeWidth={1.8} />
      </span>
      <span className="desktop-icon__label">{label}</span>
    </button>
  );
}