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

    @IsNotEmpty()
    @IsNumberString()
    amount: number;
}