
export enum TargetChain {
    bsc = 'bsc',
    bsc_test = 'bsc_test',
    avax = 'avax',
    avax_test = 'avax_test',
    fantom = 'fantom',
    fantom_test = 'fantom_test',
    arbitrum = 'arbitrum',
    arbitrum_test= 'arbitrum_test',
    polygon = 'polygon',
    polygon_test= 'polygon_test',
    
    goerli = 'goerli',
    eth = 'eth',
    local = 'local'

}

export enum ChainId {
    bsc = '56',
    bsc_test = '97',
    avax = '43114',
    avax_test=  '43113',
    fantom = '250',
    fantom_test = '4002',
    arbitrum = '42161',
    arbitrum_test= '421613',
    polygon = '137',
    polygon_test= '80001',

    goerli = '5',
    eth = '1', 
    local = '1222'
}
export const TARGET_CHAIN_TO_CHAIN_ID: Record<TargetChain, ChainId> = {

    [TargetChain.bsc]: ChainId.bsc,
    [TargetChain.bsc_test]: ChainId.bsc_test,
    [TargetChain.avax]: ChainId.avax,
    [TargetChain.avax_test]: ChainId.avax_test,
    [TargetChain.fantom]: ChainId.fantom,
    [TargetChain.fantom_test]: ChainId.fantom_test,
    [TargetChain.arbitrum]: ChainId.arbitrum,
    [TargetChain.arbitrum_test]: ChainId.arbitrum_test,
    [TargetChain.polygon]: ChainId.polygon,
    [TargetChain.polygon_test]: ChainId.polygon_test,

    [TargetChain.goerli]: ChainId.goerli,
    [TargetChain.eth]: ChainId.eth,
    [TargetChain.local]: ChainId.local

}

export const TARGET_CHAIN_TO_URL: Record<TargetChain, string> = {

    [TargetChain.bsc]: 'https://bsc-dataseed1.ninicoin.io',
    [TargetChain.bsc_test]: 'https://data-seed-prebsc-2-s1.binance.org:8545',

    [TargetChain.avax]: 'https://avalanche.drpc.org',
    [TargetChain.avax_test]: 'https://avalanche-fuji-c-chain.publicnode.com',
    [TargetChain.fantom]: 'https://fantom.publicnode.com',
    [TargetChain.fantom_test]: 'https://fantom.api.onfinality.io/public',
    [TargetChain.arbitrum]: 'https://arbitrum.drpc.org',
    [TargetChain.arbitrum_test]: 'https://arbitrum-goerli.publicnode.com',
    [TargetChain.polygon]: 'https://polygon-pokt.nodies.app',
    [TargetChain.polygon_test]: 'wss://polygon-mumbai-bor.publicnode.com',


    [TargetChain.goerli]: 'https://goerli.infura.io/v3/',
    [TargetChain.eth]: 'https://mainnet.infura.io/v3/',
    [TargetChain.local]: 'http://localhost:8545'

}
export const TARGET_CHAIN_TO_WETH: Record<TargetChain, string> = {

    [TargetChain.bsc]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    [TargetChain.bsc_test]: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    [TargetChain.avax]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    [TargetChain.avax_test]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    [TargetChain.fantom]: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    [TargetChain.fantom_test]: 'https://fantom.api.onfinality.io/public',
    [TargetChain.arbitrum]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    [TargetChain.arbitrum_test]: 'https://arbitrum-goerli.publicnode.com',
    [TargetChain.polygon]: '0x0000000000000000000000000000000000001010',
    [TargetChain.polygon_test]: 'wss://polygon-mumbai-bor.publicnode.com',

    [TargetChain.goerli]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    [TargetChain.eth]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [TargetChain.local]: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'

}
export const TARGET_CHAIN_TO_UNIT: Record<TargetChain, string> = {

    [TargetChain.bsc]: 'BNB',
    [TargetChain.bsc_test]: 'BNB',
    [TargetChain.avax]: 'AVAX',
    [TargetChain.avax_test]: 'AVAX',
    [TargetChain.fantom]: 'FTM',
    [TargetChain.fantom_test]: 'FTM',
    [TargetChain.arbitrum]: 'ETH',
    [TargetChain.arbitrum_test]: 'ETH',
    [TargetChain.polygon]: 'MATIC',
    [TargetChain.polygon_test]: 'MATIC',

    [TargetChain.goerli]: 'ETH',
    [TargetChain.eth]: 'ETH',
    [TargetChain.local]: 'LOCAL',

}


