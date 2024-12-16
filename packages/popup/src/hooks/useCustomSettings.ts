import { SectionState } from '@shared/enums/section-state';
import { OptionState } from '@shared/enums/option-state';
import { Section } from '@shared/interfaces/section';
import { CustomSection } from '@shared/interfaces/custom-section';
import { Option } from '@shared/interfaces/option';
import { CustomOption } from '@shared/interfaces/custom-option';

export interface UseCustomSettingsReturn {
  isCustomSection(section: Section | CustomSection): section is CustomSection;
  isCustomOption(option: Option | CustomOption): option is CustomOption;
  isSectionBeingEdited(section: Section | CustomSection): section is CustomSection;
  isOptionBeingEdited(option: Option | CustomOption): option is CustomOption;
  isOptionCreatorAvailable(section: Section | CustomSection): section is CustomSection;
  isOptionToggleAvailable(option: Option | CustomOption): boolean;
  hasOptionFunctionalityChanged(option: CustomOption): boolean;
}

export function useCustomSettings(): UseCustomSettingsReturn {
  const isCustomSection = (section: Section | CustomSection): section is CustomSection => {
    return 'custom' in section;
  };

  const isCustomOption = (option: Option | CustomOption): option is CustomOption => {
    return 'custom' in option;
  };

  const isSectionBeingEdited = (section: Section | CustomSection): section is CustomSection => {
    return isCustomSection(section) && (section.state === SectionState.INIT || section.state === SectionState.EDIT);
  };

  const isOptionBeingEdited = (option: Option | CustomOption): option is CustomOption => {
    return isCustomOption(option) && (option.state === OptionState.INIT || option.state === OptionState.EDIT);
  };

  const isOptionCreatorAvailable = (section: Section | CustomSection): section is CustomSection => {
    return isCustomSection(section)
      && section.state !== SectionState.INIT
      && !section.options.find((option: CustomOption): boolean => option.state === OptionState.INIT);
  };

  const isOptionToggleAvailable = (option: Option | CustomOption): boolean => {
    return !isCustomOption(option) || (isCustomOption(option) && !isOptionBeingEdited(option));
  };

  const hasOptionFunctionalityChanged = (option: CustomOption): boolean => {
    return option.previous && (option.selector !== option.previous.selector || option.style !== option.previous.style);
  };

  return {
    isCustomSection,
    isCustomOption,
    isSectionBeingEdited,
    isOptionBeingEdited,
    isOptionCreatorAvailable,
    isOptionToggleAvailable,
    hasOptionFunctionalityChanged,
  };
}
