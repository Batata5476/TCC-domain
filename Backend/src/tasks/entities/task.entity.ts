import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tarefas')
export class Task {
  @PrimaryGeneratedColumn()
  pk_id_tarefas: number;

  @Column({ type: 'date' })
  validade_tarefa: Date;

  @Column({ length: 30 })
  tipo_tarefa: string;

  @Column()
  prioridade_tarefa: number;

  @Column()
  status_tarefa: number;
}
