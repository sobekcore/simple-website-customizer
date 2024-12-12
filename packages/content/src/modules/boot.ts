import { MessageCode } from '@shared/enums/message-code';
import { MessageData } from '@shared/interfaces/message-data';
import { UseChromeRuntimeReturn, useChromeRuntime } from '@shared/hooks/useChromeRuntime';
import { checkIfStyleIsInjected, injectStyleIntoDocument } from '@content/modules/style-inject';
import { checkIfElementExists, selectElementFromDocument } from '@content/modules/element';

export function boot(): void {
  const runtime: UseChromeRuntimeReturn = useChromeRuntime();

  runtime.addMessageListener(MessageCode.REQUEST_SETTINGS, (message: MessageData): void => {
    injectStyleIntoDocument(message.settings);
  });

  runtime.addMessageListener(MessageCode.SELECT_ELEMENT_OPTION, (message: MessageData): void => {
    selectElementFromDocument(message.section, message.option);
  });

  runtime.addMessageListener(MessageCode.CHECK_IF_STYLE_IS_INJECTED, (): void => {
    checkIfStyleIsInjected();
  });

  runtime.addMessageListener(MessageCode.CHECK_IF_ELEMENT_EXISTS, (message: MessageData): void => {
    checkIfElementExists(message.option);
  });

  runtime.sendMessage({
    code: MessageCode.REQUEST_SETTINGS,
  });

  window.simpleWebsiteCustomizer = {};
}
