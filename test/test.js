const { assert } = require('chai')

const Socialscoop = artifacts.require('./Socialscoop.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Socialscoop', ([deployer, author, tipper]) => {
  let socialscoop

  before(async () => {
    socialscoop = await Socialscoop.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await socialscoop.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await socialscoop.name()
      assert.equal(name, 'Socialscoop')
    })
  })

  describe('images', async () => {
    let result;
    let imageCount;
    const hash = 'abc123'

    before(async () => {
      result = await socialscoop.uploadImage(hash, 'Image description', { from: author })
      imageCount = await socialscoop.imageCount()
    })

    it('creates images', async () => {
      //Success
      assert.equal(imageCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Image description', 'description is correct')
      assert.equal(event.tipamount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      //Failure : Incase image does not have hash
      await socialscoop.uploadImage('', 'Image description', { from: author }).should.be.rejected;

      //Failure : Incase images does not have decription
      await socialscoop.uploadImage(hash, '', { from: author }).should.be.rejected;
    })

    //check from Image struct
    it('lists images', async () => {
      const image = await socialscoop.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(image.hash, hash, 'Hash is correct')
      assert.equal(image.description, 'Image description', 'description is correct')
      assert.equal(image.tipamount, '0', 'tip amount is correct')
      assert.equal(image.author, author, 'author is correct')
    })
    it('allows users to tip images', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await socialscoop.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Image description', 'description is correct')
      assert.equal(event.tipamount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1', 'Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      // FAILURE: Tries to tip a image that does not exist
      await socialscoop.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })

  })
})