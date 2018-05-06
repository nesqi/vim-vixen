import * as indicators from '../shared/indicators';
import messages from 'shared/messages';

export default class IndicatorComponent {
  constructor(store) {
    this.store = store;

    messages.onMessage(this.onMessage.bind(this));

    browser.tabs.onActivated.addListener((info) => {
      return browser.tabs.query({ currentWindow: true }).then(() => {
        return this.onTabActivated(info);
      });
    });
  }

  onTabActivated(info) {
    return browser.tabs.sendMessage(info.tabId, {
      type: messages.ADDON_ENABLED_QUERY,
    }).then((resp) => {
      return this.updateIndicator(resp.enabled);
    });
  }

  onMessage(message) {
    switch (message.type) {
    case messages.ADDON_ENABLED_RESPONSE:
      return this.updateIndicator(message.enabled);
    }
  }

  updateIndicator(enabled) {
    if (enabled) {
      return indicators.enable();
    }
    return indicators.disable();
  }
}
