import { Fragment, h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { MessageCode } from '@shared/enums/message-code';
import { SectionState } from '@shared/enums/section-state';
import { MessageData } from '@shared/interfaces/message-data';
import { Section } from '@shared/interfaces/section';
import { CustomSection } from '@shared/interfaces/custom-section';
import { useChromeRuntime, UseChromeRuntimeReturn } from '@shared/hooks/useChromeRuntime';
import { useChromeStorage, UseChromeStorageReturn } from '@shared/hooks/useChromeStorage';
import { useChromeTabs, UseChromeTabsReturn } from '@shared/hooks/useChromeTabs';
import { CUSTOM_SETTINGS_KEY } from '@shared/const';
import { CustomSettingsContext, CustomSettingsContextData, } from '@popup/providers/CustomSettingsProvider';
import { useComponentUpdate, UseComponentUpdateReturn } from '@popup/hooks/useComponentUpdate';
import SettingsProvider from '@popup/providers/SettingsProvider';
import SettingsMessage from '@popup/components/SettingsMessage';
import SettingsSection from '@popup/components/SettingsSection/SettingsSection';
import SettingsSectionCreator from '@popup/components/Creators/SettingsSectionCreator';
import SettingsSectionSkeleton from '@popup/components/Skeletons/SettingsSectionSkeleton';
import '@popup/styles/settings.scss';

interface SettingsProps {
  settings: Section[];
}

export default function Settings(props: SettingsProps) {
  const customSettingsContext: CustomSettingsContextData = useContext(CustomSettingsContext);
  const componentUpdate: UseComponentUpdateReturn = useComponentUpdate();
  const runtime: UseChromeRuntimeReturn = useChromeRuntime();
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  const [injected, setInjected] = useState<boolean | null>(null);

  useEffect((): void => {
    runtime.addMessageListener(MessageCode.CHECK_IF_STYLE_IS_INJECTED, (message: MessageData): void => {
      if (message.injected) {
        setInjected(true);
      }
    });

    storage
      .get<CustomSection[]>(CUSTOM_SETTINGS_KEY)
      .then((customSettings: CustomSection[]): void => {
        customSettingsContext.setSettings(customSettings ?? []);
      });

    tabs.sendMessage({
      code: MessageCode.CHECK_IF_STYLE_IS_INJECTED,
    }, true);

    /**
     * If after 500ms we didn't get positive response from the content package it means
     * we could not properly initialize the script and inject style into current page
     */
    setTimeout((): void => {
      setInjected((previous: boolean | null): boolean => {
        return previous !== null;
      });
    }, 500);
  }, []);

  const handleSettingsSaved = (): void => {
    componentUpdate.forceUpdate();
  };

  return (
    <SettingsProvider>
      <main class="settings" data-injected={injected}>
        {injected !== null && props.settings.length ? (
          <Fragment>
            {injected === false && (
              <SettingsMessage
                type="negative"
                message="Styles could not be applied into current page. Make sure your location is any Facebook URL or try to refresh the page."
              />
            )}
            {!customSettingsContext.settings.find((section: CustomSection): boolean => section.state === SectionState.INIT) && (
              <SettingsSectionCreator />
            )}
            {customSettingsContext.settings.map((section: CustomSection) => (
              <SettingsSection section={section} sectionSaved={handleSettingsSaved} optionSaved={handleSettingsSaved} />
            ))}
            {props.settings.map((section: Section) => (
              <SettingsSection section={section} />
            ))}
          </Fragment>
        ) : (
          <Fragment>
            <SettingsSectionSkeleton options={2} />
            <SettingsSectionSkeleton options={1} />
          </Fragment>
        )}
      </main>
    </SettingsProvider>
  );
}
