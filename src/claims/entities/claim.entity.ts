import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('claims')
@Index(['finalized'])
@Index(['confidenceScore'])
@Index(['resolvedVerdict'])
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', nullable: true })
  resolvedVerdict: boolean | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    nullable: true,
  })
  confidenceScore: number | null;

  @Column({ default: false })
  finalized: boolean;
}

