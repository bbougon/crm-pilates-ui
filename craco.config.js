const {when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES} = require("@craco/craco");

module.exports = {
    reactScriptsVersion: "react-scripts",
    webpack: {
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: [/.(js|jsx)$/, /.(ts|tsx)$/],
                    exclude: [
                        './src/test-utils/'
                    ]
                }
            ]
        }
    }
}
