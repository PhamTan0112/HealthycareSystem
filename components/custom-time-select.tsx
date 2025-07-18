"use client";

import { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getAvailableTimesAction } from "@/app/actions/docter2";

type Props = {
  control: any;
  name: string;
  label: string;
  doctorId: string;
  appointmentDate: string;
};

export const CustomTimeSelectWithServerAction = ({
  control,
  name,
  label,
  doctorId,
  appointmentDate,
}: Props) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!doctorId || !appointmentDate) {
        setOptions([]);
        return;
      }

      setLoading(true);
      const result = await getAvailableTimesAction(doctorId, appointmentDate);
      setOptions(result);
      setLoading(false);
    };

    fetch();
  }, [doctorId, appointmentDate]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>{label}</FormLabel>
          <Select
            disabled={loading}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn giờ khám" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loading && (
            <p className="text-xs text-muted-foreground mt-1">
              Đang tải giờ khám...
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
