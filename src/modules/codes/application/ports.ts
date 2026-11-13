import type { AccessCode } from '../domain/entities';

export interface CodeRepository {
  list(): AccessCode[];
  save(all: AccessCode[]): void;
}
