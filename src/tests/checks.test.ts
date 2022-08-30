const checks = require("../middleware/checks");
const nodeMocks = require('node-mocks-http');


describe('Authenticate and validate Wallet Params', function () {


  let next = jest.fn();

  let req = nodeMocks.createRequest({
    headers: {
      "authorization": "authorizationToken",
      "origin": "http://localhost"

    },
    body: {
      "wallAddr": "wallAddr",
      "privKey": "privKey",
      "gasLimit": "gasLimit"
    },
  });

  let res = nodeMocks.createResponse({});


    afterAll(() => {
      // Restore old environment
      process.env.ACCESS_TOKEN = undefined;
      process.env.HOST_IP = undefined;
    });


    it('authenticate and validate wallet params success', function () {

      process.env.ACCESS_TOKEN = "authorizationToken";
      process.env.HOST_IP = "http://localhost";
      let result =checks.authenticateAndcheckWalletParams(req, res, next);
      console.log(result);
      //expect(result).toBe(7);   
    });

  });