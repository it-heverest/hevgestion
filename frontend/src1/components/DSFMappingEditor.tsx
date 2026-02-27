// components/DSFMappingEditor.tsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Trash2, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface MappingField {
  fieldId: string;
  fieldName: string;
  cellReference?: string;
  headerPattern?: string;
  dataType: string;
  isRequired: boolean;
}

interface MappingConfig {
  id?: string;
  sheetType: string;
  sheetNamePatterns: string[];
  fields: MappingField[];
}

interface DSFMappingEditorProps {
  sheetType: string;
  onSave?: (config: MappingConfig) => void;
  onCancel?: () => void;
}

const DSFMappingEditor: React.FC<DSFMappingEditorProps> = ({
  sheetType,
  onSave,
  onCancel,
}) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<MappingConfig>({
    sheetType,
    sheetNamePatterns: [sheetType],
    fields: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing configuration
  useEffect(() => {
    loadExistingConfig();
  }, [sheetType]);

  const loadExistingConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dsf-mapping/configs/${sheetType}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Error loading mapping config:", error);
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField: MappingField = {
      fieldId: `field_${Date.now()}`,
      fieldName: "",
      dataType: "string",
      isRequired: false,
    };

    setConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (index: number, updates: Partial<MappingField>) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) =>
        i === index ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const updateSheetPatterns = (patterns: string) => {
    const patternArray = patterns
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    setConfig((prev) => ({
      ...prev,
      sheetNamePatterns: patternArray,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/dsf-mapping/configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        onSave?.(result.config);
      } else {
        console.error("Failed to save mapping config");
      }
    } catch (error) {
      console.error("Error saving mapping config:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading mapping configuration...</div>;
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>DSF Mapping Editor - {sheetType}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sheet Name Patterns */}
        <div className="space-y-2">
          <Label htmlFor="sheet-patterns">
            Sheet Name Patterns (comma-separated)
          </Label>
          <Input
            id="sheet-patterns"
            value={config.sheetNamePatterns.join(", ")}
            onChange={(e) => updateSheetPatterns(e.target.value)}
            placeholder="e.g., Note 1, Note1, Dettes garanties"
          />
        </div>

        {/* Fields Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Field Mappings</Label>
            <Button onClick={addField} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field Name</TableHead>
                <TableHead>Cell Reference</TableHead>
                <TableHead>Header Pattern</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.fields.map((field, index) => (
                <TableRow key={field.fieldId}>
                  <TableCell>
                    <Input
                      value={field.fieldName}
                      onChange={(e) =>
                        updateField(index, { fieldName: e.target.value })
                      }
                      placeholder="e.g., Total Assets"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={field.cellReference || ""}
                      onChange={(e) =>
                        updateField(index, { cellReference: e.target.value })
                      }
                      placeholder="e.g., E6, F2"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={field.headerPattern || ""}
                      onChange={(e) =>
                        updateField(index, { headerPattern: e.target.value })
                      }
                      placeholder="e.g., Total.*, Assets"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={field.dataType}
                      onValueChange={(value) =>
                        updateField(index, { dataType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) =>
                        updateField(index, { isRequired: e.target.checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DSFMappingEditor;
