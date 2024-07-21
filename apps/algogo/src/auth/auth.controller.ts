import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    @Get('/token')
    async token() {

    }
}
