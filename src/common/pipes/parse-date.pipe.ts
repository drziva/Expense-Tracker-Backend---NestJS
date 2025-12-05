import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseDatePipe implements PipeTransform {
  transform(value: string) {
    if (!value) return undefined;

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }

    return date;
  }
}
