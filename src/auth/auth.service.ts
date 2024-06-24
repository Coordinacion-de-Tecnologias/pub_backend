import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ){}

    async register({name, email, password}: RegisterDto){
        const user = await this.usersService.findOneByEmail(email);
        if(user){
            throw new BadRequestException('el usuario ya existe');
        }
        return await this.usersService.create({
            name, 
            email, 
            password: await bcrypt.hash(password, 10)
        })
    }

    async login({email, password}: LoginDto){
        const user = await this.usersService.findOneByEmail(email) ;
        if(!user){
            throw new UnauthorizedException('Email no es correcto');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const payload = {email: user.email}

        const token = await this.jwtService.signAsync(payload);

        return {
            token,
            email
        };
    }
}
