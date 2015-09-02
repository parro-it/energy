let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const energy = require(moduleRoot);

describe('energy', () => {
  it('works', async () => {
    const result = await energy();
    result.should.be.equal(42);
  });
});

