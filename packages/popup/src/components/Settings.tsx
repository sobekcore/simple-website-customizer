import { Fragment, h } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { MessageCode } from '@shared/enums/message-code';
import { SectionState } from '@shared/enums/section-state';
import { MessageData } from '@shared/interfaces/message-data';
import { Section } from '@shared/interfaces/section';
import { CustomSection } from '@shared/interfaces/custom-section';
import { UseChromeRuntimeReturn, useChromeRuntime } from '@shared/hooks/useChromeRuntime';
import { UseChromeStorageReturn, useChromeStorage } from '@shared/hooks/useChromeStorage';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';
import { SettingsContextData, SettingsContext } from '@popup/providers/SettingsProvider';
import { CustomSettingsContextData, CustomSettingsContext, } from '@popup/providers/CustomSettingsProvider';
import { UseRetryReturn, useRetry } from '@popup/hooks/useRetry';
import { UseComponentUpdateReturn, useComponentUpdate } from '@popup/hooks/useComponentUpdate';
import SettingsMessage from '@popup/components/SettingsMessage';
import SettingsSection from '@popup/components/SettingsSection/SettingsSection';
import SettingsSectionCreator from '@popup/components/Creators/SettingsSectionCreator';
import SettingsSectionSkeleton from '@popup/components/Skeletons/SettingsSectionSkeleton';
import '@popup/styles/settings.scss';

interface SettingsProps {
  settings: Section[];
}

export default function Settings(props: SettingsProps) {
  const settingsContext: SettingsContextData = useContext(SettingsContext);
  const customSettingsContext: CustomSettingsContextData = useContext(CustomSettingsContext);
  const retry: UseRetryReturn = useRetry({ amount: 3, timeout: 100 });
  const componentUpdate: UseComponentUpdateReturn = useComponentUpdate();
  const runtime: UseChromeRuntimeReturn = useChromeRuntime();
  const storage: UseChromeStorageReturn = useChromeStorage();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  useEffect((): void => {
    runtime.addMessageListener(MessageCode.CHECK_IF_STYLE_IS_INJECTED, (message: MessageData): void => {
      storage
        .get<CustomSection[]>(message.origin)
        .then((customSettings: CustomSection[]): void => {
          customSettingsContext.setSettings(customSettings ?? []);

          if (message.injected) {
            settingsContext.setInjected(true);
            return;
          }

          retry.update((): void => {
            tabs.sendMessage({
              code: MessageCode.CHECK_IF_STYLE_IS_INJECTED,
            }, true);
          });
        });
    });

    tabs.sendMessage({
      code: MessageCode.CHECK_IF_STYLE_IS_INJECTED,
    }, true);

    /**
     * If after 500ms we didn't get positive response from the content package it means
     * we could not properly initialize the script and inject style into current page
     */
    setTimeout((): void => {
      settingsContext.setInjected((previous: boolean | null): boolean => {
        return previous !== null;
      });
    }, 500);
  }, []);

  const handleSettingsSaved = (): void => {
    componentUpdate.forceUpdate();
  };

  return (
    <main class="settings" data-injected={settingsContext.injected}>
      {settingsContext.injected !== null ? (
        <Fragment>
          {settingsContext.injected === false && (
            <SettingsMessage
              type="negative"
              message="Settings could not be loaded from current page. Make sure your location is any valid URL, then try to reopen extension window or refresh the page."
            />
          )}
          {!customSettingsContext.settings.find((section: CustomSection): boolean => section.state === SectionState.INIT) && (
            <SettingsSectionCreator />
          )}
          <div class="settings-custom">
            {customSettingsContext.settings.map((section: CustomSection) => (
              <SettingsSection section={section} sectionSaved={handleSettingsSaved} optionSaved={handleSettingsSaved} />
            ))}
          </div>
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
  );
}
