import { MessageCode } from '@shared/enums/message-code';
import { Section } from '@shared/interfaces/section';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';
import { sanityClient } from '@shared/sanity';
import settingsOrderedQuery from '@shared/queries/settings-ordered.query';

export function requestSettingsForContent(): void {
  const tabs: UseChromeTabsReturn = useChromeTabs();

  sanityClient
    .fetch(settingsOrderedQuery)
    .then((response: { settings: Section[] }): void => {
      tabs.sendMessage({
        code: MessageCode.REQUEST_SETTINGS,
        settings: response.settings,
      }, true);
    });
}
