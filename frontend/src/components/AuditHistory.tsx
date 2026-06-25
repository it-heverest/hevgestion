import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  User,
  FileText,
  Settings,
  Upload,
  Edit3,
  Trash2,
  Plus,
  Calculator,
  BarChart,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { auditService } from "../services/audit.service";

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: string;
  entityType: string;
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
  changeType?: string;
  folder?: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  };
  client?: {
    id: string;
    name: string;
  };
}

export function AuditHistory() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.id) {
      loadAuditHistory();
    }
  }, [user?.id]);

  const loadAuditHistory = async () => {
    try {
      setLoading(true);
      const logs = await auditService.getRecentActivity(500); // Get more logs for system-wide view
      setAuditLogs(logs);
    } catch (error) {
      console.error("Error loading audit history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      USER_LOGIN: <User className="h-4 w-4" />,
      USER_LOGOUT: <User className="h-4 w-4" />,
      CLIENT_CREATED: <Plus className="h-4 w-4" />,
      CLIENT_UPDATED: <Edit3 className="h-4 w-4" />,
      CLIENT_DELETED: <Trash2 className="h-4 w-4" />,
      FOLDER_CREATED: <FileText className="h-4 w-4" />,
      FOLDER_UPDATED: <Edit3 className="h-4 w-4" />,
      DSF_CONFIG_CREATED: <Settings className="h-4 w-4" />,
      DSF_CONFIG_UPDATED: <Settings className="h-4 w-4" />,
      EXCEL_CELL_UPDATED: <Edit3 className="h-4 w-4" />,
      EXCEL_RANGE_UPDATED: <Edit3 className="h-4 w-4" />,
      DSF_GENERATED: <Calculator className="h-4 w-4" />,
      DSF_EXPORTED: <Download className="h-4 w-4" />,
      TAX_DECLARATION_SUBMITTED: <Upload className="h-4 w-4" />,
      BALANCE_UPLOADED: <Upload className="h-4 w-4" />,
      BALANCE_PROCESSED: <Calculator className="h-4 w-4" />,
    };

    return iconMap[action] || <History className="h-4 w-4" />;
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("CREATED") || action.includes("LOGIN")) {
      return "default";
    }
    if (action.includes("UPDATED") || action.includes("PROCESSED")) {
      return "secondary";
    }
    if (action.includes("DELETED") || action.includes("LOGOUT")) {
      return "destructive";
    }
    return "outline";
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      USER: "Utilisateur",
      CLIENT: "Client",
      FOLDER: "Dossier",
      DSF_CONFIG: "Configuration DSF",
      EXCEL_CELL: "Cellule Excel",
      DSF: "DSF",
      TAX_DECLARATION: "Déclaration fiscale",
      BALANCE: "Balance",
    };
    return labels[entityType] || entityType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity =
      entityFilter === "all" || log.entityType === entityFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
      }
    }

    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map((log) => log.action)));
  const uniqueEntities = Array.from(
    new Set(auditLogs.map((log) => log.entityType))
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2">Chargement de l'historique...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des actions
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'historique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entités</SelectItem>
              {uniqueEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {getEntityTypeLabel(entity)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune action trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {filteredLogs.length} action{filteredLogs.length > 1 ? "s" : ""}{" "}
              trouvée{filteredLogs.length > 1 ? "s" : ""}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getActionIcon(log.action)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEntityTypeLabel(log.entityType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={log.description}>
                        {log.description}
                      </div>
                      {log.cellAddress && (
                        <div className="text-xs text-muted-foreground">
                          {log.worksheet && `${log.worksheet}!`}
                          {log.cellAddress}
                          {log.fieldName && ` (${log.fieldName})`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      {(log.oldValue || log.newValue) && (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
