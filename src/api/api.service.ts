import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { Cache } from 'cache-manager';
import { ICurrency, IRate } from 'src/interfaces';
import { Swop } from 'src/swop/swop';


const CACHE_CURRENCIES_KEY = 'CACHE_CURRENCIES_KEY';
const CACHE_CURRENCIES_RATES_BASE_KEY = 'CACHE_CURRENCIES_RATES_BASE_KEY';
const CACHE_CURRENCIES_NAMES_KEY = 'CACHE_CURRENCIES_NAMES_KEY';
const CACHE_CURRENCIES_TTL = 60 * 60 * 1000; // one hour

@Injectable()
export class ApiService {
    private readonly logger = new Logger(ApiService.name);
    constructor(
        private swop: Swop,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        
    }

    public async isCurrencySupported(name: string) {
        // Let's check if we have list of currencies in cache
        let currenciesList: string[] = await this.cacheManager.get<string[]>(CACHE_CURRENCIES_NAMES_KEY);
        if (!currenciesList) {
            // if not then we will query them
            try {
                const currencies = await this.getCurrencies(false);
                // now we can re-read it from cache as value will be there but let's use this data
                // plus it will be easier to test this method (for this test task)
                currenciesList = currencies.map((item) => item.code);
            } catch(err) {
                this.logger.error(err);

                return false;
            }
        }

        return !!currenciesList.find((item)=>item === name);
    }

    public async getCurrencies(forceUpdate: boolean): Promise<ICurrency[]> {
        // By default we are going to read list of currencies from cache
        // as there is no sense to request it each time
        if (!forceUpdate) {
            const data = await this.cacheManager.get<ICurrency[]>(CACHE_CURRENCIES_KEY);
            if (data) {
                return data;
            }
        }
        // if there is no data in the cache that we should request it
        try {
            const result = await this.swop.requestCurrencies();
            const currenciesNames = result.map((item) => item.code);
            // Let's save new list into our cache
            await this.cacheManager.set(CACHE_CURRENCIES_KEY, result, CACHE_CURRENCIES_TTL);
            // And let's save separately only names as we will need them to validate params
            await this.cacheManager.set(CACHE_CURRENCIES_NAMES_KEY, currenciesNames, CACHE_CURRENCIES_TTL);
            
            return result;
        }
        catch (err) {
            this.logger.error(err);
            return [];
        }

    }

    public async convert(source: string, target: string, amount: number) {
        // Let's check if we have this rate in our cache if not then we will request it
        let allRates = await this.cacheManager.get<IRate[]>(`${CACHE_CURRENCIES_RATES_BASE_KEY}`);
        if (!allRates) {
            try {
                allRates = await this.swop.requestRates(source, target);

                // let's cache it
                await this.cacheManager.set(`${CACHE_CURRENCIES_RATES_BASE_KEY}`, allRates, CACHE_CURRENCIES_TTL);
            } catch(err) {
                this.logger.error(err);
            }
        }

        const singleRate = allRates.find((item) => item.base_currency == source && item.quote_currency == target);
        if (singleRate) {
            const result = singleRate.quote * amount;

            return result;
        } else {
            this.logger.error(`Unable to find conversion rate for ${source}, ${target}}`);
            throw new Error('Conversion rate is unavailable for a given source and target');
        }
    }
}
