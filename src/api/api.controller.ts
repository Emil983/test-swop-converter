import { BadRequestException, Controller, Get, Param, ParseBoolPipe, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiService } from './api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ConvertRequest, ICurrency } from 'src/interfaces';
import { IsAllowedCurrency } from 'src/validators/currency/currency.pipe';

@Controller('api')
export class ApiController {
  constructor(
    private readonly apiService: ApiService) {}

  @Get('/currencies')
  async getCurrenciesList(@Query('forceUpdate') forceUpdate: boolean): Promise<ICurrency[]> {
    return this.apiService.getCurrencies(forceUpdate);
  }

  // Let's cache responses automatically
  // For this test it will be enough to use in-memory cache but Redis could be used as well as a storage
  @Get('/conversion')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10)
  async convertCurrency(@Query(IsAllowedCurrency) convertRequest: ConvertRequest) {
    try {
      const result = await this.apiService.convert(convertRequest.source, convertRequest.target, convertRequest.amount);    

      // we can get user's language from headers from accept-language but for this test task we will use local from OS
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;

      return Intl.NumberFormat(locale, { style: 'currency', currency: convertRequest.target }).format(
        result
      );
    } catch(err) {
      throw new BadRequestException('Unable to convert');
    }
  }
  
}
