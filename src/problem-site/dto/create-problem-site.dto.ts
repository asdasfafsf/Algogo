import { IsNotEmpty, IsString } from 'class-validator';
import { ExternalProvider } from '../../common/types/external.type';

export class CreateProblemSiteDto {
  @IsNotEmpty()
  @IsString()
  provider: ExternalProvider;

  @IsNotEmpty()
  @IsString()
  handle: string;
}
