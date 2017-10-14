import * as followActions from 'content/actions/follow';
import messages from 'shared/messages';
import Hint from './hint';
import HintKeyProducer from 'content/hint-key-producer';

const DEFAULT_HINT_CHARSET = 'abcdefghijklmnopqrstuvwxyz';
const TARGET_SELECTOR = [
  'a', 'button', 'input', 'textarea',
  '[contenteditable=true]', '[contenteditable=""]'
].join(',');

const inWindow = (win, element) => {
  let {
    top, left, bottom, right
  } = element.getBoundingClientRect();
  let doc = win.doc;
  return (
    top >= 0 && left >= 0 &&
    bottom <= (win.innerHeight || doc.documentElement.clientHeight) &&
    right <= (win.innerWidth || doc.documentElement.clientWidth)
  );
};

export default class FollowComponent {
  constructor(win, store) {
    this.win = win;
    this.store = store;
    this.hintElements = {};
    this.state = {};
  }

  update() {
    let prevState = this.state;
    this.state = this.store.getState().follow;
    if (!prevState.enabled && this.state.enabled) {
      this.create();
    } else if (prevState.enabled && !this.state.enabled) {
      this.remove();
    } else if (prevState.keys !== this.state.keys) {
      this.updateHints();
    }
  }

  key(key) {
    if (!this.state.enabled) {
      return false;
    }

    switch (key) {
    case 'Enter':
      this.activate(this.hintElements[this.state.keys].target);
      return;
    case 'Escape':
      this.store.dispatch(followActions.disable());
      return;
    case 'Backspace':
    case 'Delete':
      this.store.dispatch(followActions.backspace());
      break;
    default:
      if (DEFAULT_HINT_CHARSET.includes(key)) {
        this.store.dispatch(followActions.keyPress(key));
      }
      break;
    }
    return true;
  }

  updateHints() {
    let keys = this.state.keys;
    let shown = Object.keys(this.hintElements).filter((key) => {
      return key.startsWith(keys);
    });
    let hidden = Object.keys(this.hintElements).filter((key) => {
      return !key.startsWith(keys);
    });
    if (shown.length === 0) {
      this.remove();
      return;
    } else if (shown.length === 1) {
      this.activate(this.hintElements[keys].target);
      this.store.dispatch(followActions.disable());
    }

    shown.forEach((key) => {
      this.hintElements[key].show();
    });
    hidden.forEach((key) => {
      this.hintElements[key].hide();
    });
  }

  openLink(element) {
    if (!this.state.newTab) {
      element.click();
      return;
    }

    let href = element.getAttribute('href');

    // eslint-disable-next-line no-script-url
    if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) {
      return;
    }
    return browser.runtime.sendMessage({
      type: messages.OPEN_URL,
      url: element.href,
      newTab: this.state.newTab,
    });
  }

  activate(element) {
    switch (element.tagName.toLowerCase()) {
    case 'a':
      return this.openLink(element, this.state.newTab);
    case 'input':
      switch (element.type) {
      case 'file':
      case 'checkbox':
      case 'radio':
      case 'submit':
      case 'reset':
      case 'button':
      case 'image':
      case 'color':
        return element.click();
      default:
        return element.focus();
      }
    case 'textarea':
      return element.focus();
    case 'button':
      return element.click();
    default:
      // it may contenteditable
      return element.focus();
    }
  }

  create() {
    let elements = FollowComponent.getTargetElements(this.win);
    let producer = new HintKeyProducer(DEFAULT_HINT_CHARSET);
    let hintElements = {};
    Array.prototype.forEach.call(elements, (ele) => {
      let keys = producer.produce();
      let hint = new Hint(ele, keys);
      hintElements[keys] = hint;
    });
    this.hintElements = hintElements;
  }

  remove() {
    let hintElements = this.hintElements;
    Object.keys(this.hintElements).forEach((key) => {
      hintElements[key].remove();
    });
  }

  static getTargetElements(win) {
    let all = win.document.querySelectorAll(TARGET_SELECTOR);
    let filtered = Array.prototype.filter.call(all, (element) => {
      let style = win.getComputedStyle(element);
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.type !== 'hidden' &&
        element.offsetHeight > 0 &&
        inWindow(win, element);
    });
    return filtered;
  }
}
