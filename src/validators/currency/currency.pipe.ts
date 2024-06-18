import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ApiService } from 'src/api/api.service';
import { ConvertRequest } from 'src/interfaces';

/**Custom pipe to validate if currency is supported by API */
@Injectable()
export class IsAllowedCurrency implements PipeTransform {
  constructor(private readonly apiService: ApiService){}
  async transform(value: ConvertRequest, metadata: ArgumentMetadata) {
    
    if (!await this.apiService.isCurrencySupported(value.source) ||
      !await this.apiService.isCurrencySupported(value.source)) {
      throw new BadRequestException('Unsupported currency');
    }
    return value;
  }
}
