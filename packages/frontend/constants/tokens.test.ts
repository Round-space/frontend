import { SupportedChainId } from './chains'
import { AikidoCurrency } from './tokens'


describe('tokens', () => {



    it('Should Create Polygon Item', () => {  
    
        const mumbayItem= AikidoCurrency.getChainCurrency(SupportedChainId.POLYGON_MUMBAI);
        expect(mumbayItem.symbol).toBe('MATIC');
        expect(mumbayItem.name).toBe('Matic');
        expect(mumbayItem.pricingToken).not.toBeNull();

    })

    it('Should Create Polygon Item Singleton ', () => {      
        const mumbayItem= AikidoCurrency.getChainCurrency(SupportedChainId.POLYGON_MUMBAI);
        const mumbayItemAgain= AikidoCurrency.getChainCurrency(SupportedChainId.POLYGON_MUMBAI);
        expect(mumbayItem === mumbayItemAgain).toBeTruthy();
    })

    it('Should Create Rinkeby and Mainnet ', () => {      
        const MainnetEther= AikidoCurrency.getChainCurrency(SupportedChainId.MAINNET);
        expect(MainnetEther).toBeDefined();
        const RinkebyEther= AikidoCurrency.getChainCurrency(SupportedChainId.RINKEBY);
        expect(RinkebyEther).toBeDefined();

    })


})
