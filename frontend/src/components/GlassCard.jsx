export const GlassCard = ({ children, className = '', ...props }) => (
  <div className={`glass-card p-5 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);
