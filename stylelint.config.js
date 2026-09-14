export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'no-empty-source': null,
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--(?:[a-z0-9]+(?:-[a-z0-9]+)*))?$',
      {
        message: 'Class selectors must use strict BEM naming.',
      },
    ],
  },
}
