module.exports = {
  presets: [
    [
      'next/babel',

      {
        'preset-env': {
          targets: 'defaults, not IE 11',
          useBuiltIns: false
        }
      }
    ]
  ],

  plugins: []
}
