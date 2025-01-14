import _ from 'lodash';
import {
  RuleTester,
} from 'eslint';
import config from '../../src';

const ruleTester = new RuleTester();

// eslint-disable-next-line no-process-env
(process.env.npm_config_rule ? process.env.npm_config_rule.split(',') : [
  'check-alignment',
  'check-examples',
  'check-indentation',
  'check-param-names',
  'check-syntax',
  'check-tag-names',
  'check-types',
  'implements-on-classes',
  'match-description',
  'newline-after-description',
  'no-types',
  'no-undefined-types',
  'require-description',
  'require-description-complete-sentence',
  'require-example',
  'require-hyphen-before-param-description',
  'require-jsdoc',
  'require-param',
  'require-param-description',
  'require-param-name',
  'require-param-type',
  'require-returns',
  'require-returns-check',
  'require-returns-description',
  'require-returns-type',
  'valid-types',
]).forEach((ruleName) => {
  const parserOptions = {
    ecmaVersion: 6,
  };

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const assertions = require(`./assertions/${_.camelCase(ruleName)}`);

  assertions.invalid = assertions.invalid.map((assertion) => {
    assertion.parserOptions = _.defaultsDeep(assertion.parserOptions, parserOptions);

    return assertion;
  });

  assertions.valid = assertions.valid.map((assertion) => {
    if (assertion.errors) {
      throw new Error(`Valid assertions for rule ${ruleName} should not have an \`errors\` array.`);
    }
    assertion.parserOptions = _.defaultsDeep(assertion.parserOptions, parserOptions);

    return assertion;
  });

  /* eslint-disable no-process-env */
  if (process.env.npm_config_invalid) {
    const indexes = process.env.npm_config_invalid.split(',');
    assertions.invalid = assertions.invalid.filter((assertion, idx) => {
      return indexes.includes(String(idx)) ||
        indexes.includes(String(idx - assertions.invalid.length));
    });
    if (!process.env.npm_config_valid) {
      assertions.valid = [];
    }
  }
  if (process.env.npm_config_valid) {
    const indexes = process.env.npm_config_valid.split(',');
    assertions.valid = assertions.valid.filter((assertion, idx) => {
      return indexes.includes(String(idx)) ||
        indexes.includes(String(idx - assertions.valid.length));
    });
    if (!process.env.npm_config_invalid) {
      assertions.invalid = [];
    }
  }
  /* eslint-enable no-process-env */

  ruleTester.run(ruleName, config.rules[ruleName], assertions);
});
