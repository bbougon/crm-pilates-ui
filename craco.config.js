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
