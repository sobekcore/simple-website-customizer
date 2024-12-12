import { CustomSection } from '@shared/interfaces/custom-section';
import { UseChromeStorageReturn, useChromeStorage } from '@shared/hooks/useChromeStorage';
import { UseChromeTabsReturn, ActiveTabData, useChromeTabs } from '@shared/hooks/useChromeTabs';
import { updateExtensionIcon } from '@background/modules/extension-icon';

export function saveCustomSettingsSection(customSection: CustomSection): void {
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  tabs
    .getActiveTab()
    .then((activeTab: ActiveTabData): void => {
      storage
        .get<CustomSection[]>(activeTab.origin)
        .then((customSettings: CustomSection[]): void => {
          customSettings = customSettings ?? [];

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
            .set<CustomSection[]>(activeTab.origin, customSettings)
            .then((): void => {
              updateExtensionIcon();
            });
        });
    });
}

export function removeCustomSettingsSection(customSection: CustomSection): void {
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  tabs
    .getActiveTab()
    .then((activeTab: ActiveTabData): void => {
      storage
        .get<CustomSection[]>(activeTab.origin)
        .then((customSettings: CustomSection[]): void => {
          customSettings = customSettings ?? [];

          customSettings = customSettings.filter((section: CustomSection): boolean => {
            return section.name !== customSection.name;
          });

          storage
            .set<CustomSection[]>(activeTab.origin, customSettings)
            .then((): void => {
              updateExtensionIcon();
            });
        });
    });
}
