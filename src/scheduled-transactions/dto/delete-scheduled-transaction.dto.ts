import { ApiProperty } from "@nestjs/swagger";

export class DeleteScheduledTransactionResponse {
  @ApiProperty({
    example: true,
    description: 'Indicates whether the deletion was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 12,
    description: 'ID of the deleted scheduled transaction',
  })
  id: number;
}
