import type { SupportRequest } from '../domain/entities';

export interface SupportRepository { list(): SupportRequest[]; save(list: SupportRequest[]): void }
