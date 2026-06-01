import { FolderKanban, Mail, MonitorCog, TerminalSquare, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import DesktopIcon from './DesktopIcon.jsx';
import RetroWindow from './RetroWindow.jsx';
import Taskbar from './Taskbar.jsx';

const WINDOW_DEFS = {
  about: {
    title: 'About Me',
    icon: UserRound,
    position: { x: 88, y: 76 },
    content: (
      <div className="window-copy">
        <h2>Welcome</h2>
        <p>This is the personal site shell. Replace this text with your bio, current focus, and the kind of work you want visitors to remember.</p>
        <dl>
          <div><dt>Status</dt><dd>Available for creative web projects</dd></div>
          <div><dt>Stack</dt><dd>React, Three.js, interactive interfaces</dd></div>
          <div><dt>Mode</dt><dd>Retro system, modern frontend</dd></div>
        </dl>
      </div>
    ),
  },
  projects: {
    title: 'Projects',
    icon: FolderKanban,
    position: { x: 172, y: 128 },
    content: (
      <div className="project-grid">
        <article><strong>CRT Portfolio</strong><span>3D entry scene with retro desktop UI.</span></article>
        <article><strong>Interactive Lab</strong><span>Space for experiments, prototypes, and visual tools.</span></article>
        <article><strong>Case Studies</strong><span>Write process notes and link polished work here.</span></article>
      </div>
    ),
  },
  terminal: {
    title: 'Terminal',
    icon: TerminalSquare,
    position: { x: 270, y: 90 },
    content: (
      <div className="terminal-window">
        <p>C:\PORTFOLIO&gt; run intro.exe</p>
        <p>Loading profile... OK</p>
        <p>Rendering projects... OK</p>
        <p className="terminal-cursor">Awaiting visitor input</p>
      </div>
    ),
  },
  contact: {
    title: 'Contact',
    icon: Mail,
    position: { x: 360, y: 168 },
    content: (
      <div className="window-copy">
        <h2>Contact</h2>
        <p>Add your email, GitHub, LinkedIn, or a contact form here. The window is already wired into the desktop system.</p>
        <button className="retro-action" type="button">Open Mail Client</button>
      </div>
    ),
  },
};

export default function RetroDesktop({ onExit }) {
  const [openWindows, setOpenWindows] = useState(['about']);
  const [minimized, setMinimized] = useState([]);
  const [activeWindow, setActiveWindow] = useState('about');
  const [startOpen, setStartOpen] = useState(false);
  const [zOrder, setZOrder] = useState(['about']);

  const iconList = useMemo(
    () => [
      ['about', WINDOW_DEFS.about],
      ['projects', WINDOW_DEFS.projects],
      ['terminal', WINDOW_DEFS.terminal],
      ['contact', WINDOW_DEFS.contact],
    ],
    [],
  );

  const focusWindow = (id) => {
    setActiveWindow(id);
    setZOrder((current) => [...current.filter((item) => item !== id), id]);
  };

  const openWindow = (id) => {
    setOpenWindows((current) => (current.includes(id) ? current : [...current, id]));
    setMinimized((current) => current.filter((item) => item !== id));
    setStartOpen(false);
    focusWindow(id);
  };

  const closeWindow = (id) => {
    setOpenWindows((current) => current.filter((item) => item !== id));
    setMinimized((current) => current.filter((item) => item !== id));
    setZOrder((current) => current.filter((item) => item !== id));
    if (activeWindow === id) setActiveWindow(null);
  };

  const minimizeWindow = (id) => {
    setMinimized((current) => (current.includes(id) ? current : [...current, id]));
    if (activeWindow === id) setActiveWindow(null);
  };

  const visibleWindows = openWindows.filter((id) => !minimized.includes(id));
  const taskbarWindows = openWindows.map((id) => ({ id, title: WINDOW_DEFS[id].title }));

  return (
    <section className="retro-desktop" aria-label="Retro Windows desktop">
      <div className="desktop-grid">
        {iconList.map(([id, item]) => (
          <DesktopIcon key={id} icon={item.icon} label={item.title} onOpen={() => openWindow(id)} />
        ))}
        <DesktopIcon icon={MonitorCog} label="My Computer" onOpen={() => openWindow('about')} />
      </div>

      {visibleWindows.map((id) => {
        const windowDef = WINDOW_DEFS[id];
        const orderIndex = zOrder.indexOf(id);
        return (
          <RetroWindow
            key={id}
            title={windowDef.title}
            initialPosition={windowDef.position}
            zIndex={20 + Math.max(orderIndex, 0)}
            onFocus={() => focusWindow(id)}
            onClose={() => closeWindow(id)}
            onMinimize={() => minimizeWindow(id)}
          >
            {windowDef.content}
          </RetroWindow>
        );
      })}

      <Taskbar
        windows={taskbarWindows}
        activeWindow={activeWindow}
        startOpen={startOpen}
        onToggleStart={() => setStartOpen((value) => !value)}
        onRestore={openWindow}
        onExit={onExit}
      />
    </section>
  );
}