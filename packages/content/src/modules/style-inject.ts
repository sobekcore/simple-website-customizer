import { MessageCode } from '@shared/enums/message-code';
import { MessageData } from '@shared/interfaces/message-data';
import { Section } from '@shared/interfaces/section';
import { CustomSection } from '@shared/interfaces/custom-section';
import { UseChromeRuntimeReturn, useChromeRuntime } from '@shared/hooks/useChromeRuntime';
import { UseChromeStorageReturn, useChromeStorage } from '@shared/hooks/useChromeStorage';
import { BRANDING_COLOR, HOVER_ELEMENT_COLOR } from '@shared/const';
import { overwriteDefaultStyle } from '@content/modules/style-overwrite';

export function checkIfStyleIsInjected(): void {
  const runtime: UseChromeRuntimeReturn = useChromeRuntime();

  runtime.sendMessage({
    code: MessageCode.CHECK_IF_STYLE_IS_INJECTED,
    origin: window.location.origin,
    injected: document.querySelector('style[data-simple-website-customizer]') instanceof Element,
  });
}

export function injectStyleIntoDocument(settings: Section[]): void {
  const runtime: UseChromeRuntimeReturn = useChromeRuntime();
  const storage: UseChromeStorageReturn = useChromeStorage();

  const frame: number = window.requestAnimationFrame((): void => {
    /**
     * Cancel first encountered browser frame in order to wait for the
     * dom to render the <head> tag needed for the rest of the script
     */
    window.cancelAnimationFrame(frame);

    const style: HTMLStyleElement = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-simple-website-customizer', 'true');
    document.head.appendChild(style);

    const stylesheet: CSSStyleSheet = style.sheet;

    /**
     * Highlight currently hovered element when picking element to create a custom option
     */
    stylesheet.insertRule(`[data-simple-website-customizer-hover] {
      box-shadow: inset 0 0 0 3px ${BRANDING_COLOR}, inset 0 0 0 9999px ${HOVER_ELEMENT_COLOR} !important;
      cursor: crosshair !important;
    }`);

    /**
     * Overwrite default style from predefined built-in settings
     */
    for (const section of settings) {
      for (const option of section.options) {
        storage
          .get<boolean>(option.name)
          .then((value: boolean): void => {
            overwriteDefaultStyle(stylesheet, option, value ?? false);
          });
      }
    }

    /**
     * Overwrite default style from user defined custom settings
     */
    storage
      .get<CustomSection[]>(window.location.origin)
      .then((customSettings: CustomSection[]): void => {
        for (const section of customSettings ?? []) {
          for (const option of section.options) {
            storage
              .get<boolean>(option.name)
              .then((value: boolean): void => {
                overwriteDefaultStyle(stylesheet, option, value ?? false);
              });
          }
        }
      });

    runtime.addMessageListener(MessageCode.TOGGLE_OPTION, (message: MessageData): void => {
      overwriteDefaultStyle(stylesheet, message.option, message.value);
    });
  });
}
