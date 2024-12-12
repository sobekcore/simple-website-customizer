import { MessageData } from '@shared/interfaces/message-data';

export interface UseChromeTabsReturn {
  addUpdateListener(callback: UpdateListenerCallback): void;
  sendMessage(message: MessageData, active?: boolean): void;
  getActiveTab(): Promise<ActiveTabData>;
}

export interface ActiveTabData {
  tab: chrome.tabs.Tab;
  origin: string;
}

type UpdateListenerCallback = (tab: chrome.tabs.Tab) => void;

export function useChromeTabs(): UseChromeTabsReturn {
  const addUpdateListener = (callback: UpdateListenerCallback): void => {
    chrome.tabs.onUpdated.addListener((tabId: number, change: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
      callback(tab);
    });
  };

  const sendMessage = (message: MessageData, active?: boolean): void => {
    const queryInfo: chrome.tabs.QueryInfo = {};

    if (active) {
      queryInfo.active = true;
      queryInfo.currentWindow = true;
    }

    chrome.tabs.query(queryInfo, (tabs: chrome.tabs.Tab[]): void => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, message);
      }
    });
  };

  const getActiveTab = (): Promise<ActiveTabData> => {
    return new Promise((resolve): void => {
      const queryInfo: chrome.tabs.QueryInfo = {
        active: true,
        currentWindow: true,
      };

      chrome.tabs.query(queryInfo, ([tab]: chrome.tabs.Tab[]): void => {
        const url: URL = new URL(tab.url);

        resolve({
          tab: tab,
          origin: url.origin,
        });
      });
    });
  };

  return {
    addUpdateListener,
    sendMessage,
    getActiveTab,
  };
}
