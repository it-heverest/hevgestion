import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  // Objets de styles pour garder le JSX propre
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column", // Pour que le contenu s'empile verticalement
      justifyContent: "center", // Centre verticalement
      alignItems: "center", // Centre horizontalement
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#1a1a1a",
      textAlign: "center",
    },
    accentBar: {
      width: "6px",
      backgroundColor: "#e2e8f0", // slate-200
      flexShrink: 0,
    },
    content: {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      padding: "0 60px",
      maxWidth: "800px",
    },
    errorHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "32px",
    },
    dot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      backgroundColor: "#ef4444", // red-500
    },
    errorCode: {
      fontSize: "120px",
      fontWeight: 700,
      lineHeight: 1,
      margin: "0 0 24px 0",
      letterSpacing: "-0.05em",
      color: "#0f172a",
    },
    title: {
      fontSize: "28px",
      fontWeight: 600,
      marginBottom: "12px",
      color: "#1e293b",
    },
    description: {
      fontSize: "16px",
      color: "#64748b", // slate-500
      lineHeight: "1.6",
      marginBottom: "40px",
      maxWidth: "450px",
    },
    btnPrimary: {
      padding: "10px 24px",
      backgroundColor: "#2563eb", // blue-600
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
    },
    btnSecondary: {
      padding: "10px 24px",
      backgroundColor: "transparent",
      color: "#475569",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
    },
    chip: {
      padding: "6px 16px",
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      backgroundColor: "white",
      color: "#64748b",
      fontSize: "13px",
      cursor: "pointer",
      margin: "4px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.accentBar} />

      <div style={styles.content}>
        <div style={styles.errorHeader}>
          <div style={styles.dot} />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              tracking: "0.1em",
              color: "#94a3b8",
            }}
          >
            Erreur Système 404
          </span>
        </div>

        <h1 style={styles.errorCode}>404</h1>

        <h2 style={styles.title}>Page introuvable</h2>
        <p style={styles.description}>
          La ressource demandée sur <strong>HevGestion</strong> est
          inaccessible. L'URL est peut-être incorrecte ou la page a été
          déplacée.
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "48px" }}>
          <button style={styles.btnPrimary} onClick={() => navigate(-1)}>
            Retour
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => navigate("/fr/web/user/dashboard/me")}
          >
            Tableau de bord
          </button>
        </div>

        <hr
          style={{
            border: "0",
            borderTop: "1px solid #f1f5f9",
            marginBottom: "32px",
          }}
        />

        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: "16px",
          }}
        >
          Accès Rapides
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "-4px" }}>
          {[
            { label: "Connexion", path: "/fr/web/user/login" },
            { label: "S'enregistrer", path: "/fr/web/user/register" },
            { label: "Support", path: "mailto:heverest.consulting@gmail.com" },
          ].map((link) => (
            <button
              key={link.path}
              style={styles.chip}
              onClick={() =>
                link.path.startsWith("mailto")
                  ? (window.location.href = link.path)
                  : navigate(link.path)
              }
            >
              {link.label}
            </button>
          ))}
        </div>

        <p style={{ marginTop: "40px", fontSize: "12px", color: "#94a3b8" }}>
          Contact technique :{" "}
          <span style={{ color: "#2563eb" }}>
            heverest.consulting@gmail.com
          </span>
        </p>
      </div>
    </div>
  );
}
