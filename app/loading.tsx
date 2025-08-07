import { Loader } from "@/app/components/global";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center">
      <Loader size="large" />
    </div>
  );
}
