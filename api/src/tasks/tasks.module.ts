import { Module } from '@nestjs/common';
import { InMemoryTaskRepository } from './repo/in-memory-task.repository';
import { TaskRepository } from './repo/task.repository';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TaskRepository,
      useClass: InMemoryTaskRepository,
    },
  ],
})
export class TasksModule {}
