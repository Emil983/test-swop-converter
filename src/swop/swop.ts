import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { map, lastValueFrom } from 'rxjs';
import { ICurrency, IRate } from 'src/interfaces';

const SWOP_BASE_REST_URL = 'https://swop.cx/rest';

@Injectable()
export class Swop {
    private API_KEY: string | undefined;
    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService
    ) {
        this.API_KEY = this.configService.get<string>('SWOP_API_KEY');
    }

    public async requestRates(source: string, target: string): Promise<IRate[]> {
        // So, on the Developer plan we are unable to get rates for specific currency so we have to request all of them
        let url = `${SWOP_BASE_REST_URL}/rates`;

        return lastValueFrom(this.httpService.
            get(url, { 
                headers: { "Authorization": `ApiKey ${this.API_KEY}`
            } }).pipe(
                map((axiosResponse: AxiosResponse) => {
                    return axiosResponse.data;
                })));
    }

    public async requestCurrencies(): Promise<ICurrency[]> {
        const url = `${SWOP_BASE_REST_URL}/currencies`;

        return lastValueFrom(this.httpService.
            get(url, { 
                headers: { "Authorization": `ApiKey ${this.API_KEY}` } 
            }).pipe(
                map((axiosResponse: AxiosResponse) => {
                    const data = axiosResponse.data;
                    return data.map((currency) => {
                        // we do not need all the fields from swop so let's take just some of them
                        return {
                            code: currency.code,
                            name: currency.name
                        };
                    });
                })));
    }

}
