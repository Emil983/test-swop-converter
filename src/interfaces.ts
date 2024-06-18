import { IsNotEmpty, IsNumberString, IsString, Validate } from "class-validator";

export interface ICurrency {
    code: string;
    name: string;
}

export interface IRate {
    base_currency: string;
    quote_currency: string;
    quote: number;
}

export class ConvertRequest {
    @IsNotEmpty()
    @IsString()
    source: string;

    @IsNotEmpty()
    @IsString()
    target: string;
// in real life there should be more sofisticated validation for the amount as that is definitely not enough to validate only if that is number
    @IsNotEmpty()
    @IsNumberString()
    amount: number;
}
