// components/EntityHeader.tsx
import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { notesService } from "../services/notes.service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertTriangle,
  Save,
  Building2,
  FileText,
  Calendar,
  Hash,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

// Interface for header data
interface HeaderData {
  entityName: string;
  fiscalYear: string;
  idNumber: string;
  duration: string;
}

// List of all note numbers that need header information
const ALL_NOTE_NUMBERS = [
  "1",
  "2",
  "3A",
  "3B",
  "3C",
  "3D",
  "3F",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15A",
  "15B",
  "16A",
  "16B",
  "16B bis",
  "16C",
  "17",
  "18",
  "19",
  "20",
  "23",
  "24",
  "25",
  "26",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
];

interface EntityHeaderProps {
  onComplete?: () => void;
}

export function EntityHeader({ onComplete }: EntityHeaderProps) {
  const { t } = useTranslation();
  const { selectedFolder, selectedClient } = useApp();
  const folderId = selectedFolder?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [missingNotes, setMissingNotes] = useState<string[]>([]);

  const [headerInfo, setHeaderInfo] = useState<HeaderData>({
    entityName: "",
    fiscalYear: "",
    idNumber: "",
    duration: "",
  });

  // Check all notes for missing header information
  useEffect(() => {
    if (!folderId) return;

    // Only nag for missing header info once the DSF has actually been
    // generated for this folder - before that, notes don't exist yet and
    // the check is premature.
    const dsfAlreadyGenerated =
      selectedFolder?.status === "DSF_GENERATED" ||
      selectedFolder?.status === "DSF_VALIDATED" ||
      selectedFolder?.status === "COMPLETED";

    if (!dsfAlreadyGenerated) {
      setMissingNotes([]);
      setIsOpen(false);
      return;
    }

    const checkNotesHeader = async () => {
      setIsLoading(true);
      const missing: string[] = [];

      try {
        // Use bulk load to get all notes at once - avoids multiple API calls
        const allNotes = await notesService.getNotesForFolder(folderId);
        const notesMap = new Map<string, any>(
          (allNotes || []).map((n: any) => [n.noteNumber, n.data])
        );

        // Check each note for missing header info
        for (const noteNumber of ALL_NOTE_NUMBERS) {
          const noteData = notesMap.get(noteNumber);

          // If note doesn't exist or has no header, it's missing
          if (!noteData || !noteData.entete) {
            missing.push(noteNumber);
            continue;
          }

          // Check if header has required fields
          const entete = noteData.entete;
          if (
            !entete.entityName ||
            !entete.fiscalYear ||
            !entete.idNumber ||
            !entete.duration
          ) {
            missing.push(noteNumber);
          }
        }

        setMissingNotes(missing);

        // If there are missing notes, open the dialog
        if (missing.length > 0) {
          setIsOpen(true);

          // Pre-fill with client and folder info if available
          if (selectedClient) {
            setHeaderInfo((prev) => ({
              ...prev,
              entityName: prev.entityName || selectedClient.name || "",
            }));
          }
          if (selectedFolder) {
            setHeaderInfo((prev) => ({
              ...prev,
              fiscalYear:
                prev.fiscalYear || selectedFolder.fiscalYear?.toString() || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error checking notes header:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkNotesHeader();
  }, [folderId, selectedClient, selectedFolder]);

  // Save header info to all missing notes
  const handleSave = async () => {
    if (!folderId) return;

    setIsSaving(true);

    try {
      // Save to each missing note
      for (const noteNumber of missingNotes) {
        // Get existing note data if any
        let existingData: any = null;
        try {
          existingData = await notesService.getNoteData(folderId, noteNumber);
        } catch (error) {
          // Note doesn't exist, will create new
        }

        // Merge existing data with new header
        const noteData: any = {
          ...existingData,
          entete: {
            entityName: headerInfo.entityName,
            fiscalYear: headerInfo.fiscalYear,
            idNumber: headerInfo.idNumber,
            duration: headerInfo.duration,
          },
        };

        // Save the note data
        await notesService.saveNoteData(folderId, noteNumber, noteData);
      }

      setIsOpen(false);
      setMissingNotes([]);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving header info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close (skip for now)
  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't render if no folder is selected
  if (!folderId) {
    return null;
  }

  return (
    <>
      {/* Hidden check - shows loading indicator if checking */}
      {isLoading && (
        <div className="fixed top-4 right-4 bg-orange-100 text-orange-800 px-4 py-2 rounded-md flex items-center gap-2">
          <FileText className="h-4 w-4 animate-pulse" />
          <span>Vérification des informations des notes...</span>
        </div>
      )}

      {/* Dialog for entering header information */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Informations de l'entreprise requises
            </DialogTitle>
            <DialogDescription>
              Les informations suivantes sont manquantes pour{" "}
              {missingNotes.length} note(s). Veuillez les compléter pour que les
              rapports soient complets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Entity Name */}
            <div className="space-y-2">
              <Label htmlFor="entityName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nom de l'entreprise *
              </Label>
              <Input
                id="entityName"
                value={headerInfo.entityName || ""}
                onChange={(e) =>
                  setHeaderInfo((prev) => ({
                    ...prev,
                    entityName: e.target.value,
                  }))
                }
                placeholder="Nom de l'entreprise"
              />
            </div>

            {/* Fiscal Year */}
            <div className="space-y-2">
              <Label htmlFor="fiscalYear" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Exercice fiscal *
              </Label>
              <Input
                id="fiscalYear"
                value={headerInfo.fiscalYear || ""}
                onChange={(e) =>
                  setHeaderInfo((prev) => ({
                    ...prev,
                    fiscalYear: e.target.value,
                  }))
                }
                placeholder="2024"
              />
            </div>

            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="idNumber" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Numéro d'identification *
              </Label>
              <Input
                id="idNumber"
                value={headerInfo.idNumber || ""}
                onChange={(e) =>
                  setHeaderInfo((prev) => ({
                    ...prev,
                    idNumber: e.target.value,
                  }))
                }
                placeholder="RC/AI/N°"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Durée de l'exercice *
              </Label>
              <Input
                id="duration"
                value={headerInfo.duration || ""}
                onChange={(e) =>
                  setHeaderInfo((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                placeholder="12 mois"
              />
            </div>

            {/* Info message */}
            <div className="bg-orange-50 text-orange-800 p-3 rounded-md text-sm">
              <strong>Note:</strong> Ces informations seront appliquées à toutes
              les notes ({missingNotes.length}) qui n'ont pas encore de données
              d'en-tête.
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 justify-between">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Plus tard
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving || !headerInfo.entityName || !headerInfo.fiscalYear
              }
              className="flex-1"
            >
              {isSaving ? (
                <>Enregistrement...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer pour {missingNotes.length} note(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EntityHeader;
