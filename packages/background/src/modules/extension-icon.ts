import { CustomSection } from '@shared/interfaces/custom-section';
import { UseChromeStorageReturn, useChromeStorage } from '@shared/hooks/useChromeStorage';
import { UseChromeTabsReturn, ActiveTabData, useChromeTabs } from '@shared/hooks/useChromeTabs';

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
    .getActiveTab()
    .then((activeTab: ActiveTabData): void => {
      storage
        .get<CustomSection[]>(activeTab.origin)
        .then((customSettings: CustomSection[]): void => {
          chrome.action.setIcon({
            tabId: activeTab.tab.id,
            path: customSettings?.length ? icons : inactiveIcons,
          });
        });
    });
}
