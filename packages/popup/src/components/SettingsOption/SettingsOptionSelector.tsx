import { h } from 'preact';
import { MessageCode } from '@shared/enums/message-code';
import { CustomSection } from '@shared/interfaces/custom-section';
import { CustomOption } from '@shared/interfaces/custom-option';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';
import '@popup/styles/settings-option/settings-option-selector.scss';

interface SettingsOptionSelectorProps {
  section: CustomSection;
  option: CustomOption;
  onClick?: Function;
}

export default function SettingsOptionSelector(props: SettingsOptionSelectorProps) {
  const tabs: UseChromeTabsReturn = useChromeTabs();

  const exists = (): boolean => {
    return props.option.selector.length > 0;
  };

  const handleOnClick = (): void => {
    tabs.sendMessage({
      code: MessageCode.SELECT_ELEMENT_OPTION,
      section: props.section,
      option: props.option,
    });

    if (props.onClick) {
      props.onClick();
    }

    window.close();
  };

  return (
    <button class="settings-option-selector" data-exists={exists()} onClick={handleOnClick}>
      <svg viewBox="0 96 960 960" width="1em" height="1em" fill="currentColor" class="settings-option-selector-icon">
        <path d="M450 1014v-75q-137-14-228-105T117 606H42v-60h75q14-137 105-228t228-105v-75h60v75q137 14 228 105t105 228h75v60h-75q-14 137-105 228T510 939v75h-60Zm30-134q125 0 214.5-89.5T784 576q0-125-89.5-214.5T480 272q-125 0-214.5 89.5T176 576q0 125 89.5 214.5T480 880Zm0-154q-63 0-106.5-43.5T330 576q0-63 43.5-106.5T480 426q63 0 106.5 43.5T630 576q0 63-43.5 106.5T480 726Zm0-60q38 0 64-26t26-64q0-38-26-64t-64-26q-38 0-64 26t-26 64q0 38 26 64t64 26Zm0-90Z" />
      </svg>
    </button>
  );
}
