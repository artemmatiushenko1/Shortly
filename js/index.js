'use strict';

const API_URL = 'https://api.shrtco.de/v2/shorten?url=';
const urlInput = document.querySelector('.shorten__input');
const submitBtn = document.querySelector('.shorten__btn');
const linksContainer = document.querySelector('.shorten__links-list');
let links = [];
const btnStates = {
  default: 'Shorten it!',
  processing: `
  <img
    src="images/Spinner-1s-200px.png"
    alt="spinner"
    class="loader"
  />
  `,
  copy: 'Copy',
  copied: 'Copied!',
};

const changeElContent = (el, content) => {
  el.innerHTML = content;
};

const clearInput = (el) => {
  el.value = '';
};

const cacheLinks = (originalLink, shortenedLink) => {
  links.push({
    originalLink,
    shortenedLink,
  });
  window.localStorage.setItem('links', JSON.stringify(links));
};

const shortenLink = async (link) => {
  try {
    const reqURL = `https://api.shrtco.de/v2/shorten?url=${link}`;
    const req = await fetch(reqURL);
    const resp = await req.json();
    const shortenedLink = resp.result.full_short_link;

    return shortenedLink;
  } catch (err) {
    console.error(err);
  }
};

const copyLink = (targetEl) => {
  const copyBtn = targetEl.closest('.shorten__copy-btn');
  const linkComponent = targetEl.closest('.shorten__item');
  if (linkComponent) {
    const link = linkComponent
      .querySelector('.shorten__after')
      .getAttribute('href');

    const clipboardItem = [
      new ClipboardItem({
        'text/plain': new Blob([link], { type: 'text/plain' }),
      }),
    ];

    navigator.clipboard.write(clipboardItem).then(function () {
      if (copyBtn) {
        changeElContent(copyBtn, btnStates.copied);
        setTimeout(() => {
          changeElContent(copyBtn, btnStates.copy);
        }, 2000);
      }
    });
  }
};

const appendLink = (originalLink, shortenedLink) => {
  const markup = `
  <li class="shorten__item">
    <div class="shorten__result">
      <p class="shorten__before">${originalLink}</p>
      <a
        target="blank"
        href="${shortenedLink}"
        class="shorten__after"
        >${shortenedLink}</a
      >
    </div>
    <button class="btn shorten__copy-btn">Copy</button>
  </li>
  `;

  linksContainer.insertAdjacentHTML('afterbegin', markup);
};

submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const link = urlInput.value;
  changeElContent(submitBtn, btnStates.processing);
  const shortenedLink = await shortenLink(link);
  changeElContent(submitBtn, btnStates.default);
  appendLink(link, shortenedLink);
  cacheLinks(link, shortenedLink);
  clearInput(urlInput);
});

linksContainer.addEventListener('click', (e) => {
  const target = e.target;
  copyLink(target);
});

window.addEventListener('load', (e) => {
  const storageItems = JSON.parse(window.localStorage.getItem('links'));
  if (storageItems) {
    links = storageItems;
    links.forEach((item) => {
      appendLink(item.originalLink, item.shortenedLink);
    });
  }
});
