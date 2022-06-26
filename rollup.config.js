const visualizer = require("rollup-plugin-visualizer");

module.exports = {
    plugins: [
        // put it the last one
        visualizer()
    ]
}