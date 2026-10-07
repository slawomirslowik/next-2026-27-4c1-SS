export default function Card({ title, children }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}