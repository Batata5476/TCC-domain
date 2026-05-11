import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('info_funcionario')
export class User {
  @PrimaryGeneratedColumn()
  pk_id_func: number;

  @Column()
  nome_func: string;

  /** CPF com NUMERIC(14) no banco — usar sempre como string na aplicação. */
  @Column({ type: 'numeric', precision: 14, scale: 0, unique: true })
  cpf_func: string;

  @Column({ select: false })
  senha_func: string;

  @Column()
  email_func: string;

  @Column({ default: 0 })
  pontos_acumulados: number;

  @Column({ nullable: true })
  foto_func: string;

  @Column()
  fk_cod_empresa: number;

  @Column()
  fk_id_setor: number;

  @Column()
  fk_id_cargo: number;
}
