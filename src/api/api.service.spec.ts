import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { Swop } from 'src/swop/swop';
import { CacheModule } from '@nestjs/cache-manager';
import exp from 'constants';

class SwopMock {

  public requestRates() {
    return [{ base_currency: "EUR", quote_currency:"USD", quote:1.07}];
  }

  public requestCurrencies() {

    return [{ code: "EUR" }, { code: "USD" }];
  }
}

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(async () => {
    const swopProvider = {
      provide: Swop,
      useValue: new SwopMock(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [ApiService, swopProvider]
    }).compile();

    service = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return list of currencies', async () => {
    const res = await service.getCurrencies(false);
    expect(res).toBeDefined();
    expect(res).toEqual([{ code: "EUR" }, { code: "USD" }]);
  });

  it('should convert currency', async () => {
    const res = await service.convert("EUR","USD", 1);
    expect(res).toBeDefined();
    expect(res).toEqual(1.07);
  });

  it('should not convert currency if there is no rate available', async () => {
    try {
      const res = await service.convert("GBP", "USD", 1);
    } catch(err) {
      expect(err).toEqual(new Error('Conversion rate is unavailable for a given source and target'));
    }
  });
});
