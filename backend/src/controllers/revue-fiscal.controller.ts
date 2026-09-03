import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RevueFiscalEval, RevueFiscalPriority } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { auditService } from '../services/audit.service';
import { trashService } from '../services/trash.service';

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

interface QuestionnaireSection {
  id: string;
  number: string;
  title: string;
  subsections: QuestionnaireSubSection[];
}

interface QuestionnaireSubSection {
  id: string;
  title: string;
  badge?: string;
  info?: string;
  questions: QuestionnaireQuestion[];
}

interface QuestionnaireQuestion {
  id: string;
  text: string;
  isNew2026?: boolean;
  ref?: string;
}

interface QuestionnaireConfig {
  id: string;
  name: string;
  sections: QuestionnaireSection[];
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

      const userId = (req as AuthRequest).user?.userId;
      if (userId) {
        await auditService.logUserAction(
          userId,
          'REVUE_FISCAL_COMPANY_CREATED',
          `Création de la société pour la revue fiscale`,
          { companyId: company.id },
        );
      }

      res.status(201).json(company);
    } catch (error: any) {
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
    } catch (error: any) {
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

      const userId = (req as AuthRequest).user?.userId;
      if (userId) {
        await auditService.logUserAction(
          userId,
          'REVUE_FISCAL_COMPANY_UPDATED',
          "Modification de la société (revue fiscale)",
          { companyId: id },
        );
      }

      res.json(company);
    } catch (error: any) {
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
      const userId = (req as AuthRequest).user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Authentification requise' });
        return;
      }

      // Suppression réversible: archivage en corbeille avant retrait.
      await trashService.archiveAndDelete(
        "RevueFiscalCompany",
        id,
        userId,
        req.body?.reason
      );

      {
        await auditService.logUserAction(
          userId,
          'REVUE_FISCAL_COMPANY_DELETED',
          "Suppression de la société (revue fiscale)",
          { companyId: id },
        );
      }

      res.status(204).send();
    } catch (error: any) {
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

      console.log('Updating question state:', { companyId, questionId, eval: evalValue, note, renvoi, priority });

      if (!companyId || !questionId) {
        return res.status(400).json({ error: 'Company ID and Question ID are required' });
      }

      // Check if company exists first
      const companyExists = await prisma.revueFiscalCompany.findUnique({
        where: { id: companyId },
      });

      if (!companyExists) {
        console.error(`Company with ID ${companyId} not found`);
        return res.status(404).json({ error: 'Company not found' });
      }

      // Normalize priority to uppercase to match enum
      const normalizedPriority = priority ? priority.toUpperCase() as RevueFiscalPriority : undefined;

      // Prepare update data, excluding undefined values
      const updateData: any = {};
      const createData: any = {
        companyId,
        questionId,
      };

      if (evalValue !== undefined) {
        updateData.eval = evalValue;
        createData.eval = evalValue;
      }
      if (note !== undefined) {
        updateData.note = note;
        createData.note = note;
      }
      if (renvoi !== undefined) {
        updateData.renvoi = renvoi;
        createData.renvoi = renvoi;
      }
      if (normalizedPriority !== undefined) {
        updateData.priority = normalizedPriority;
        createData.priority = normalizedPriority;
      }

      console.log('Update data:', updateData);
      console.log('Create data:', createData);

      const questionState = await prisma.revueFiscalQuestionState.upsert({
        where: {
          companyId_questionId: {
            companyId,
            questionId,
          },
        },
        update: updateData,
        create: createData,
      });

      res.json(questionState);
    } catch (error: any) {
      console.error('Error updating question state:', error);
      if (error.code) {
        console.error('Prisma error code:', error.code);
        console.error('Prisma error meta:', error.meta);
      }
      res.status(500).json({ error: 'Failed to update question state', details: error.message });
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

          // Normalize priority to uppercase
          const normalizedPriority = priority ? priority.toUpperCase() as RevueFiscalPriority : undefined;

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
              priority: normalizedPriority,
            },
            create: {
              companyId,
              questionId,
              eval: evalValue,
              note,
              renvoi,
              priority: normalizedPriority,
            },
          });
        })
      );

      const userId = (req as AuthRequest).user?.userId;
      if (userId) {
        await auditService.logUserAction(
          userId,
          'REVUE_FISCAL_ANSWERS_SAVED',
          "Enregistrement des réponses de la revue fiscale",
          { companyId: updates[0]?.companyId, count: results.length },
        );
      }

      res.json(results);
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Error fetching company stats:', error);
      res.status(500).json({ error: 'Failed to fetch company stats' });
    }
  }

  // ==================== QUESTIONNAIRE CONFIGURATION ====================

  async getQuestionnaire(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const questionnaire = await prisma.revueFiscalQuestionnaire.findUnique({
        where: { id },
        include: {
          sections: {
            include: {
              subsections: {
                include: {
                  questions: {
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!questionnaire) {
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      // Transform to frontend format
      const result: QuestionnaireConfig = {
        id: questionnaire.id,
        name: questionnaire.name,
        sections: questionnaire.sections.map(section => ({
          id: section.sectionId,
          number: section.number,
          title: section.title,
          subsections: section.subsections.map(subsection => ({
            id: subsection.subSectionId,
            title: subsection.title,
            badge: subsection.badge || undefined,
            info: subsection.info || undefined,
            questions: subsection.questions.map(question => ({
              id: question.questionId,
              text: question.text,
              isNew2026: question.isNew2026,
              ref: question.ref || undefined,
            })),
          })),
        })),
      };

      res.json(result);
    } catch (error: any) {
      console.error('Error fetching questionnaire:', error);
      res.status(500).json({ error: 'Failed to fetch questionnaire' });
    }
  }

  async getDefaultQuestionnaire(req: Request, res: Response) {
    try {
      console.log('getDefaultQuestionnaire called');
      const questionnaire = await prisma.revueFiscalQuestionnaire.findFirst({
        where: { isDefault: true },
        include: {
          sections: {
            include: {
              subsections: {
                include: {
                  questions: {
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!questionnaire) {
        // If no default questionnaire exists, create one with basic structure
        await this.createDefaultQuestionnaire();
        // Then fetch it again
        const newQuestionnaire = await prisma.revueFiscalQuestionnaire.findFirst({
          where: { isDefault: true },
          include: {
            sections: {
              include: {
                subsections: {
                  include: {
                    questions: {
                      orderBy: { order: 'asc' },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        });

        if (newQuestionnaire) {
          const result: QuestionnaireConfig = {
            id: newQuestionnaire.id,
            name: newQuestionnaire.name,
            sections: newQuestionnaire.sections.map(section => ({
              id: section.sectionId,
              number: section.number,
              title: section.title,
              subsections: section.subsections.map(subsection => ({
                id: subsection.subSectionId,
                title: subsection.title,
                badge: subsection.badge || undefined,
                info: subsection.info || undefined,
                questions: subsection.questions.map(question => ({
                  id: question.questionId,
                  text: question.text,
                  isNew2026: question.isNew2026,
                  ref: question.ref || undefined,
                })),
              })),
            })),
          };
          return res.json(result);
        }

        // Fallback if creation failed
        return res.json({
          id: 'default',
          name: 'Default Questionnaire',
          sections: [],
        });
      }

      // Transform to frontend format
      const result: QuestionnaireConfig = {
        id: questionnaire.id,
        name: questionnaire.name,
        sections: questionnaire.sections.map(section => ({
          id: section.sectionId,
          number: section.number,
          title: section.title,
          subsections: section.subsections.map(subsection => ({
            id: subsection.subSectionId,
            title: subsection.title,
            badge: subsection.badge || undefined,
            info: subsection.info || undefined,
            questions: subsection.questions.map(question => ({
              id: question.questionId,
              text: question.text,
              isNew2026: question.isNew2026,
              ref: question.ref || undefined,
            })),
          })),
        })),
      };

      res.json(result);
    } catch (error: any) {
      console.error('Error fetching default questionnaire:', error);
      res.status(500).json({ error: 'Failed to fetch default questionnaire' });
    }
  }

  async updateQuestionnaire(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, sections }: { name: string; sections: QuestionnaireSection[] } = req.body;

      console.log('updateQuestionnaire called with:', { id, name, sectionsCount: sections?.length });

      if (!name || !sections) {
        return res.status(400).json({ error: 'Name and sections are required' });
      }

      // Start a transaction to update everything atomically
      await prisma.$transaction(async (tx) => {
        // Check if questionnaire exists, if not create it
        const existingQuestionnaire = await tx.revueFiscalQuestionnaire.findUnique({
          where: { id },
        });

        let questionnaireId = id;
        if (!existingQuestionnaire) {
          // Create the questionnaire if it doesn't exist
          const newQuestionnaire = await tx.revueFiscalQuestionnaire.create({
            data: {
              id,
              name,
              isActive: true,
              isDefault: id === 'default',
            },
          });
          questionnaireId = newQuestionnaire.id;
        } else {
          // Update questionnaire name if it exists
          await tx.revueFiscalQuestionnaire.update({
            where: { id },
            data: { name },
          });
        }

        // Collect all section IDs, subsection IDs, and question IDs that should exist
        const sectionIds: string[] = [];
        const subsectionMap: { [sectionUserId: string]: string[] } = {};
        const questionMap: { [subsectionUserId: string]: string[] } = {};

        // First pass: collect all IDs and upsert sections
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
          const section = sections[sectionIndex];

          sectionIds.push(section.id);

          // Check if section exists and upsert accordingly
          let dbSection = await tx.revueFiscalSection.findFirst({
            where: {
              questionnaireId,
              sectionId: section.id,
            },
          });

          if (dbSection) {
            // Update existing section
            dbSection = await tx.revueFiscalSection.update({
              where: { id: dbSection.id },
              data: {
                number: section.number,
                title: section.title,
                order: sectionIndex,
              },
            });
          } else {
            // Create new section
            dbSection = await tx.revueFiscalSection.create({
              data: {
                questionnaireId,
                sectionId: section.id,
                number: section.number,
                title: section.title,
                order: sectionIndex,
              },
            });
          }

          subsectionMap[section.id] = [];

          // Second pass: upsert subsections for this section
          for (let subIndex = 0; subIndex < section.subsections.length; subIndex++) {
            const subsection = section.subsections[subIndex];
            subsectionMap[section.id].push(subsection.id);

            let dbSubSection = await tx.revueFiscalSubSection.findFirst({
              where: {
                sectionId: dbSection.id,
                subSectionId: subsection.id,
              },
            });

            if (dbSubSection) {
              // Update existing subsection
              dbSubSection = await tx.revueFiscalSubSection.update({
                where: { id: dbSubSection.id },
                data: {
                  title: subsection.title,
                  badge: subsection.badge,
                  info: subsection.info,
                  order: subIndex,
                },
              });
            } else {
              // Create new subsection
              dbSubSection = await tx.revueFiscalSubSection.create({
                data: {
                  sectionId: dbSection.id,
                  subSectionId: subsection.id,
                  title: subsection.title,
                  badge: subsection.badge,
                  info: subsection.info,
                  order: subIndex,
                },
              });
            }

            questionMap[subsection.id] = [];

            // Third pass: upsert questions for this subsection
            for (let qIndex = 0; qIndex < subsection.questions.length; qIndex++) {
              const question = subsection.questions[qIndex];
              questionMap[subsection.id].push(question.id);

              let dbQuestion = await tx.revueFiscalQuestion.findFirst({
                where: {
                  subSectionId: dbSubSection.id,
                  questionId: question.id,
                },
              });

              if (dbQuestion) {
                // Update existing question
                await tx.revueFiscalQuestion.update({
                  where: { id: dbQuestion.id },
                  data: {
                    text: question.text,
                    isNew2026: question.isNew2026 || false,
                    ref: question.ref,
                    order: qIndex,
                  },
                });
              } else {
                // Create new question
                await tx.revueFiscalQuestion.create({
                  data: {
                    subSectionId: dbSubSection.id,
                    questionId: question.id,
                    text: question.text,
                    isNew2026: question.isNew2026 || false,
                    ref: question.ref,
                    order: qIndex,
                  },
                });
              }
            }
          }
        }

        // Clean up: delete questions that are no longer needed
        for (const section of sections) {
          const dbSections = await tx.revueFiscalSection.findMany({
            where: { questionnaireId, sectionId: section.id },
            include: { subsections: { include: { questions: true } } },
          });

          for (const dbSection of dbSections) {
            for (const dbSubSection of dbSection.subsections) {
              const expectedQuestionIds = questionMap[dbSubSection.subSectionId] || [];
              await tx.revueFiscalQuestion.deleteMany({
                where: {
                  subSectionId: dbSubSection.id,
                  questionId: { notIn: expectedQuestionIds },
                },
              });
            }

            const expectedSubsectionIds = subsectionMap[section.id] || [];
            await tx.revueFiscalSubSection.deleteMany({
              where: {
                sectionId: dbSection.id,
                subSectionId: { notIn: expectedSubsectionIds },
              },
            });
          }
        }

        // Delete sections that are no longer needed
        await tx.revueFiscalSection.deleteMany({
          where: {
            questionnaireId,
            sectionId: { notIn: sectionIds },
          },
        });
      });

      const userId = (req as AuthRequest).user?.userId;
      if (userId) {
        await auditService.logUserAction(
          userId,
          'REVUE_FISCAL_QUESTIONNAIRE_UPDATED',
          "Mise à jour du questionnaire de revue fiscale",
          {},
        );
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating questionnaire:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.code) {
        console.error('Prisma error code:', error.code);
        console.error('Prisma error meta:', error.meta);
      }
      res.status(500).json({ error: 'Failed to update questionnaire', details: error.message });
    }
  }

  private async createDefaultQuestionnaire() {
    // Create a basic default questionnaire structure
    await prisma.$transaction(async (tx) => {
      // Create the questionnaire
      const questionnaire = await tx.revueFiscalQuestionnaire.create({
        data: {
          id: 'default',
          name: 'Questionnaire par défaut',
          isActive: true,
          isDefault: true,
        },
      });

      // Create a sample section
      const section = await tx.revueFiscalSection.create({
        data: {
          questionnaireId: questionnaire.id,
          sectionId: 's00',
          number: '00',
          title: 'Renseignements généraux',
          order: 0,
        },
      });

      // Create a sample subsection
      const subsection = await tx.revueFiscalSubSection.create({
        data: {
          sectionId: section.id,
          subSectionId: 's00-1',
          title: 'Informations générales',
          order: 0,
        },
      });

      // Create sample questions
      await tx.revueFiscalQuestion.create({
        data: {
          subSectionId: subsection.id,
          questionId: '00.1.01',
          text: 'Dénomination sociale exacte',
          order: 0,
        },
      });

      await tx.revueFiscalQuestion.create({
        data: {
          subSectionId: subsection.id,
          questionId: '00.1.02',
          text: 'Forme juridique',
          order: 1,
        },
      });
    });
  }
}