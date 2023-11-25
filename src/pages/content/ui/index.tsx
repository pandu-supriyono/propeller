import { HEADINGS_REQUESTED, HEADING_PRESSED, LINKS_REQUESTED } from '@root/src/shared/constants';
import { HeadingsList, LinksList } from '@root/src/shared/types';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/content');

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === HEADINGS_REQUESTED) {
    const headings = collectHeadings();
    sendResponse(headings);
  }

  if (request.type === HEADING_PRESSED) {
    focusHeading(request.payload.id);
  }

  if (request.type === LINKS_REQUESTED) {
    const links = collectLinks();
    sendResponse(links);
  }
});

function focusHeading(id: string) {
  const heading = document.querySelector(`[propeller-id="${id}"]`) as HTMLElement;

  if (heading) {
    const originalTabIndex = heading.getAttribute('tabindex');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
    heading.style.outline = '4px solid #ff0';

    heading.addEventListener(
      'blur',
      () => {
        heading.setAttribute('tabindex', originalTabIndex);
        heading.style.outline = 'none';
      },
      {
        once: true,
      },
    );
  }
}

function collectLinks() {
  const allLinks = document.querySelectorAll('a');
  const linksList: LinksList = [];

  allLinks.forEach(link => {
    const uid = Math.random().toString(36).substr(2, 9);

    link.setAttribute('propeller-id', uid);

    const href = link.getAttribute('href');

    // append baseUrl to relative links
    if (href && href.startsWith('/')) {
      const baseUrl = new URL(window.location.href).origin;
      link.setAttribute('href', baseUrl + href);
    }

    linksList.push({
      id: uid,
      text: link.textContent.trim(),
      href: link.getAttribute('href'),
    });
  });

  return linksList;
}

function collectHeadings() {
  const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingsList: HeadingsList = [];

  allHeadings.forEach(heading => {
    const uid = Math.random().toString(36).substr(2, 9);

    heading.setAttribute('propeller-id', uid);

    if (heading.textContent != null) {
      headingsList.push({
        id: uid,
        text: heading.textContent,
        level: heading.tagName,
      });
    }
  });

  return headingsList;
}
