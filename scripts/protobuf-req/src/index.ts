import { OracleRequest } from "./gen/oracle-request_pb"

/* src/index.ts */
export const testPackage = () => {

    let req = new OracleRequest(
        {
            protocol:"http",
            method:"get",
            url:"https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD",
            path:"RAW.ETH.USD.PRICE"
        }
    )

    const bytes = req.toBinary();
    console.log(bytes.toString())

    let ora = OracleRequest.fromBinary(bytes);
    console.log(ora)

    return "Hello World!"
}

testPackage()