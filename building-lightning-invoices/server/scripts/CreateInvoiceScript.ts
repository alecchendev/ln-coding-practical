import { LndRpcClient } from "../src/data/lnd/v0.12.1-beta/LndRpcClient";
import { Options } from "../src/Options";

async function run() {
    // construct the options
    const options = await Options.fromEnv();

    // create the rpc client
    const lndRpcClient = new LndRpcClient(
        options.lndRpcHost,
        options.lndAdminMacaroon,
        options.lndCert,
    );

    // create the invoice
    return lndRpcClient.addInvoice({
        memo: "Demo invoice",
        amt: 1000,
    });
}

run().then(console.log).catch(console.error);
