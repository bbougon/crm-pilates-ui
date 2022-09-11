const istanbul = require('vite-plugin-istanbul');
const constants = require('@storybook/addon-coverage/dist/cjs/constants');

module.exports = {
    "stories": ['../src/component/**/*.stories.@(js|jsx|ts|tsx)'],
    "addons": [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        '@storybook/addon-a11y',
        '@storybook/addon-coverage',
    ],
    "framework": "@storybook/react",
    "core": {
        "builder": "@storybook/builder-vite"
    },
    "features": {
        "storyStoreV7": true,
        "interactionsDebugger": true,
    },
    async viteFinal(config) {
        config.plugins.push(istanbul({
            exclude: [...constants.defaultExclude, '**/src/test-utils/**', '**src/features/**'],
            extension: constants.defaultExtensions
        }));
        // customize the Vite config here
        return config;
    },
}