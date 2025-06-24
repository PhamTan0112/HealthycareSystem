import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span className="text-base text-gray-600 font-medium">Đang tải...</span>
      </div>
    </div>
  );
}
