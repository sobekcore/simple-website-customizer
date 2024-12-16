import { JSX, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { MessageCode } from '@shared/enums/message-code';
import { CustomSection } from '@shared/interfaces/custom-section';
import { CustomOption } from '@shared/interfaces/custom-option';
import { UseChromeTabsReturn, useChromeTabs } from '@shared/hooks/useChromeTabs';
import { UseComponentUpdateReturn, useComponentUpdate } from '@popup/hooks/useComponentUpdate';
import { SettingsCreatorField } from '@popup/components/Creators/SettingsCreatorField';
import '@popup/styles/settings-option/settings-option-selector.scss';

interface SettingsOptionSelectorProps {
  section: CustomSection;
  option: CustomOption;
  touched: boolean;
  onClick?: Function;
  onChange?: Function;
}

export default function SettingsOptionSelector(props: SettingsOptionSelectorProps) {
  const componentUpdate: UseComponentUpdateReturn = useComponentUpdate();
  const tabs: UseChromeTabsReturn = useChromeTabs();

  const [touched, setTouched] = useState<boolean>(false);

  useEffect((): void => {
    setTouched(props.touched);
  }, [props.touched]);

  const valid = (): boolean => {
    if (!touched) {
      return true;
    }

    return props.option.selector.length > 0;
  };

  const handleOnClick = (): void => {
    tabs
      .sendMessage({
        code: MessageCode.SELECT_ELEMENT_OPTION,
        section: props.section,
        option: props.option,
      }, true)
      .then((): void => {
        if (props.onClick) {
          props.onClick();
        }
      });
  };

  const handleOnInput = (event: JSX.TargetedEvent<HTMLInputElement, InputEvent>): void => {
    props.option.selector = event.currentTarget.value;
    componentUpdate.forceUpdate();
  };

  const handleOnChange = (custom: boolean): void => {
    props.option.customSelector = custom;
    componentUpdate.forceUpdate();

    if (props.onChange) {
      props.onChange();
    }
  };

  return (
    <SettingsCreatorField
      custom={props.option.customSelector}
      onChange={handleOnChange}
    >
      {props.option.customSelector ? (
        <input
          type="text"
          value={props.option.selector}
          placeholder="Your element selector..."
          class="settings-option-selector-input"
          data-valid={valid()}
          onInput={handleOnInput}
        />
      ) : (
        <button
          type="button"
          class="settings-option-selector-button"
          data-valid={valid()}
          onClick={handleOnClick}
        >
          <div class="settings-option-selector-input">
            {props.option.selector ? props.option.selector : 'Click to select element...'}
          </div>
        </button>
      )}
    </SettingsCreatorField>
  );
}
