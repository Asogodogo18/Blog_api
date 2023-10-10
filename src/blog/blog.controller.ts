import { Controller, Param, Post } from '@nestjs/common';

@Controller('blogs')
export class BlogController {
    @Post(":id")
    create(@Param('id') id){
        return `${id}`
    }
}
