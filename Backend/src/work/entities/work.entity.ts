import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('entrada_saida')
export class Work {
  @PrimaryGeneratedColumn()
  pk_id_ponto: number;

  @Column({ type: 'time' })
  entrada: string;

  @Column({ type: 'time' })
  saida: string;

  @Column({ type: 'date' })
  data_ponto: Date;

  @Column({ type: 'time' })
  total_dia: string;

  @Column()
  fk_id_func: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'fk_id_func' })
  funcionario: User;
}
