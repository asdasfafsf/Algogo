import { RequestUpdateMeDto } from './RequestUpdateMeDto';

export class UpdateMeDto extends RequestUpdateMeDto implements UserIdentifier {
  userNo: number;
  profilePhoto?: string;
  file?: Express.Multer.File;
}
