import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reuniao')
export class Meeting {
  @PrimaryGeneratedColumn()
  pk_id_reuniao: number;

  @Column({ type: 'date' })
  data_reuniao: Date;

  @Column({ type: 'time' })
  horario_reuniao: string;

  @Column({ length: 100 })
  assunto_reuniao: string;

  @Column({ length: 30 })
  tipo_reuniao: string;
}
