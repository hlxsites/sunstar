import { getLanguage, loadScript } from '../../scripts/scripts.js';
import { sampleRUM } from '../../scripts/lib-franklin.js';

function ensureParagraph(el) {
  // add <p> if missing
  if (!el.querySelector('p')) {
    const p = document.createElement('p');
    p.append(...el.childNodes);
    el.append(p);
  }
  return el;
}

function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  if (fd.State && fd.State === 'disabled') {
    select.setAttribute('disabled', '');
  }
  const values = fd.Values ? fd.Values.split(',') : [];

  fd.Options.split(',').forEach((o, i) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = values[i]?.trim() ?? o.trim();
    select.append(option);
  });
  if (fd.Mandatory) {
    select.setAttribute('required', 'required');
  }
  if (fd.Enable) {
    select.addEventListener('change', () => {
      const enable = document.getElementById(fd.Enable);
      enable.removeAttribute('disabled');
    });
  }
  return select;
}

function generateUnique() {
  return new Date().valueOf() + Math.random();
}

function constructPayload(form) {
  const payload = { __id__: generateUnique() };
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  sampleRUM('form:submit');
  return true;
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        if (await submitForm(form)) {
          window.location.href = fd.Extra;
        }
      }
    });
  }
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory) {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory) {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  if (!fd.Label) {
    return null;
  }
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory) {
    label.classList.add('required');
  }
  if (fd.Suffix) {
    const suffix = document.createElement('span');
    suffix.textContent = fd.Suffix;
    label.append(suffix);
  }
  return label;
}

async function getAddresses(fieldWrapper, fd) {
  let addrInfo = fieldWrapper.querySelector('.addresses');
  if (!addrInfo) {
    const resp = await fetch(`${fd.Extra}.plain.html`);
    const fragment = document.createElement('div');
    fragment.innerHTML = await resp.text();
    addrInfo = fragment.querySelector('.addresses');
    // eslint-disable-next-line no-restricted-syntax
    for (const child of [...addrInfo.children]) {
      const key = child.firstElementChild.textContent.trim();
      const address = child.lastElementChild;
      const fieldId = `region-${key.toLowerCase()}`;
      address.classList.add(fieldId);
      address.classList.add('hidden');
      // move to parent
      child.remove();
      ensureParagraph(address);
      addrInfo.append(address);
    }
    fieldWrapper.append(addrInfo);
  }
  return addrInfo;
}

function initRegionSelection(fieldWrapper, fd) {
  const select = fieldWrapper.querySelector('select');
  select.addEventListener('change', async () => {
    const addresses = await getAddresses(fieldWrapper, fd);
    const key = `region-${select.value.toLowerCase()}`;
    // eslint-disable-next-line no-restricted-syntax
    for (const addr of addresses.children) {
      if (addr.classList.contains(key)) {
        addr.classList.remove('hidden');
      } else {
        addr.classList.add('hidden');
      }
    }
  });
}

function createValidateLabel(msg) {
  const el = document.createElement('div');
  el.className = 'form-validate-label';
  el.textContent = msg;
  return el;
}

let captchaElement;
let userconsentElement;

/**
 * id of the reCaptcha service in the user consent manager (todo: make configurable via form?)
 * @type {string}
 */
const reCaptchaUCID = 'Hko_qNsui-Q';

/**
 * Checks if the captcha is allowed by the consent manager. returns true if there is no
 * captcha defined on the form or if there is no consent manager loaded.
 */
function hasCaptchaConsent() {
  if (!captchaElement) {
    return true;
  }
  if (!window.uc) {
    // eslint-disable-next-line no-console
    console.warn('consent manager not loaded. assuming captcha consent');
    return true;
  }
  window.uc.reloadOnOptOut(reCaptchaUCID);
  // eslint-disable-next-line no-restricted-syntax
  for (const svc of window.uc.ucapi.getWhitelistedServices()) {
    if (svc.split('|').includes(reCaptchaUCID)) {
      return true;
    }
  }
  return false;
}

function updateUserConsent() {
  if (!userconsentElement) {
    return;
  }
  if (hasCaptchaConsent()) {
    userconsentElement.classList.add('hidden');
  } else {
    userconsentElement.classList.remove('hidden');
  }
}

/**
 * initializes the user consent note and links the buttons to the consent manager dialogs.
 * @param {HTMLElement} note
 */
