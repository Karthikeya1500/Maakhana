// Reusable loading spinner component

const Loading = ({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: { width: 20, height: 20, border: 2 },
    md: { width: 36, height: 36, border: 3 },
    lg: { width: 48, height: 48, border: 4 }
  }

  const s = sizes[size] || sizes.md

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "40px"
    }}>
      <div style={{
        width: s.width,
        height: s.height,
        border: `${s.border}px solid rgba(244, 164, 98, 0.2)`,
        borderTopColor: "#f4a462",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite"
      }} />
      {text && <p style={{ color: "#888", fontSize: "14px" }}>{text}</p>}
    </div>
  )
}

export default Loading
