## Instructions To Run 

- `node index.js` to run server on `localhost:3000`
- `npm test` to run test suite


## Task

Create one API endpoint using Node and Express that takes in a user id and returns the user's total balance in USD.

Keep the user’s balances stored in memory. An example of the data to be stored is provided at the end of this section. Feel free to add more entries or change the way the data is stored if you want, but this is not necessary.

You will need to fetch the current prices from a third party public API. You can use the price from any cryptocurrency exchange but it is recommended that you use Bitstamp.

Here is a link to their API docs: https://www.bitstamp.net/api/#ticker

Assume that the only assets that the user’s balance can contain are BTC and ETH.

Ensure the API endpoint works correctly by writing at least one test case using the Mocha and Chai frameworks.

There is a test scaffold test.js that you can use and package.json has been changed so that npm run test will run the unit tests.

Aim to write clear and concise code.

```
const userBalances = {
"user-1": {
"BTC": "0.5",
"ETH": "2"
},
"user-2": {
"BTC": "0.1",
},
"user-3": {
"ETH": "5",
},
}
```