function initUserConsent(note) {
  if (!note) {
    return;
  }
  if (captchaElement) {
    captchaElement.parentElement.appendChild(note);
  } else {
    note.remove();
    return;
  }
  ensureParagraph(note);
  note.classList.add('userconsent-note');
  userconsentElement = note;

  const detailsBtn = note.querySelector('a[href="#userconsent-details"]');
  if (detailsBtn) {
    detailsBtn.setAttribute('role', 'button');
    detailsBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      window.uc.ucapi.showInfoModal(reCaptchaUCID);
      return false;
    });
  }

  const acceptBtn = note.querySelector('a[href="#userconsent-accept"]');
  if (acceptBtn) {
    acceptBtn.setAttribute('role', 'button');
    acceptBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      window.uc.ucapi.setConsents([{ templateId: reCaptchaUCID, status: true }]);
      return false;
    });
  }

  // observe the captchaElement and update the user consent note visibility if it changes
  // this works, because the consent manager adds the captcha when the consent changes.
  const observer = new MutationObserver((mutations) => {
    if (mutations.find(({ type }) => type === 'childList')) {
      updateUserConsent();
    }
  });
  observer.observe(captchaElement, {
    childList: true,
  });
}

function validateForm(form) {
  const button = form.querySelector('.form-submit-wrapper > button');
  if (button) {
    if (form.checkValidity() && hasCaptchaConsent()) {
      button.removeAttribute('disabled');
    } else {
      button.setAttribute('disabled', '');
    }
  }
}

function validateField(el, fd) {
  if (fd.Mandatory) {
    const wrapper = el.parentElement;
    if (el.value) {
      wrapper.classList.remove('invalid');
    } else {
      wrapper.classList.add('invalid');
    }
    validateForm(el.closest('form'));
  }
}

window.captchaRenderCallback = () => {
  // eslint-disable-next-line no-console
  console.error('captcha not configured');
};

function createCaptcha(fd) {
  captchaElement = document.createElement('div');

  window.captchaRenderCallback = () => {
    // eslint-disable-next-line no-undef
    grecaptcha.render(captchaElement, {
      sitekey: fd.Extra,
      callback: (response) => {
        if (response) {
          validateForm(captchaElement.closest('form'));
        }
      },
    });
    const resp = document.getElementById('g-recaptcha-response');
    resp.setAttribute('required', 'required');
  };

  window.addEventListener('consentmanager', () => {
    const url = new URL('https://www.google.com/recaptcha/api.js?onload=captchaRenderCallback&render=explicit');
    url.searchParams.append('hl', getLanguage());
    loadScript(url, {
      async: 'async',
      defer: 'defer',
    });
  });

  return captchaElement;
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  // eslint-disable-next-line no-restricted-syntax
  for (const fd of json.data) {
    fd.Type = fd.Type || 'text';
    if (fd.Type === 'hidden') {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = fd.Field;
      hidden.value = fd.Values;
      form.append(hidden);
      // eslint-disable-next-line no-continue
      continue;
    }
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    fieldWrapper.className = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.classList.add('field-wrapper');

    const append = (el) => {
      if (el) {
        fieldWrapper.append(el);
      }
    };

    const appendField = (fn) => {
      const el = fn(fd);
      fieldWrapper.append(el);
      if (fd.Mandatory) {
        const msgEl = createValidateLabel(fd.Mandatory);
        fieldWrapper.append(msgEl);
        el.addEventListener('blur', () => validateField(el, fd));
      }
      if (fd.Description) {
        const des = document.createElement('div');
        des.textContent = fd.Description;
        fieldWrapper.append(des);
      }
    };

    switch (fd.Type) {
      case 'select':
        append(createLabel(fd));
        appendField(createSelect);
        break;
      case 'heading':
        append(createHeading(fd));
        break;
      case 'checkbox':
        append(createInput(fd));
        append(createLabel(fd));
        break;
      case 'text-area':
        append(createLabel(fd));
        appendField(createTextArea);
        break;
      case 'submit':
        append(createButton(fd));
        break;
      case 'captcha':
        append(createCaptcha(fd));
        break;
      default:
        append(createLabel(fd));
        appendField(createInput);
    }

    // special logic for region selector
    if (fd.Field === 'region') {
      initRegionSelection(fieldWrapper, fd);
    }
    form.append(fieldWrapper);
  }
  validateForm(form);
  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
  // convert 2nd row to form-note
  const note = block.querySelector('div > div:nth-child(2) > div');
  if (note) {
    ensureParagraph(note);
    note.classList.add('form-note');
  }

  // convert 3rd row to userconsent-note
  initUserConsent(block.querySelector('div > div:nth-child(3) > div'));
}
