import merge from 'lodash.merge'
import typescript from 'rollup-plugin-typescript2'

const NAME = `query-etherpad`

const baseConfig = {
  input: `src/${NAME}.ts`,
  output: {
    format: `cjs`,
  },
  external: [
    `request-promise-native`,
    `http-errors`,
    `util`,
    `compare-versions`,
    `url`,
    'is-url',
  ],
}

const npmConfig = merge({}, baseConfig, {
  output: {
    file: `dist/${NAME}.js`,
  },
  plugins: [typescript()],
})

export default [npmConfig]
