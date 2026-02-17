import { substituteParams, saveSettingsDebounced } from '/script.js';
import { timestampToMoment } from '/scripts/utils.js';
import { extension_settings } from '/scripts/extensions.js';
import { t } from '/scripts/i18n.js';

/**
 * @type {MessageTimestampSettings}
 * @typedef {Object} MessageTimestampSettings
 * @property {boolean} enabled Whether the extension is enabled.
 * @property {string} timestampFormat The format for message timestamps.
 * @property {string} messageFormat The format for the entire message.
 */
const defaultSettings = Object.freeze({
    enabled: false,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
    messageFormat: '[{{timestamp}}] {{message}}',
});

/**
 * Gets the settings for the Message Timestamp extension, ensuring that all default values are set.
 * @returns {MessageTimestampSettings}
 */
function getSettings() {
    const settingsKey = 'messageTimestamp';
    if (!extension_settings[settingsKey]) {
        extension_settings[settingsKey] = structuredClone(defaultSettings);
    }

    for (const key of Object.keys(defaultSettings)) {
        if (!Object.hasOwn(extension_settings[settingsKey], key)) {
            extension_settings[settingsKey][key] = defaultSettings[key];
        }
    }

    return extension_settings[settingsKey];
}

/**
 * Intercepts message generation to add timestamps to messages.
 * @param {ChatMessage[]} chat Chat messages
 * @param {number} _contextSize Context size (not used)
 * @param {function} _abort Abort function (not used)
 * @param {string} _type Generation type (not used)
 */
globalThis.MessageTimestamp_interceptGeneration = function (chat, _contextSize, _abort, _type) {
    const settings = getSettings();
    if (!settings.enabled || !settings.timestampFormat || !settings.messageFormat) {
        return;
    }
    for (const message of chat) {
        if (Array.isArray(message.extra?.tool_invocations)) {
            continue;
        }
        if (typeof message.mes === 'string' && message.mes.length > 0) {
            const timestamp = timestampToMoment(message.send_date);
            if (timestamp.isValid()) {
                const formattedTimestamp = timestamp.format(settings.timestampFormat);
                message.mes = substituteParams(settings.messageFormat, {
                    dynamicMacros: {
                        timestamp: formattedTimestamp,
                        message: message.mes,
                    },
                });
            }
        }
    }
};

function addSettings() {
    const settings = getSettings();

    const settingsContainer = document.getElementById('message_timestamp_container') ?? document.getElementById('extensions_settings');
    if (!settingsContainer) {
        return;
    }

    const inlineDrawer = document.createElement('div');
    inlineDrawer.classList.add('inline-drawer');
    settingsContainer.append(inlineDrawer);

    const inlineDrawerToggle = document.createElement('div');
    inlineDrawerToggle.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const extensionName = document.createElement('b');
    extensionName.textContent = t`Message Timestamp`;

    const inlineDrawerIcon = document.createElement('div');
    inlineDrawerIcon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    inlineDrawerToggle.append(extensionName, inlineDrawerIcon);

    const inlineDrawerContent = document.createElement('div');
    inlineDrawerContent.classList.add('inline-drawer-content');

    inlineDrawer.append(inlineDrawerToggle, inlineDrawerContent);

    // Enabled
    const enabledCheckboxLabel = document.createElement('label');
    enabledCheckboxLabel.classList.add('checkbox_label', 'marginBot5');
    enabledCheckboxLabel.htmlFor = 'messageTimestampEnabled';
    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.id = 'messageTimestampEnabled';
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = settings.enabled;
    enabledCheckbox.addEventListener('change', () => {
        settings.enabled = enabledCheckbox.checked;
        saveSettingsDebounced();
    });
    const enabledCheckboxText = document.createElement('span');
    enabledCheckboxText.textContent = t`Enabled`;
    enabledCheckboxLabel.append(enabledCheckbox, enabledCheckboxText);
    inlineDrawerContent.append(enabledCheckboxLabel);

    // Timestamp format
    const timestampFormatLabel = document.createElement('label');
    timestampFormatLabel.htmlFor = 'messageTimestampFormat';
    timestampFormatLabel.textContent = t`Timestamp format`;
    const timestampFormatTextArea = document.createElement('textarea');
    timestampFormatTextArea.id = 'messageTimestampFormat';
    timestampFormatTextArea.rows = 2;
    timestampFormatTextArea.placeholder = t`Example: YYYY-MM-DD HH:mm:ss`;
    timestampFormatTextArea.value = settings.timestampFormat;
    timestampFormatTextArea.classList.add('text_pole', 'textarea_compact', 'autoSetHeight');
    timestampFormatTextArea.addEventListener('input', () => {
        settings.timestampFormat = timestampFormatTextArea.value;
        saveSettingsDebounced();
    });
    inlineDrawerContent.append(timestampFormatLabel, timestampFormatTextArea);

    // Message format
    const messageFormatLabel = document.createElement('label');
    messageFormatLabel.htmlFor = 'messageMessageFormat';
    messageFormatLabel.textContent = t`Message format`;
    const messageFormatTextArea = document.createElement('textarea');
    messageFormatTextArea.id = 'messageMessageFormat';
    messageFormatTextArea.rows = 2;
    messageFormatTextArea.placeholder = t`Example: [{{timestamp}}] {{message}}`;
    messageFormatTextArea.value = settings.messageFormat;
    messageFormatTextArea.classList.add('text_pole', 'textarea_compact', 'autoSetHeight');
    messageFormatTextArea.addEventListener('input', () => {
        settings.messageFormat = messageFormatTextArea.value;
        saveSettingsDebounced();
    });
    inlineDrawerContent.append(messageFormatLabel, messageFormatTextArea);
}

(function initExtension() {
    addSettings();
})();
