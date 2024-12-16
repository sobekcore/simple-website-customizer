import { MessageData } from '@shared/interfaces/message-data';

export interface UseChromeTabsReturn {
  addUpdateListener(callback: UpdateListenerCallback): void;
  sendMessage(message: MessageData, active?: boolean): Promise<void>;
  getActive(): Promise<chrome.tabs.Tab>;
  getAll(activeTab: chrome.tabs.Tab): Promise<chrome.tabs.Tab[]>;
  getOrigin(tab: chrome.tabs.Tab): string;
}

type UpdateListenerCallback = (tab: chrome.tabs.Tab) => void;

export function useChromeTabs(): UseChromeTabsReturn {
  const addUpdateListener = (callback: UpdateListenerCallback): void => {
    chrome.tabs.onUpdated.addListener((tabId: number, change: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
      callback(tab);
    });
  };

  const sendMessage = (message: MessageData, active?: boolean): Promise<void> => {
    return new Promise((resolve): void => {
      const finalize = (tabs: chrome.tabs.Tab[]): void => {
        for (const tab of tabs) {
          chrome.tabs
            .sendMessage(tab.id, message)
            .catch((): void => {
              console.info(`Message cannot be sent, extension is not active in tab: ${tab.id}`);
            });
        }

        resolve();
      };

      getActive().then((activeTab: chrome.tabs.Tab): void => {
        if (active) {
          finalize([activeTab]);
          return;
        }

        getAll(activeTab).then((tabs: chrome.tabs.Tab[]): void => {
          finalize(tabs);
        });
      });
    });
  };

  const getActive = (): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve): void => {
      const queryInfo: chrome.tabs.QueryInfo = {
        active: true,
        currentWindow: true,
      };

      chrome.tabs.query(queryInfo, ([tab]: chrome.tabs.Tab[]): void => {
        if (tab) {
          resolve(tab);
        }
      });
    });
  };

  const getAll = (activeTab: chrome.tabs.Tab): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve): void => {
      const queryInfo: chrome.tabs.QueryInfo = {
        url: `${getOrigin(activeTab)}/*`,
      };

      chrome.tabs.query(queryInfo, (tabs: chrome.tabs.Tab[]): void => {
        resolve(tabs);
      });
    });
  };

  const getOrigin = (tab: chrome.tabs.Tab): string => {
    return new URL(tab.url).origin;
  };

  return {
    addUpdateListener,
    sendMessage,
    getActive,
    getAll,
    getOrigin,
  };
}
