import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidence } from './entities/evidence.entity';
import { EvidenceVersion } from './entities/evidence-version.entity';

@Injectable()
export class EvidenceService {
  constructor(
    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,
    @InjectRepository(EvidenceVersion)
    private readonly evidenceVersionRepository: Repository<EvidenceVersion>,
  ) {}

  /**
   * Create new evidence for a claim
   */
  async createEvidence(claimId: string, cid: string): Promise<Evidence> {
    const evidence = this.evidenceRepository.create({
      claimId,
      latestVersion: 1,
    });
    const savedEvidence = await this.evidenceRepository.save(evidence);

    // Create first version
    const version = this.evidenceVersionRepository.create({
      evidenceId: savedEvidence.id,
      version: 1,
      cid,
    });
    await this.evidenceVersionRepository.save(version);

    return savedEvidence;
  }

  /**
   * Add a new version to existing evidence
   */
  async addEvidenceVersion(evidenceId: string, cid: string): Promise<EvidenceVersion> {
    const evidence = await this.evidenceRepository.findOneBy({ id: evidenceId });
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${evidenceId} not found`);
    }

    const newVersion = evidence.latestVersion + 1;
    evidence.latestVersion = newVersion;
    await this.evidenceRepository.save(evidence);

    const version = this.evidenceVersionRepository.create({
      evidenceId,
      version: newVersion,
      cid,
    });
    return this.evidenceVersionRepository.save(version);
  }

  /**
   * Get evidence with all versions
   */
  async getEvidence(evidenceId: string): Promise<Evidence | null> {
    return this.evidenceRepository.findOne({
      where: { id: evidenceId },
      relations: ['versions'],
      order: { versions: { version: 'ASC' } },
    });
  }

  /**
   * Get latest version of evidence
   */
  async getLatestEvidenceVersion(evidenceId: string): Promise<EvidenceVersion | null> {
    const evidence = await this.evidenceRepository.findOneBy({ id: evidenceId });
    if (!evidence) {
      return null;
    }

    return this.evidenceVersionRepository.findOne({
      where: { evidenceId, version: evidence.latestVersion },
    });
  }

  /**
   * Get all evidence for a claim
   */
  async getEvidenceForClaim(claimId: string): Promise<Evidence[]> {
    return this.evidenceRepository.find({
      where: { claimId },
      relations: ['versions'],
      order: { createdAt: 'ASC', versions: { version: 'ASC' } },
    });
  }

  /**
   * Get latest evidence version for a claim (assuming one evidence per claim for simplicity)
   */
  async getLatestEvidenceForClaim(claimId: string): Promise<EvidenceVersion | null> {
    const evidences = await this.getEvidenceForClaim(claimId);
    if (evidences.length === 0) {
      return null;
    }

    // Assuming one evidence per claim, get the latest version
    const evidence = evidences[0];
    return this.evidenceVersionRepository.findOne({
      where: { evidenceId: evidence.id, version: evidence.latestVersion },
    });
  }
}