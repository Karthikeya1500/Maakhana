// Reusable empty state component for lists with no data

const EmptyState = ({ icon = "🍽️", title, message, action }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      textAlign: "center"
    }}>
      <span style={{ fontSize: "48px", marginBottom: "16px" }}>{icon}</span>
      <h3 style={{
        fontSize: "20px",
        fontWeight: 600,
        color: "#333",
        marginBottom: "8px"
      }}>
        {title || "Nothing here yet"}
      </h3>
      <p style={{
        fontSize: "14px",
        color: "#888",
        maxWidth: "300px",
        marginBottom: action ? "20px" : 0
      }}>
        {message || "Check back later for updates"}
      </p>
      {action && action}
    </div>
  )
}

export default EmptyState
