import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { clientService } from "../services/client.service";

export function DSFImporter() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { selectedFolder, getCountryName, getCountryFlag } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Veuillez sélectionner un fichier Excel (.xls ou .xlsx)");
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Le fichier ne doit pas dépasser 10MB");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !folderId) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setWarning(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", folderId);

      setProgress(25);

      const response = await clientService.importDSF(formData);

      setProgress(100);
      setSuccess(true);

      // Redirect to folder view after success
      setTimeout(() => {
        navigate("/exercises");
      }, 2000);
    } catch (err: any) {
      console.error("DSF import error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Erreur lors de l'import du DSF";
      if (errorMessage.includes("Une DSF existe déjà")) {
        setWarning(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              DSF importé avec succès !
            </h2>
            <p className="text-gray-600 mb-4">
              Le DSF a été importé et traité. Redirection en cours...
            </p>
            <Button onClick={() => navigate("/exercises")} className="w-full">
              Retour aux exercices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Importer DSF</h1>
              <p className="text-sm text-gray-600 mt-1">
                Importez une Déclaration Sociale et Fiscale existante
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/exercises")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {/* Folder Info */}
        {selectedFolder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Dossier sélectionné
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-semibold">
                    {selectedFolder.client?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exercice</p>
                  <p className="font-semibold">{selectedFolder.fiscalYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Période</p>
                  <p className="font-semibold">
                    {new Date(selectedFolder.startDate).toLocaleDateString(
                      "fr-FR",
                    )}{" "}
                    -{" "}
                    {new Date(selectedFolder.endDate).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p className="font-semibold">{selectedFolder.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner le fichier DSF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="dsf-file"
                disabled={uploading}
              />
              <label htmlFor="dsf-file" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : "Cliquez pour sélectionner un fichier"}
                </p>
                <p className="text-sm text-gray-600">
                  Formats acceptés: .xls, .xlsx (max 10MB)
                </p>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Warning Alert */}
            {warning && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {warning}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importation en cours...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importation en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer le DSF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
