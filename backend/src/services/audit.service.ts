// services/audit.service.ts
import { prisma } from "../lib/prisma";
import { AuditAction, EntityType, ChangeType } from "@prisma/client";

interface AuditLogData {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  folderId?: string;
  clientId?: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  cellAddress?: string;
  worksheet?: string;
  fieldName?: string;
  changeType?: ChangeType;
}

export class AuditService {
  /**
   * Log an action to the audit trail
   */
  async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          folderId: data.folderId,
          clientId: data.clientId,
          description: data.description,
          oldValue: data.oldValue
            ? JSON.parse(JSON.stringify(data.oldValue))
            : null,
          newValue: data.newValue
            ? JSON.parse(JSON.stringify(data.newValue))
            : null,
          metadata: data.metadata
            ? JSON.parse(JSON.stringify(data.metadata))
            : null,
          cellAddress: data.cellAddress,
          worksheet: data.worksheet,
          fieldName: data.fieldName,
          changeType: data.changeType,
        },
      });
    } catch (error) {
      console.error("Error logging audit action:", error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log user authentication actions
   */
  async logUserLogin(userId: string, metadata?: any): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.USER_LOGIN,
      entityType: EntityType.USER,
      entityId: userId,
      description: "Connexion utilisateur",
      metadata,
    });
  }

  async logUserLogout(userId: string, metadata?: any): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.USER_LOGOUT,
      entityType: EntityType.USER,
      entityId: userId,
      description: "Déconnexion utilisateur",
      metadata,
    });
  }

  /**
   * Log client management actions
   */
  async logClientCreated(
    userId: string,
    clientData: any,
    clientId?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.CLIENT_CREATED,
      entityType: EntityType.CLIENT,
      entityId: clientId,
      description: `Création du client: ${clientData.name}`,
      newValue: clientData,
    });
  }

  async logClientUpdated(
    userId: string,
    clientId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.CLIENT_UPDATED,
      entityType: EntityType.CLIENT,
      entityId: clientId,
      description: `Modification du client: ${newData.name || clientId}`,
      oldValue: oldData,
      newValue: newData,
    });
  }

  async logClientDeleted(
    userId: string,
    clientId: string,
    clientData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.CLIENT_DELETED,
      entityType: EntityType.CLIENT,
      entityId: clientId,
      description: `Suppression du client: ${clientData.name}`,
      oldValue: clientData,
    });
  }

  /**
   * Log folder management actions
   */
  async logFolderCreated(
    userId: string,
    folderData: any,
    folderId?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.FOLDER_CREATED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      clientId: folderData.clientId,
      description: `Création du dossier: ${folderData.name}`,
      newValue: folderData,
    });
  }

  async logFolderUpdated(
    userId: string,
    folderId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.FOLDER_UPDATED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: `Modification du dossier: ${newData.name || folderId}`,
      oldValue: oldData,
      newValue: newData,
    });
  }

  /**
   * Log DSF configuration actions
   */
  async logDSFConfigCreated(
    userId: string,
    configData: any,
    configId?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_CONFIG_CREATED,
      entityType: EntityType.DSF_CONFIG,
      entityId: configId,
      description: `Création de la configuration DSF: ${configData.codeDsf}`,
      newValue: configData,
    });
  }

  async logDSFConfigUpdated(
    userId: string,
    configId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_CONFIG_UPDATED,
      entityType: EntityType.DSF_CONFIG,
      entityId: configId,
      description: `Modification de la configuration DSF: ${newData.codeDsf}`,
      oldValue: oldData,
      newValue: newData,
    });
  }

  /**
   * Log Excel cell modifications
   */
  async logExcelCellUpdate(
    userId: string,
    folderId: string,
    worksheet: string,
    cellAddress: string,
    oldValue: any,
    newValue: any,
    fieldName?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.EXCEL_CELL_UPDATED,
      entityType: EntityType.EXCEL_CELL,
      folderId,
      description: `Modification cellule Excel ${worksheet}!${cellAddress}${fieldName ? ` (${fieldName})` : ""}`,
      oldValue,
      newValue,
      cellAddress,
      worksheet,
      fieldName,
      changeType: ChangeType.UPDATED,
    });
  }

  async logExcelRangeUpdate(
    userId: string,
    folderId: string,
    worksheet: string,
    range: string,
    oldValue: any,
    newValue: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.EXCEL_RANGE_UPDATED,
      entityType: EntityType.EXCEL_CELL,
      folderId,
      description: `Modification plage Excel ${worksheet}!${range}`,
      oldValue,
      newValue,
      cellAddress: range,
      worksheet,
      changeType: ChangeType.UPDATED,
    });
  }

  /**
   * Log DSF generation and export actions
   */
  async logDSFGenerated(
    userId: string,
    folderId: string,
    folderData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_GENERATED,
      entityType: EntityType.DSF,
      entityId: folderId,
      folderId,
      description: `Génération DSF pour le dossier: ${folderData.name}`,
      newValue: { status: "generated", folderData },
    });
  }

  async logDSFExported(
    userId: string,
    folderId: string,
    folderData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_EXPORTED,
      entityType: EntityType.DSF,
      entityId: folderId,
      folderId,
      description: `Export DSF pour le dossier: ${folderData.name}`,
    });
  }

  /**
   * Log tax declaration actions
   */
  async logTaxDeclarationSubmitted(
    userId: string,
    folderId: string,
    declarationData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.TAX_DECLARATION_SUBMITTED,
      entityType: EntityType.TAX_DECLARATION,
      folderId,
      description: `Soumission déclaration fiscale pour le dossier: ${declarationData.folderName}`,
      newValue: declarationData,
    });
  }

  /**
   * Log DGI configuration actions
   */
  async logDGIConfigUpdated(
    userId: string,
    oldConfig: any,
    newConfig: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DGI_CONFIG_UPDATED,
      entityType: EntityType.DGI_CONFIG,
      description: "Modification de la configuration DGI",
      oldValue: oldConfig,
      newValue: newConfig,
    });
  }

  /**
   * Log balance processing actions
   */
  async logBalanceUploaded(
    userId: string,
    folderId: string,
    fileData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.BALANCE_UPLOADED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: `Upload du fichier balance: ${fileData.fileName}`,
      newValue: fileData,
    });
  }

  async logBalanceProcessed(
    userId: string,
    folderId: string,
    balanceData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.BALANCE_PROCESSED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: "Traitement des balances terminé",
      newValue: balanceData,
    });
  }

  async logBalanceValidated(
    userId: string,
    folderId: string,
    balanceId: string,
    validationResult: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.BALANCE_VALIDATED,
      entityType: EntityType.FOLDER,
      entityId: balanceId,
      folderId,
      description: "Validation des balances effectuée",
      newValue: validationResult,
    });
  }

  async logBalanceCorrected(
    userId: string,
    folderId: string,
    balanceId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.BALANCE_CORRECTED,
      entityType: EntityType.FOLDER,
      entityId: balanceId,
      folderId,
      description: "Correction des balances effectuée",
      oldValue: oldData,
      newValue: newData,
    });
  }

  /**
   * Log folder deletion and status changes
   */
  async logFolderDeleted(
    userId: string,
    folderId: string,
    folderData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.FOLDER_DELETED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      clientId: folderData.clientId,
      description: `Suppression du dossier: ${folderData.name}`,
      oldValue: folderData,
    });
  }

  async logFolderStatusChanged(
    userId: string,
    folderId: string,
    oldStatus: string,
    newStatus: string,
    folderData?: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.FOLDER_STATUS_CHANGED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: `Changement du statut du dossier: ${oldStatus} → ${newStatus}`,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      metadata: folderData,
    });
  }

  /**
   * Log DSF operations
   */
  async logDSFValidated(
    userId: string,
    folderId: string,
    validationResult: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_VALIDATED,
      entityType: EntityType.DSF,
      entityId: folderId,
      folderId,
      description: "Validation DSF effectuée",
      newValue: validationResult,
    });
  }

  async logDSFImported(
    userId: string,
    folderId: string,
    sourceFile: string,
    importData?: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_IMPORTED,
      entityType: EntityType.DSF,
      entityId: folderId,
      folderId,
      description: `Import DSF depuis: ${sourceFile}`,
      newValue: importData,
    });
  }

  async logDSFUpdated(
    userId: string,
    folderId: string,
    dsfId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DSF_UPDATED,
      entityType: EntityType.DSF,
      entityId: dsfId,
      folderId,
      description: "Mise à jour DSF effectuée",
      oldValue: oldData,
      newValue: newData,
    });
  }

  /**
   * Log report and export operations
   */
  async logReportGenerated(
    userId: string,
    folderId: string,
    reportType: string,
    reportData?: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.REPORT_GENERATED,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: `Génération du rapport: ${reportType}`,
      newValue: reportData,
    });
  }

  async logReportViewed(
    userId: string,
    folderId: string,
    reportType: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.USER_ACTION,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: `Consultation du rapport: ${reportType}`,
    });
  }

  async logReportExported(
    userId: string,
    folderId: string,
    reportType: string,
    format: string
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.DATA_EXPORT,
      entityType: EntityType.FOLDER,
      entityId: folderId,
      folderId,
      description: `Export du rapport ${reportType} en format: ${format}`,
      metadata: { format, reportType },
    });
  }

  /**
   * Generic action logging for view/read operations
   */
  async logUserAction(
    userId: string,
    action: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      userId,
      action: AuditAction.USER_ACTION,
      entityType: EntityType.SYSTEM,
      description,
      metadata,
    });
  }
}

export const auditService = new AuditService();
