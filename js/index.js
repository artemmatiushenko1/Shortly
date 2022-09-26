'use strict';
class App {
  #BASE_API_URL = 'https://api.shrtco.de/v2/shorten';
  refs = {
    form: document.querySelector('.shorten__form'),
    urlInput: document.querySelector('.shorten__input'),
    submitBtn: document.querySelector('.shorten__btn'),
    errorMessage: document.querySelector('.shorten__error-message'),
    linksContainer: document.querySelector('.shorten__links-list'),
  };

  links = [];

  constructor() {
    this.refs.form.addEventListener('submit', this.handleOnSubmit.bind(this));
  }

  getAPIurl(params) {
    const url = new URL(this.#BASE_API_URL);
    url.search = new URLSearchParams(params).toString();
    return url;
  }

  async shortenLink(url) {
    try {
      const req = await fetch(this.getAPIurl({ url }));
      const resp = await req.json();

      if (resp.ok) {
        const shortendLink = resp.result.full_short_link;
        return shortendLink;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async handleOnSubmit(e) {
    e.preventDefault();
    const inputUrl = new FormData(this.refs.form).get('url');

    this.setSubmitBtnLoading(true);
    const shortendLink = await this.shortenLink(inputUrl);
    this.setSubmitBtnLoading(false);

    this.links.push({ original: inputUrl, shortend: shortendLink });

    this.renderLinks();
  }

  setSubmitBtnLoading(loading) {
    if (loading) {
      this.refs.submitBtn.classList.add('loading');
    } else {
      this.refs.submitBtn.classList.remove('loading');
    }
  }

  copyLink(url, onSuccess) {
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([url], { type: 'text/plain' }),
    });

    navigator.clipboard.write([clipboardItem]).then(onSuccess);
  }

  renderLinks() {
    const markup = this.links
      .map(({ original, shortend }) => {
        return `
          <li class="shorten__item">
            <div class="shorten__result">
              <p class="shorten__before">${original}</p>
              <a
                target="blank"
                href="${shortend}"
                class="shorten__after"
              >
                ${shortend}
              </a>
            </div>
            <button class="btn shorten__copy-btn">Copy</button>
          </li>
        `;
      })
      .join('');

    this.refs.linksContainer.innerHTML = '';
    this.refs.linksContainer.insertAdjacentHTML('afterbegin', markup);
  }
}

const app = new App();

// const API_URL = 'https://api.shrtco.de/v2/shorten?url=';
// const urlInput = document.querySelector('.shorten__input');
// const submitBtn = document.querySelector('.shorten__btn');
// const linksContainer = document.querySelector('.shorten__links-list');
// const errorMessage = document.querySelector('.shorten__error-message');
// const btnStates = {
//   default: 'Shorten it!',
//   processing: `
//   <img
//     src="images/Spinner-1s-200px.png"
//     alt="spinner"
//     class="loader"
//   />
//   `,
//   copy: 'Copy',
//   copied: 'Copied!',
// };

// let links = [];

// const changeElContent = (el, content) => {
//   el.innerHTML = content;
// };

// const clearInput = (el) => {
//   el.value = '';
// };

// const cacheLinks = (originalLink, shortenedLink) => {
//   links.push({
//     originalLink,
//     shortenedLink,
//   });
//   window.localStorage.setItem('links', JSON.stringify(links));
// };

// const shortenLink = async (link) => {
//   try {
//     const reqURL = `https://api.shrtco.de/v2/shorten?url=${link}`;
//     const req = await fetch(reqURL);
//     const resp = await req.json();
//     const shortenedLink = resp.result.full_short_link;
//     return shortenedLink;
//   } catch (err) {
//     console.error(err);
//   }
// };

// const copyLink = (targetEl) => {
//   const copyBtn = targetEl.closest('.shorten__copy-btn');
//   const linkComponent = targetEl.closest('.shorten__item');
//   if (linkComponent) {
//     const link = linkComponent
//       .querySelector('.shorten__after')
//       .getAttribute('href');

//     const clipboardItem = [
//       new ClipboardItem({
//         'text/plain': new Blob([link], { type: 'text/plain' }),
//       }),
//     ];

//     navigator.clipboard.write(clipboardItem).then(function () {
//       if (copyBtn) {
//         changeElContent(copyBtn, btnStates.copied);
//         setTimeout(() => {
//           changeElContent(copyBtn, btnStates.copy);
//         }, 2000);
//       }
//     });
//   }
// };

// const appendLink = (originalLink, shortenedLink) => {
//   const markup = `
//   <li class="shorten__item">
//     <div class="shorten__result">
//       <p class="shorten__before">${originalLink}</p>
//       <a
//         target="blank"
//         href="${shortenedLink}"
//         class="shorten__after"
//         >${shortenedLink}</a
//       >
//     </div>
//     <button class="btn shorten__copy-btn">Copy</button>
//   </li>
//   `;

//   linksContainer.insertAdjacentHTML('afterbegin', markup);
// };

// submitBtn.addEventListener('click', async (e) => {
//   e.preventDefault();
//   const link = urlInput.value;

//   if (link === '' || !link.includes('https')) {
//     urlInput.classList.add('shorten__input-invalid');
//     errorMessage.classList.add('shorten__error-message--active');
//     return;
//   }

//   urlInput.classList.remove('shorten__input-invalid');
//   errorMessage.classList.remove('shorten__error-message--active');
//   changeElContent(submitBtn, btnStates.processing);
//   const shortenedLink = await shortenLink(link);
//   changeElContent(submitBtn, btnStates.default);
//   appendLink(link, shortenedLink);
//   cacheLinks(link, shortenedLink);
//   clearInput(urlInput);
// });

// linksContainer.addEventListener('click', (e) => {
//   const target = e.target;
//   copyLink(target);
// });

// window.addEventListener('load', (e) => {
//   const storageItems = JSON.parse(window.localStorage.getItem('links'));
//   if (storageItems) {
//     links = storageItems;
//     links.forEach((item) => {
//       appendLink(item.originalLink, item.shortenedLink);
//     });
//   }
// });
