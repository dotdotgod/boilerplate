import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find({
      relations: {
        oauths: true,
      },
    });
  }

  findOne(uuid: string) {
    return this.userRepository.findOne({
      where: { uuid },
      relations: {
        oauths: true,
      },
    });
  }

  remove(uuid: string) {
    return this.userRepository.softDelete(uuid);
  }

  create(user: CreateUserDto) {
    return this.userRepository.save(user);
  }

  update(uuid: string, user: UpdateUserDto) {
    return this.userRepository.update({ uuid }, user);
  }
}
