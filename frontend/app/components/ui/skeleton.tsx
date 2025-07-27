import clsx from "clsx";

export default function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-dark-100", className)}
      {...props}
    />
  );
}
