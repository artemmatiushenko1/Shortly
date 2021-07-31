'use strict';

const API_URL = 'https://api.shrtco.de/v2/shorten?url=';
const urlInput = document.querySelector('.shorten__input');
const submitBtn = document.querySelector('.shorten__btn');
const linksContainer = document.querySelector('.shorten__links-list');
let links = [];
const btnContent = {
  text: 'Shorten it!',
  loader: `
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

const saveLinks = (originalLink, shortenedLink) => {
  links.push({
    originalLink,
    shortenedLink,
  });
  window.localStorage.setItem('links', JSON.stringify(links));
};

const shortenLink = async () => {
  try {
    const link = urlInput.value;
    const reqURL = `https://api.shrtco.de/v2/shorten?url=${link}`;
    changeElContent(submitBtn, btnContent.loader);
    const req = await fetch(reqURL);
    const resp = await req.json();
    const shortenedLink = resp.result.full_short_link;
    changeElContent(submitBtn, btnContent.text);
    clearInput(urlInput);
    appendLink(link, shortenedLink);
    saveLinks(link, shortenedLink);
  } catch (error) {
    console.log(error);
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
        changeElContent(copyBtn, btnContent.copied);
        setTimeout(() => {
          changeElContent(copyBtn, btnContent.copy);
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
  shortenLink();
});

linksContainer.addEventListener('click', (e) => {
  const target = e.target;
  copyLink(target);
});

window.onload = (e) => {
  links = JSON.parse(window.localStorage.getItem('links'));
  links.forEach((links) => {
    appendLink(links.originalLink, links.shortenedLink);
  });
};
