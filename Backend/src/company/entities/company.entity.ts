import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('info_empresa')
export class Company {
  @PrimaryGeneratedColumn()
  pk_cod_empresa: number;

  @Column({ unique: true })
  cnpj_empresa: string;

  @Column()
  nome_empresa: string;

  @Column()
  email_empresa: string;

  @Column()
  tipo_empresa: string;

  @Column()
  senha_empresa: string;
}
