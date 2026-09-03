import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Trash2,
  Search,
  RotateCcw,
  Eye,
  ShieldAlert,
  Building2,
  FolderOpen,
  FileSpreadsheet,
  FileText,
  ClipboardCheck,
  StickyNote,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  trashService,
  TrashEntityType,
  TrashItem,
  TrashStats,
} from "../services/trash.service";

const PAGE_SIZE = 25;

/** Libellés et icônes par type d'entité archivée. */
const ENTITY_META: Record<
  TrashEntityType,
  { label: string; icon: React.ReactNode }
> = {
  Client: { label: "Client", icon: <Building2 className="h-4 w-4" /> },
  Folder: { label: "Dossier", icon: <FolderOpen className="h-4 w-4" /> },
  Balance: { label: "Balance", icon: <FileSpreadsheet className="h-4 w-4" /> },
  DSF: { label: "DSF", icon: <FileText className="h-4 w-4" /> },
  RevueFiscalCompany: {
    label: "Revue fiscale",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  DSFNote: { label: "Note DSF", icon: <StickyNote className="h-4 w-4" /> },
};

const ENTITY_ORDER: TrashEntityType[] = [
  "Client",
  "Folder",
  "Balance",
  "DSF",
  "DSFNote",
  "RevueFiscalCompany",
];

function entityMeta(type: string) {
  return (
    ENTITY_META[type as TrashEntityType] ?? {
      label: type,
      icon: <Trash2 className="h-4 w-4" />,
    }
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actorName(actor: TrashItem["deletedBy"]): string {
  if (!actor) return "—";
  const name = `${actor.firstName ?? ""} ${actor.lastName ?? ""}`.trim();
  return name || actor.email || "—";
}

export function TrashManager() {
  const { user } = useAuth();

  const [items, setItems] = useState<TrashItem[]>([]);
  const [stats, setStats] = useState<TrashStats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filtres
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [showRestored, setShowRestored] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Restauration
  const [candidate, setCandidate] = useState<TrashItem | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [detail, setDetail] = useState<{
    item: TrashItem;
    payload: unknown;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  // La recherche est différée pour ne pas interroger le serveur à chaque frappe.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const [pageData, statsData] = await Promise.all([
        trashService.list({
          entityType:
            entityFilter === "all" ? undefined : (entityFilter as TrashEntityType),
          restored: showRestored,
          search: search || undefined,
          page,
          limit: PAGE_SIZE,
        }),
        trashService.getStats(),
      ]);
      setItems(pageData.items);
      setTotal(pageData.total);
      setTotalPages(pageData.totalPages);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, entityFilter, showRestored, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (item: TrashItem) => {
    try {
      setDetailLoading(true);
      const full = await trashService.getItem(item.id);
      setDetail({ item, payload: full.payload });
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du détail");
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmRestore = async () => {
    if (!candidate) return;
    try {
      setRestoring(true);
      setError(null);
      await trashService.restore(candidate.id);
      setNotice(`« ${candidate.label} » a été restauré avec succès.`);
      setCandidate(null);
      await load();
    } catch (err: any) {
      // L'échec est métier (parent supprimé, identifiant réutilisé): on garde
      // la boîte de dialogue ouverte pour afficher la raison exacte.
      setError(err.message || "Erreur lors de la restauration");
      setCandidate(null);
    } finally {
      setRestoring(false);
    }
  };

  const statCards = useMemo(() => {
    if (!stats) return [];
    return ENTITY_ORDER.filter((type) => (stats.pending[type] ?? 0) > 0).map(
      (type) => ({
        type,
        label: entityMeta(type).label,
        icon: entityMeta(type).icon,
        count: stats.pending[type] ?? 0,
      })
    );
  }, [stats]);

  // ─── Accès réservé ────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-60" />
            <h2 className="text-lg font-semibold mb-1">Accès réservé</h2>
            <p className="text-sm text-muted-foreground">
              La corbeille contient des données de tous les clients. Seuls les
              administrateurs peuvent y accéder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Corbeille
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rien n'est réellement supprimé. Chaque suppression est archivée ici
          avec son auteur et sa date, et peut être restaurée à l'identique.
        </p>
      </div>

      {/* Messages */}
      {notice && (
        <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="text-green-700 hover:text-green-900 text-xs underline"
          >
            Fermer
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 text-xs underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Compteurs par type */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((card) => (
            <button
              key={card.type}
              onClick={() => {
                setEntityFilter(card.type);
                setShowRestored(false);
                setPage(1);
              }}
              className={`rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted/60 ${
                entityFilter === card.type ? "border-primary bg-muted/40" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {card.icon}
                <span className="text-[11px] uppercase tracking-wide truncate">
                  {card.label}
                </span>
              </div>
              <div className="text-xl font-semibold mt-0.5">{card.count}</div>
            </button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {showRestored ? "Éléments restaurés" : "Éléments en corbeille"}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par libellé..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={entityFilter}
              onValueChange={(v) => {
                setEntityFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Type d'élément" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {ENTITY_ORDER.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ENTITY_META[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={showRestored ? "restored" : "pending"}
              onValueChange={(v) => {
                setShowRestored(v === "restored");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En corbeille</SelectItem>
                <SelectItem value="restored">Déjà restaurés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin opacity-60" />
              <p className="text-sm">Chargement...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {showRestored
                  ? "Aucun élément restauré pour l'instant."
                  : search || entityFilter !== "all"
                    ? "Aucun élément ne correspond à ces critères."
                    : "La corbeille est vide."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {total} élément{total > 1 ? "s" : ""}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Type</TableHead>
                      <TableHead>Élément</TableHead>
                      <TableHead className="w-[170px]">Supprimé par</TableHead>
                      <TableHead className="w-[150px]">
                        {showRestored ? "Restauré le" : "Supprimé le"}
                      </TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead className="w-[170px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const meta = entityMeta(item.entityType);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="gap-1.5 font-normal"
                            >
                              {meta.icon}
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[320px]">
                            <div className="truncate font-medium" title={item.label}>
                              {item.label}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              {item.entityId}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {actorName(item.deletedBy)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(
                              showRestored ? item.restoredAt : item.deletedAt
                            )}
                          </TableCell>
                          <TableCell className="max-w-[220px]">
                            <div
                              className="truncate text-sm text-muted-foreground"
                              title={item.reason ?? ""}
                            >
                              {item.reason || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetail(item)}
                                title="Voir le contenu archivé"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!item.restoredAt && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCandidate(item)}
                                  className="gap-1.5"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Restaurer
                                </Button>
                              )}
                              {item.restoredAt && (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 font-normal"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Restauré
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation de restauration */}
      <Dialog
        open={!!candidate}
        onOpenChange={(open) => {
          if (!open && !restoring) setCandidate(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Restaurer cet élément ?
            </DialogTitle>
            <DialogDescription>
              L'élément sera réinséré tel qu'il était au moment de sa
              suppression, avec ses données associées.
            </DialogDescription>
          </DialogHeader>

          {candidate && (
            <div className="space-y-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {entityMeta(candidate.entityType).label}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Élément</span>
                <span className="font-medium text-right">{candidate.label}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Supprimé le</span>
                <span>{formatDate(candidate.deletedAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Par</span>
                <span>{actorName(candidate.deletedBy)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCandidate(null)}
              disabled={restoring}
            >
              Annuler
            </Button>
            <Button onClick={confirmRestore} disabled={restoring} className="gap-2">
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restauration...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Restaurer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Détail du contenu archivé */}
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detail && entityMeta(detail.item.entityType).icon}
              {detail?.item.label}
            </DialogTitle>
            <DialogDescription>
              Contenu archivé au moment de la suppression —{" "}
              {detail && formatDate(detail.item.deletedAt)}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="flex-1 min-h-0 overflow-auto">
              <pre className="text-xs bg-muted/50 rounded-md p-3 whitespace-pre-wrap break-all">
                {JSON.stringify(detail.payload, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-md bg-white px-4 py-3 shadow-lg flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement du contenu...
          </div>
        </div>
      )}
    </div>
  );
}

export default TrashManager;
