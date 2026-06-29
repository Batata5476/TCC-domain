import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('empresa')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  tipo_empresa: string;
}
