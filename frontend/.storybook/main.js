const custom = require('../webpack.config.js')
console.log(custom)
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "presets": ["@storybook/preset-scss"],
  "rules": custom.module.rules
}