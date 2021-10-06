import chai from 'chai';
import {
  app,
  getBitStampCurrencyIdentifier,
  getUsdBalanceForACurrency,
  getTotalUsdBalanceForUser,
} from './index.js';
import axios from 'axios';
import sinon from 'sinon';
import chaiHttp from 'chai-http';

const { expect } = chai;
chai.use(chaiHttp);

describe('Test For User Balance', () => {
  let axiosStub;
  beforeEach(() => {
    axiosStub = sinon.stub(axios, 'get');
    axiosStub
      .withArgs('https://www.bitstamp.net/api/v2/ticker/ethusd')
      .resolves({
        data: {
          last: '3575.20',
        },
      });
    axiosStub
      .withArgs('https://www.bitstamp.net/api/v2/ticker/btcusd')
      .resolves({
        data: {
          last: '49830.75',
        },
      });
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('Integration Test For User Balance', () => {
    it('Should return 404 for invalid user id', (done) => {
      chai
        .request(app)
        .get('/user/balance/user-4')
        .end((err, res) => {
          expect(res).to.not.be.undefined;
          expect(res).to.have.status(404);
          expect(res.text).to.equal('user not found');
          done();
        });
    });
    it('Should return 200 for valid user id', (done) => {
      chai
        .request(app)
        .get('/user/balance/user-1')
        .end((err, res) => {
          expect(res).to.not.be.undefined;
          expect(res).to.have.status(200);
          done();
        });
    });
    it('Should return 500 for failed bitstamp request', (done) => {
      axiosStub
        .withArgs('https://www.bitstamp.net/api/v2/ticker/btcusd')
        .throws(new Error('Something Went Wrong'));
      chai
        .request(app)
        .get('/user/balance/user-1')
        .end((err, res) => {
          expect(res).to.not.be.undefined;
          expect(res).to.have.status(500);
          expect(res.text).to.not.be.undefined;
          expect(res.text).to.equal('Internal Sever Error');
          done();
        });
    });
  });

  describe('getTotalUsdBalanceForUser', () => {
    let userBalances;
    beforeEach(() => {
      userBalances = {
        'user-1': {
          BTC: '0.5',
          ETH: '2',
        },
        'user-2': {
          BTC: '0.1',
          ETH: '2',
        },
        'user-3': {
          ETH: '5',
        },
      };
    });
    it('should return correct balance for user with BTC and ETH', async () => {
      const result = await getTotalUsdBalanceForUser(userBalances['user-1']);
      expect(result).to.equal(32065.775); // (49830.75 * 0.5) + (3575.20  * 2)
    });
    it('should return correct balance for user with Single currency', async () => {
      const result = await getTotalUsdBalanceForUser(userBalances['user-3']);
      expect(result).to.equal(17876); // (3575.20 * 5)
    });
    it('should call bitstamp api twice for user with two currencies', async () => {
      await getTotalUsdBalanceForUser(userBalances['user-2']);
      expect(axiosStub.calledTwice).to.equal(true);
    });
    it('should return error as long as one currency retrieval fails', async () => {
      axiosStub
        .withArgs('https://www.bitstamp.net/api/v2/ticker/ethusd')
        .throws(new Error('Something went wrong'));

      const result = await getTotalUsdBalanceForUser(userBalances['user-2']);
      expect(result).to.not.be.undefined;
      expect(result.error).to.not.be.undefined;
      expect(result.error.message).to.equal('Something went wrong');
    });
  });

  describe('getUsdBalanceForACurrency', () => {
    it('should return correct value for BTC', async () => {
      axiosStub
        .withArgs('https://www.bitstamp.net/api/v2/ticker/btcusd')
        .resolves({
          data: {
            last: '49830.75',
          },
        });
      const result = await getUsdBalanceForACurrency('BTC');
      expect(result).to.equal(49830.75);
    });
    it('should return correct value for ETH', async () => {
      axiosStub
        .withArgs('https://www.bitstamp.net/api/v2/ticker/ethusd')
        .resolves({
          data: {
            last: '3575.20',
          },
        });

      const result = await getUsdBalanceForACurrency('ETH');
      expect(result).to.equal(3575.2);
    });
    it('should return error if response does not have last pice', async () => {
      axiosStub
        .withArgs('https://www.bitstamp.net/api/v2/ticker/ethusd')
        .resolves({
          data: {},
        });
      const result = await getUsdBalanceForACurrency('ETH');
      expect(result.error).to.not.be.undefined;
      expect(result.error.message).to.equal('No results for ethusd ticker');
    });
  });

  describe('getBitStampCurrencyIdentifier', () => {
    it('Should return valid currency identifier for upper case currency', () => {
      const result = getBitStampCurrencyIdentifier('BTC');
      expect(result).to.equal('btcusd');
    });
    it('Should return valid currency identifier for lower case currency', () => {
      const result = getBitStampCurrencyIdentifier('eth');
      expect(result).to.equal('ethusd');
    });
  });
});
