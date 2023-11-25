import React, { useState } from 'react';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { HEADINGS_REQUESTED, HEADING_PRESSED, LINKS_REQUESTED } from '@root/src/shared/constants';
import { HeadingsList, LinksList } from '@root/src/shared/types';

const modes = ['HEADINGS', 'LINKS'] as const;

const Popup = () => {
  const [mode, setMode] = React.useState<(typeof modes)[number]>('LINKS');

  React.useEffect(() => {
    // cycle modes by clciking left or right arrow
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const currentIndex = modes.indexOf(mode);
        const nextIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
        setMode(modes[nextIndex]);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = modes.indexOf(mode);
        const nextIndex = currentIndex === modes.length - 1 ? 0 : currentIndex + 1;
        setMode(modes[nextIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode]);

  return (
    <div className="App">
      {mode === 'HEADINGS' && <Headings />}
      {mode === 'LINKS' && <Links />}
    </div>
  );
};

function Headings() {
  const [headings, setHeadings] = React.useState<HeadingsList>([]);

  async function onHeadingPressed(id: string) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await chrome.tabs.sendMessage(tab.id, {
      type: HEADING_PRESSED,
      payload: {
        id,
      },
    });
    window.close();
  }

  React.useEffect(() => {
    async function postMessage() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { type: HEADINGS_REQUESTED });
      setHeadings(response);
    }

    postMessage();
  }, []);

  React.useEffect(() => {
    if (headings.length === 0) return;

    const firstHeading = document.querySelector('button');
    if (firstHeading) firstHeading.focus();
  }, [headings]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentHeading = document.activeElement as HTMLButtonElement;
        const nextHeading = currentHeading.parentElement?.nextElementSibling?.querySelector('button');
        if (nextHeading) nextHeading.focus();
        if (!nextHeading) document.querySelector('button')?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentHeading = document.activeElement as HTMLButtonElement;
        const nextHeading = currentHeading.parentElement?.previousElementSibling?.querySelector('button');
        if (nextHeading) nextHeading.focus();
        const lastHeading = document.querySelector('ul')?.lastElementChild?.querySelector('button');
        if (!nextHeading && lastHeading) lastHeading.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [headings]);

  return (
    <div className="headings">
      <h2>Headings</h2>
      <ul>
        {headings.map(heading => (
          <li key={heading.id}>
            <button onClick={() => onHeadingPressed(heading.id)}>
              {heading.level}: {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Links() {
  const [links, setLinks] = useState<LinksList>([]);

  React.useEffect(() => {
    async function postMessage() {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { type: LINKS_REQUESTED });
      setLinks(response);
    }

    postMessage();
  }, []);

  React.useEffect(() => {
    const firstLink = document.querySelector('a');
    if (firstLink) firstLink.focus();
  }, [links]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentLink = document.activeElement as HTMLAnchorElement;
        const nextLink = currentLink.parentElement?.nextElementSibling?.querySelector('a');
        if (nextLink) nextLink.focus();
        if (!nextLink) document.querySelector('a')?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentLink = document.activeElement as HTMLAnchorElement;
        const nextLink = currentLink.parentElement?.previousElementSibling?.querySelector('a');
        if (nextLink) nextLink.focus();
        const lastLink = document.querySelector('ul')?.lastElementChild?.querySelector('a');
        if (!nextLink && lastLink) lastLink.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [links]);

  async function onLinkPressed(url: string) {
    await chrome.tabs.update({ url });
    window.close();
  }

  return (
    <div>
      <h2>Links</h2>
      <ul>
        {links.map(link => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => {
                e.preventDefault();
                onLinkPressed(link.href);
              }}>
              {link.text || ' '}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
