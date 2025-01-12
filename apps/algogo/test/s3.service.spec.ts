import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from '../src/s3/s3.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import s3Config from '../src/config/s3Config';
import { join } from 'path';
import { HttpModule, HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

describe('S3Service', () => {
  let service: S3Service;
  let httpService: HttpService;
  let s3Configuration: ConfigType<typeof s3Config>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          envFilePath: [join(__dirname, '../src/config/env/.development.env')],
          isGlobal: true,
          load: [s3Config],
        }),
      ],
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    httpService = module.get<HttpService>(HttpService);
    s3Configuration = module.get<ConfigType<typeof s3Config>>(s3Config.KEY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test for upload and verify', async () => {
    const str = `Hello this is test file! ${Math.random()}`;
    const buffer = Buffer.from(str);
    const uploadRes = await service.upload('test/test.txt', buffer);
    expect(uploadRes).toBeDefined();

    // s3Config를 사용하여 S3 버킷 및 지역 정보 가져오기
    const bucketName = s3Configuration.bucketName;
    const region = s3Configuration.region;
    const endpoint = s3Configuration.endpoint;
    const fileUrl = `${endpoint}/${bucketName}/test/test.txt`;
    // S3에서 파일을 가져와서 내용 확인
    const response = await firstValueFrom(httpService.get(fileUrl));
    const content = response.data;

    expect(content).toBe(str);
  });

  // 더 많은 테스트 케이스를 여기에 추가할 수 있습니다.
});
