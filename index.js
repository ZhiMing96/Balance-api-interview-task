import express from 'express';
import axios from 'axios';

export const app = express();
const port = 3000;

const userBalances = {
  'user-1': {
    BTC: '0.5',
    ETH: '2',
  },
  'user-2': {
    BTC: '0.1',
  },
  'user-3': {
    ETH: '5',
  },
};

app.get('/', (req, res) => {
  const response = [
    {
      resource: 'User Balance',
      url: '/user/balance/:user_id',
      description: 'Get total balance for a user in USD',
    },
  ];
  return res.json(response);
});

app.get('/user/balance/:user_id', async (req, res) => {
  const { user_id } = req.params;
  if (!userBalances[user_id]) return res.status(404).send('user not found');
  const totalBalance = await getTotalUsdBalanceForUser(userBalances[user_id]);
  if (!totalBalance || (totalBalance && totalBalance.error))
    return res.status(500).send('Internal Sever Error');

  return res.status(200).json(totalBalance);
});

export const getTotalUsdBalanceForUser = async (userBalance) => {
  let totalUsdAmount = 0;

  for await (let currency of Object.keys(userBalance)) {
    const usdBalance = await getUsdBalanceForACurrency(currency);
    if (usdBalance && usdBalance.error) return usdBalance;
    totalUsdAmount += userBalance[currency] * usdBalance;
  }
  return totalUsdAmount;
};

export const getUsdBalanceForACurrency = async (currency) => {
  const usdPair = getBitStampCurrencyIdentifier(currency);
  try {
    const { data } = await axios.get(
      `https://www.bitstamp.net/api/v2/ticker/${usdPair}`
    );
    if (!data || !data.last)
      throw new Error(`No results for ${usdPair} ticker`);
    const lastTickerPrice = data.last;
    return parseFloat(lastTickerPrice);
  } catch (e) {
    console.error(e);
    return { error: e };
  }
};

export const getBitStampCurrencyIdentifier = (currency) => {
  return currency.toLowerCase() + 'usd';
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
