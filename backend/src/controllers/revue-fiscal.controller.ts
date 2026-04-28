import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RevueFiscalEval, RevueFiscalPriority } from '@prisma/client';

interface CreateCompanyRequest {
  name: string;
  sector?: string;
  exercice?: string;
  reviseur?: string;
  chef?: string;
  niu?: string;
}

interface UpdateQuestionStateRequest {
  companyId: string;
  questionId: string;
  eval?: RevueFiscalEval;
  note?: string;
  renvoi?: string;
  priority?: RevueFiscalPriority;
}

export class RevueFiscalController {
  async getCompanies(req: Request, res: Response) {
    try {
      const companies = await prisma.revueFiscalCompany.findMany({
        include: {
          questionStates: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  }

  async createCompany(req: Request, res: Response) {
    try {
      const { name, sector, exercice, reviseur, chef, niu }: CreateCompanyRequest = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Company name is required' });
      }

      const company = await prisma.revueFiscalCompany.create({
        data: {
          name,
          sector,
          exercice,
          reviseur,
          chef,
          niu,
        },
      });

      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ error: 'Failed to create company' });
    }
  }

  async getCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const company = await prisma.revueFiscalCompany.findUnique({
        where: { id },
        include: {
          questionStates: true,
        },
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, sector, exercice, reviseur, chef, niu }: CreateCompanyRequest = req.body;

      const company = await prisma.revueFiscalCompany.update({
        where: { id },
        data: {
          name,
          sector,
          exercice,
          reviseur,
          chef,
          niu,
        },
      });

      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Company not found' });
      } else {
        res.status(500).json({ error: 'Failed to update company' });
      }
    }
  }

  async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.revueFiscalCompany.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting company:', error);
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Company not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete company' });
      }
    }
  }

  async updateQuestionState(req: Request, res: Response) {
    try {
      const { companyId, questionId, eval: evalValue, note, renvoi, priority }: UpdateQuestionStateRequest = req.body;

      if (!companyId || !questionId) {
        return res.status(400).json({ error: 'Company ID and Question ID are required' });
      }

      const questionState = await prisma.revueFiscalQuestionState.upsert({
        where: {
          companyId_questionId: {
            companyId,
            questionId,
          },
        },
        update: {
          eval: evalValue,
          note,
          renvoi,
          priority,
        },
        create: {
          companyId,
          questionId,
          eval: evalValue,
          note,
          renvoi,
          priority,
        },
      });

      res.json(questionState);
    } catch (error) {
      console.error('Error updating question state:', error);
      res.status(500).json({ error: 'Failed to update question state' });
    }
  }

  async bulkUpdateQuestionStates(req: Request, res: Response) {
    try {
      const updates: UpdateQuestionStateRequest[] = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates must be an array' });
      }

      const results = await Promise.all(
        updates.map(async (update) => {
          const { companyId, questionId, eval: evalValue, note, renvoi, priority } = update;

          return prisma.revueFiscalQuestionState.upsert({
            where: {
              companyId_questionId: {
                companyId,
                questionId,
              },
            },
            update: {
              eval: evalValue,
              note,
              renvoi,
              priority,
            },
            create: {
              companyId,
              questionId,
              eval: evalValue,
              note,
              renvoi,
              priority,
            },
          });
        })
      );

      res.json(results);
    } catch (error) {
      console.error('Error bulk updating question states:', error);
      res.status(500).json({ error: 'Failed to bulk update question states' });
    }
  }

  async getCompanyStats(req: Request, res: Response) {
    try {
      const companies = await prisma.revueFiscalCompany.findMany({
        include: {
          questionStates: true,
        },
      });

      const stats = companies.map((company) => {
        const totalQuestions = 140; // Based on the SECTIONS data
        const answered = company.questionStates.length;
        const anomalies = company.questionStates.filter((qs) => qs.eval === 'ANOMALIE').length;
        const erreurs = company.questionStates.filter((qs) => qs.eval === 'ERR_MAT').length;
        const ok = company.questionStates.filter((qs) => qs.eval === 'OK').length;
        const na = company.questionStates.filter((qs) => qs.eval === 'NA').length;
        const pct = Math.round((answered / totalQuestions) * 100);

        return {
          id: company.id,
          name: company.name,
          total: totalQuestions,
          answered,
          anomalies,
          erreurs,
          ok,
          na,
          pct,
        };
      });

      res.json(stats);
    } catch (error) {
      console.error('Error fetching company stats:', error);
      res.status(500).json({ error: 'Failed to fetch company stats' });
    }
  }
}