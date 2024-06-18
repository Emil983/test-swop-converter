import { Test } from '@nestjs/testing';
import { IsAllowedCurrency } from './currency.pipe';
import { Swop } from 'src/swop/swop';
import { ApiService } from 'src/api/api.service';
import { CacheModule } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';

class SwopMock {

  public requestRates(){
    return 1;
  }

  public requestCurrencies() {
    
    return [{code:"EUR"},{code:"USD"}];
  }
}

describe('CurrencyPipe', () => {
  let apiService: ApiService;

  beforeEach(async () => {
    const swopProvider = {
      provide: Swop,
      useValue: new SwopMock(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [ApiService, swopProvider],
    }).compile();

    apiService = await moduleRef.resolve<ApiService>(ApiService);
  });
  
  it('should be defined', () => {
    expect(new IsAllowedCurrency(apiService)).toBeDefined();
  });

  it('should validate currencies', async () => {
    const validator = new IsAllowedCurrency(apiService);
    const res = await validator.transform({source:"USD", target:"EUR", amount:1}, null);
    expect(res).toBeDefined();
  });

  it('should reject unsupported currencies', async () => {
    const validator = new IsAllowedCurrency(apiService);
    try {
      const res = await validator.transform({ source: "XXX", target: "YYY", amount: 1 }, null);
    } catch (e) {
      expect(e).toEqual(new BadRequestException("Unsupported currency"));
    }    
  });
});
