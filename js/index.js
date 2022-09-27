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
    this.getLinksFromLocalStorage();
    this.renderLinks();

    this.refs.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.refs.linksContainer.addEventListener(
      'click',
      this.handleCopyLink.bind(this)
    );
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
      this.setUrlInputValidationMsg(err.message);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const inputUrl = new FormData(this.refs.form).get('url');
      const { isValid, message } = this.validateLink(inputUrl);

      if (!isValid) {
        throw new Error(message);
      }

      this.setSubmitBtnLoading(true);
      const shortendLink = await this.shortenLink(inputUrl);
      this.setSubmitBtnLoading(false);

      if (shortendLink) {
        this.links.unshift({ original: inputUrl, shortend: shortendLink });
        this.persistLinks();
        this.renderLinks();
      }
    } catch (e) {
      this.setUrlInputValidationState({ message: e.message, isValid: false });
    }
  }

  handleCopyLink(e) {
    const copyBtn = e.target.closest('.shorten__copy-btn');
    if (!copyBtn) return;
    const linkIndex = Number(copyBtn.dataset.link_id);
    const link = this.links[linkIndex];

    this.copyLink(link.shortend, () => {
      const prevCopyBtnContent = copyBtn.textContent;
      this.setCopyBtnContent(copyBtn, 'Copied!');

      setTimeout(() => {
        this.setCopyBtnContent(copyBtn, prevCopyBtnContent);
      }, 1500);
    });
  }

  validateLink(url) {
    try {
      if (url === '') {
        return {
          isValid: false,
          message: 'Link is required!',
        };
      }

      return { isValid: Boolean(new URL(url)), message: null };
    } catch (e) {
      return {
        isValid: false,
        message: 'Link is not valid!',
      };
    }
  }

  setSubmitBtnLoading(loading) {
    if (loading) {
      this.refs.submitBtn.classList.add('loading');
    } else {
      this.refs.submitBtn.classList.remove('loading');
    }
  }

  setUrlInputValidationState({ message, isValid }) {
    this.refs.errorMessage.innerHTML = message;

    if (!isValid) {
      this.refs.urlInput.classList.add('shorten__input-invalid');
    } else {
      this.refs.urlInput.classList.remove('shorten__input-invalid');
    }
  }

  setCopyBtnContent(buttonEl, content) {
    buttonEl.textContent = content;
  }

  copyLink(url, onSuccess) {
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([url], { type: 'text/plain' }),
    });

    navigator.clipboard.write([clipboardItem]).then(onSuccess);
  }

  persistLinks() {
    window.localStorage.setItem('links', JSON.stringify(this.links));
  }

  getLinksFromLocalStorage() {
    const links = window.localStorage.getItem('links');

    if (links || links?.length > 0) {
      this.links = JSON.parse(links);
    }
  }

  renderLinks() {
    const markup = this.links
      .map(({ original, shortend }, i) => {
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
            <button data-link_id="${i}" class="btn shorten__copy-btn">
              Copy
            </button>
          </li>
        `;
      })
      .join('');

    this.refs.linksContainer.innerHTML = '';
    this.refs.linksContainer.insertAdjacentHTML('afterbegin', markup);
  }
}

const app = new App();
