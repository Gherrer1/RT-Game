module.exports = {
    "env": {
        "browser": true
    },
    "parser": "babel-eslint",
    "extends": ["airbnb", "plugin:jest/recommended"],
    "plugins": ["jest"],
    "rules": {
        "array-bracket-spacing": 0,
        "consistent-return": 1,
        "comma-dangle": ["error", {
            "functions": "ignore",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "arrays": "always-multiline",
        }],
        "indent": ["error", "tab"],
        "import/prefer-default-export": 1,
        "jsx-a11y/no-noninteractive-element-to-interactive-role": 0,
        "no-alert": 0,
        "no-param-reassign": [2, {"props": false}],
        "no-plusplus": 0,
        "no-tabs": 0,
        "no-underscore-dangle": 0,
        "object-curly-newline": 0,
        "react/forbid-prop-types": 0,
        "react/jsx-filename-extension": 0,
        "react/jsx-indent": [2, 'tab'],
        "react/jsx-indent-props": [2, 'tab'],
        "react/jsx-one-expression-per-line": 0,
        "react/no-array-index-key": 1
    }
};