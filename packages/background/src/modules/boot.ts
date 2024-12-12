import { MessageCode } from '@shared/enums/message-code';
import { MessageData } from '@shared/interfaces/message-data';
import { UseChromeRuntimeReturn, useChromeRuntime } from '@shared/hooks/useChromeRuntime';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';
import { requestSettingsForContent } from '@background/modules/request-settings';
import { saveCustomSettingsSection, removeCustomSettingsSection } from '@background/modules/settings-section';
import { updateExtensionIcon } from '@background/modules/extension-icon';

export function boot(): void {
  const runtime: UseChromeRuntimeReturn = useChromeRuntime();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  runtime.addMessageListener(MessageCode.REQUEST_SETTINGS, (): void => {
    requestSettingsForContent();
  });

  runtime.addMessageListener(MessageCode.SAVE_SECTION, (message: MessageData): void => {
    saveCustomSettingsSection(message.section);
  });

  runtime.addMessageListener(MessageCode.REMOVE_SECTION, (message: MessageData): void => {
    removeCustomSettingsSection(message.section);
  });

  tabs.addUpdateListener((): void => {
    updateExtensionIcon();
  });
}
