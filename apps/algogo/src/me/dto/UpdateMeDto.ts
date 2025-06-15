import { RequestUpdateMeDto } from './RequestUpdateMeDto';

export class UpdateMeDto extends RequestUpdateMeDto {
  userUuid: string;
  profilePhoto?: string;
  file?: Express.Multer.File;
}
