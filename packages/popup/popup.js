import { options } from "~/extension.config";
import { searchSettingsFromInput } from "popup/modules/search";
import { parse } from "popup/modules/dom";
import SectionComponent from "popup/components/Section";

/**
 * Constant that defines a small delay for a script. This fixes a unnecessary
 * animation launches when there is a condition race between transitions.
 *
 * @type {number}
 * @constant
 */
const animationFixDelay = 20;

/**
 * @param {HTMLElement} toTriggerElement
 * @param {boolean} optionElement
 * @returns {void}
 */
const visualizeToggles = (element, loadDataOnly = false) => {
  let cover = element.previousElementSibling;
  let toggleSwitch = cover.querySelector(".extension-setting-toggle-switch");

  if (loadDataOnly) {
    cover.style["transition"] = "none";
    toggleSwitch.style["transition"] = "none";

    // Remove inline transitions after a small timeout, this brings
    // back original animations from the extension stylesheet.
    setTimeout(() => {
      cover.style["transition"] = null;
      toggleSwitch.style["transition"] = null;
    }, animationFixDelay);
  }

  if (element.checked) {
    toggleSwitch.style["margin-left"] = "var(--toggle-height)";
    cover.style["border-color"] = "var(--branding-color)";
    cover.style["background"] = "var(--branding-color)";
  } else {
    toggleSwitch.style["margin-left"] = "0";
    cover.style["border-color"] = "var(--toggle-secondary-color)";
    cover.style["background"] = "var(--toggle-secondary-color)";
  }
};

/**
 * @param {HTMLElement} toTriggerElement
 * @param {HTMLElement} optionElement
 * @returns {boolean}
 */
const triggerDependent = (toTriggerElement, optionElement) => {
  toTriggerElement.disabled = !optionElement.checked;

  let toggle = toTriggerElement.parentElement;
  toggle.setAttribute("data-disabled", !optionElement.checked);

  if (toTriggerElement.disabled && toTriggerElement.checked) {
    toTriggerElement.checked = false;

    let changeEvent = new Event("change");
    changeEvent.customTarget = optionElement;

    visualizeToggles(toTriggerElement);
    toTriggerElement.dispatchEvent(changeEvent);

    return true;
  }

  return false;
};

/**
 * @returns {void}
 */
 const generateSettingsFromConfig = () => {
  const settings = document.querySelector(".extension-settings");

  // Helper for template literal HTML string constructor
  window.html = String.raw;

  for (let section of options) {
    if (section.settings.length === 0) {
      continue;
    }

    const params = { title: section.title, settings: section.settings };
    let sectionElement = parse(SectionComponent(params));
    settings.append(...sectionElement);
  }
};

/**
 * @returns {void}
 */
const initializePopupSettings = () => {
  for (let section of options) {
    if (section.settings.length === 0) {
      continue;
    }

    for (let option of section.settings) {
      option.element = document.querySelector(`#${option.id}`);
      option.value = false;

      chrome.storage.local.get(option.name, (storage) => {
        option.value = storage[option.name];
        option.element.checked = option.value;

        let changeEvent = new Event("change");
        changeEvent.customTarget = option.element;
        changeEvent.loadDataOnly = true;

        visualizeToggles(option.element, true);
        option.element.dispatchEvent(changeEvent);
      });

      option.element.addEventListener("click", (event) => {
        visualizeToggles(event.target);
      });

      option.element.addEventListener("change", (event) => {
        const target = event.target ? event.target : event.customTarget;
        const option = section.settings.find((option) => option.element === target);
        let timeout = 0;

        if (option.triggers) {
          for (let trigger of option.triggers) {
            let toTrigger = section.settings.find((option) => option.name === trigger);
            let unchecked = triggerDependent(toTrigger.element, option.element);
            if (unchecked) timeout = animationFixDelay;
          }
        }

        setTimeout(() => {
          if (!event.loadDataOnly) {
            option.value = !option.value;
            chrome.storage.local.set({ [option.name]: option.value });
          }

          const params = {
            active: true,
            currentWindow: true,
          };

          chrome.tabs.query(params, (tabs) => {
            const [ currentTab ] = tabs;
            const message = {
              event: event,
              name: option.name,
              value: option.value,
            };

            chrome.tabs.sendMessage(currentTab.id, message);
          });
        }, timeout);
      });
    }
  }
};

generateSettingsFromConfig();
initializePopupSettings();
searchSettingsFromInput();
