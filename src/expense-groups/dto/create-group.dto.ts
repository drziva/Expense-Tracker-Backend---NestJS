import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    description: string
}