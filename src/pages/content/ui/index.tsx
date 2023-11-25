import { HEADINGS_REQUESTED, HEADING_PRESSED } from '@root/src/shared/constants';
import { HeadingsList } from '@root/src/shared/types';
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
});

function focusHeading(id: string) {
  const heading = document.querySelector(`[propellor-id="${id}"]`) as HTMLElement;

  if (heading) {
    const originalTabIndex = heading.getAttribute('tabindex');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
    heading.scrollIntoView({
      block: 'start',
    });

    heading.addEventListener(
      'blur',
      () => {
        heading.setAttribute('tabindex', originalTabIndex);
      },
      {
        once: true,
      },
    );
  }
}

function collectHeadings() {
  const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingsList: HeadingsList = [];

  allHeadings.forEach(heading => {
    const uid = Math.random().toString(36).substr(2, 9);

    heading.setAttribute('propellor-id', uid);

    headingsList.push({
      id: uid,
      text: heading.textContent,
      level: heading.tagName,
    });
  });

  return headingsList;
}
