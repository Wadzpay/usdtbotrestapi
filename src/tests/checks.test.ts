// const checks = require("../middleware/checks");
// const nodeMocks = require('node-mocks-http');


// describe('Authenticate and validate Wallet Params', function () {


//   let next = jest.fn();

//   let req = nodeMocks.createRequest({
//     headers: {
//       "authorization": "authorizationToken",
//       "origin": "http://localhost"

//     },
//     body: {
//       "wallAddr": "wallAddr",
//       "privKey": "privKey",
//       "gasLimit": "gasLimit"
//     },
//   });

//   let res = nodeMocks.createResponse({
//     status : 200
//   });


//     afterAll(() => {
//       // Restore old environment
//       process.env.ACCESS_TOKEN = undefined;
//       process.env.HOST_IP = undefined;
//     });


//     it('authenticate and validate wallet params success', function () {

//       process.env.ACCESS_TOKEN = "authorizationToken";
//       process.env.HOST_IP = "http://localhost";
//       checks.authenticateAndcheckWalletParams(req, res, next);
//       expect(res.statusCode).toBe(200);   
//     });

//     it('authentication failed', function () {

//       process.env.ACCESS_TOKEN = "authorizationTojdshhdwfken";
//       process.env.HOST_IP = "http://localhost";
//       checks.authenticateAndcheckWalletParams(req, res, next);
//       expect(res.statusCode).toBe(401);   
//     });

//     it('validate wallet params failed', function () {

//       process.env.ACCESS_TOKEN = "authorizationToken";
//       process.env.HOST_IP = "http://localhost";
//       req.body.wallAddr = null;
//       checks.authenticateAndcheckWalletParams(req, res, next);
//       expect(res.statusCode).toBe(400);   
//     });

//     it('authentication failed using host ip', function () {

//       process.env.ACCESS_TOKEN = "authorizationToken";
//       process.env.HOST_IP = "http://localh==ost";
//       checks.authenticateAndcheckWalletParams(req, res, next);
//       expect(res.statusCode).toBe(401);   
//     });

//   });