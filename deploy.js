const ethers = require("ethers");
const fs = require("fs");
const solc = require("solc");
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // alternative way
    const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");
    let wallet = new ethers.Wallet.fromEncryptedJsonSync(
        encryptedJson,
        process.env.PRIVATE_KEY_PASSWORD
    );
    wallet = wallet.connect(provider);
    const abi = fs.readFileSync("./Storage_sol_Storage.abi", "utf8");
    const binary = fs.readFileSync("./Storage_sol_Storage.bin", "utf8");
    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

    console.log("Deploying ... ");
    const contract = await contractFactory.deploy();
    // const contract = await contractFactory.deploy({ gasPrice: 100000000000 })

    // Wait for one block creation
    const deploymentReceipt = await contract.deployTransaction.wait(1);
    console.log("Contract depployed to " + contract.address);
    console.log("Transaction " + contract.deployTransaction);
    console.log("Deployment receipt " + deploymentReceipt);

    // Operations of the contract
    let favNum = await contract.retrieve();
    console.log("Current favorite number " + favNum);

    console.log("Updating favorite number to 15");
    let transactionResponse = await contract.store(15);
    let transactionReceipt = await transactionResponse.wait();
    favNum = await contract.retrieve();
    console.log("New favorite number " + favNum);
    console.log("Transaction receipt " + transactionResponse);
}

// Local Ganache should be runnning
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
