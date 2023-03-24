import { Card } from "@tremor/react";

interface ICardProps {
  children: React.ReactNode;
  className?: string;
}

const CardInsights = (props: ICardProps) => {
  const { children, className = "", ...rest } = props;

  return (
    <Card className={`shadow-none ${className}`} {...rest}>
      {children}
    </Card>
  );
};

export { CardInsights };
