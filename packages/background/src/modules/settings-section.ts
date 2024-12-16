import { CustomSection } from '@shared/interfaces/custom-section';
import { UseChromeStorageReturn, useChromeStorage } from '@shared/hooks/useChromeStorage';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';
import { updateExtensionIcon } from '@background/modules/extension-icon';

export function saveCustomSettingsSection(customSection: CustomSection): void {
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  tabs
    .getActive()
    .then((activeTab: chrome.tabs.Tab): void => {
      storage
        .get<CustomSection[]>(tabs.getOrigin(activeTab))
        .then((customSettings: CustomSection[]): void => {
          customSettings = customSettings ?? [];

          const shouldUpdateExtensionIcon: boolean = customSettings.length === 0;

          const section: CustomSection = customSettings.find((section: CustomSection): boolean => {
            return section.name === customSection.name;
          });

          if (section) {
            customSettings = customSettings.map((section: CustomSection): CustomSection => {
              return section.name === customSection.name ? customSection : section;
            });
          } else {
            customSettings = [...customSettings, customSection];
          }

          storage
            .set<CustomSection[]>(tabs.getOrigin(activeTab), customSettings)
            .then((): void => {
              if (shouldUpdateExtensionIcon) {
                updateExtensionIcon();
              }
            });
        });
    });
}

export function removeCustomSettingsSection(customSection: CustomSection): void {
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  tabs
    .getActive()
    .then((activeTab: chrome.tabs.Tab): void => {
      storage
        .get<CustomSection[]>(tabs.getOrigin(activeTab))
        .then((customSettings: CustomSection[]): void => {
          customSettings = customSettings ?? [];

          customSettings = customSettings.filter((section: CustomSection): boolean => {
            return section.name !== customSection.name;
          });

          const shouldUpdateExtensionIcon: boolean = customSettings.length === 0;

          storage
            .set<CustomSection[]>(tabs.getOrigin(activeTab), customSettings)
            .then((): void => {
              if (shouldUpdateExtensionIcon) {
                updateExtensionIcon();
              }
            });
        });
    });
}
