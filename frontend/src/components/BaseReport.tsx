// components/BaseReport.tsx
import React, { useState, useEffect } from "react";
import { dsfService } from "../services/dsf.service";
import { dsfConfigService, DSFConfig } from "../services/dsf-config.service";
import {
  DSFCalculationService,
  ReportData,
  BalanceData,
} from "../services/dsf-calculation.service";
import { useApp } from "../contexts/AppContext";

interface BaseReportProps {
  reportType: string; // e.g., "note1", "note3a", "cf1"
  children: (props: BaseReportChildrenProps) => React.ReactNode;
}

export interface BaseReportChildrenProps {
  reportData: ReportData;
  balanceData: BalanceData;
  configs: DSFConfig[];
  loading: boolean;
  saving: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  saveToBackend: () => Promise<void>;
  headerInfo: {
    entityName: string;
    fiscalYear: string;
    idNumber: string;
    duration: string;
  };
  setHeaderInfo: React.Dispatch<
    React.SetStateAction<{
      entityName: string;
      fiscalYear: string;
      idNumber: string;
      duration: string;
    }>
  >;
}

export const BaseReport: React.FC<BaseReportProps> = ({
  reportType,
  children,
}) => {
  const { selectedFolder } = useApp();
  const [reportData, setReportData] = useState<ReportData>({});
  const [balanceData, setBalanceData] = useState<BalanceData>({});
  const [configs, setConfigs] = useState<DSFConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dsfId, setDsfId] = useState<string | null>(null);

  const [headerInfo, setHeaderInfo] = useState({
    entityName: "",
    fiscalYear: "2024",
    idNumber: "",
    duration: "12",
  });

  // Load DSF data and configs
  useEffect(() => {
    if (selectedFolder?.id) {
      loadDSFData();
      loadConfigs();
    }
  }, [selectedFolder?.id]);

  const loadDSFData = async () => {
    if (!selectedFolder?.id) return;

    try {
      setLoading(true);
      const response = await dsfService.getDSF(selectedFolder.id);
      const dsf = response.dsf;
      setDsfId(dsf.id);

      // Load balance data for calculations
      if (dsf.folder?.balances) {
        const balanceMap: BalanceData = {};
        dsf.folder.balances.forEach((balance) => {
          if (balance.equilibrium) {
            balanceMap[balance.period] = {
              openingDebit: balance.equilibrium.openingDebit,
              openingCredit: balance.equilibrium.openingCredit,
              movementDebit: balance.equilibrium.movementDebit,
              movementCredit: balance.equilibrium.movementCredit,
              closingDebit: balance.equilibrium.closingDebit,
              closingCredit: balance.equilibrium.closingCredit,
            };
          }
        });
        setBalanceData(balanceMap);
      }

      // Load data from DSF notes if available
      if (dsf.notes && dsf.notes[reportType]) {
        const reportDataFromDB = dsf.notes[reportType];

        if (reportDataFromDB.headerInfo) {
          setHeaderInfo(reportDataFromDB.headerInfo);
        }
        // Note: Numeric data is now calculated from configs, not loaded from saved state
      }
    } catch (error) {
      console.error(`Error loading DSF data for ${reportType}:`, error);
      // If no DSF exists, that's okay - user can still edit locally
    } finally {
      setLoading(false);
    }
  };

  const loadConfigs = async () => {
    if (!selectedFolder?.id) return;

    try {
      setLoading(true);
      const configsData = await dsfConfigService.getConfigsForNote(
        reportType,
        selectedFolder.id
      );
      setConfigs(configsData);

      // Calculate report data from configs and balance data
      const calculatedData = DSFCalculationService.calculateReportData(
        configsData,
        balanceData
      );
      setReportData(calculatedData);

      console.log(`Loaded DSF configs for ${reportType}:`, configsData);
    } catch (error) {
      console.error(`Error loading DSF configs for ${reportType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async () => {
    if (!dsfId) return;

    try {
      setSaving(true);

      // Structure the report data for backend
      const reportDataToSave = {
        headerInfo,
        // Note: Numeric data is calculated from configs, so we only save header and text fields
      };

      const notes = {
        [reportType]: reportDataToSave,
      };

      await dsfService.updateDSF(dsfId, { notes });
    } catch (error) {
      console.error(`Error saving ${reportType} to backend:`, error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {children({
        reportData,
        balanceData,
        configs,
        loading,
        saving,
        isEditing,
        setIsEditing,
        saveToBackend,
        headerInfo,
        setHeaderInfo,
      })}
    </>
  );
};
