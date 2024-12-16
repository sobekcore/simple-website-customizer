import { CustomSection } from '@shared/interfaces/custom-section';
import { UseChromeStorageReturn, useChromeStorage } from '@shared/hooks/useChromeStorage';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';

const icons: Record<number, string> = {
  16: '/icons/16.png',
  32: '/icons/32.png',
  48: '/icons/48.png',
};

const inactiveIcons: Record<number, string> = {
  16: '/icons/inactive/16.png',
  32: '/icons/inactive/32.png',
  48: '/icons/inactive/48.png',
};

export function updateExtensionIcon(): void {
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  tabs
    .getActive()
    .then((activeTab: chrome.tabs.Tab): void => {
      storage
        .get<CustomSection[]>(tabs.getOrigin(activeTab))
        .then((customSettings: CustomSection[]): void => {
          tabs
            .getAll(activeTab)
            .then((tabs: chrome.tabs.Tab[]): void => {
              for (const tab of tabs) {
                chrome.action.setIcon({
                  tabId: tab.id,
                  path: customSettings?.length ? icons : inactiveIcons,
                });
              }
            });
        });
    });
}
