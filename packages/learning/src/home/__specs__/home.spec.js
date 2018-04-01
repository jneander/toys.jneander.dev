import React from 'react'

import Home from '..'

describe('Home', () => {
  const testbed = new Testbed(<Home />)

  it('mounts', () => {
    const component = testbed.render()
    expect(component.length).to.equal(1)
  })
})
