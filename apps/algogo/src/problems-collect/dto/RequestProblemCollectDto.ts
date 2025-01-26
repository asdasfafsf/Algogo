import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RequestProblemCollectDto {
    @IsString({
        message: '페이지 URL은 필수 입력 입니다.'
    })
    @IsNotEmpty({
        message: '페이지 URL은 필수 입력 입니다.'
    })
    @MaxLength(200, {
        message: '최대 길이 200을 넘을 수 없습니다.'
    })
    @ApiProperty({
        description: '수집할 페이지의 URL입니다. 올바른 URL 형식이어야 합니다.',
        example: 'https://example.com',
        required: true,
        type: String,
        format: 'url'
    })
    url: string;
}