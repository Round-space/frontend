export function getChainName(chainId: string){
    switch (true) {
        case (chainId == "1"): return "Ethereum Mainnet";
        case (chainId == "4"): return "Rinkeby";
        default: break;
    }
}