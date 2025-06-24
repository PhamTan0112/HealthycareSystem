import React, { Fragment } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface InputProps {
  type: "input" | "select" | "checkbox" | "switch" | "radio" | "textarea";
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "password" | "date";
  selectList?: { label: string; value: string }[];
  defaultValue?: string;
}

const RenderInput = ({ field, props }: { field: any; props: InputProps }) => {
  switch (props.type) {
    case "input":
      return (
        <FormControl>
          <Input
            type={props.inputType}
            placeholder={props.placeholder}
            value={field.value ?? ""} // 👈 đảm bảo không là undefined
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FormControl>
      );

    case "select":
      return (
        <Select onValueChange={field.onChange} value={field?.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="max-h-60 overflow-y-auto">
            {" "}
            {/* Thêm class tại đây */}
            {props.name === "time" ? (
              <>
                <div className="px-2 text-xs text-muted-foreground">
                  Morning
                </div>
                {props.selectList
                  ?.filter((i) => parseInt(i.value.split(":")[0]) < 12)
                  .map((i, id) => (
                    <SelectItem key={`morning-${id}`} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}

                <div className="px-2 mt-2 text-xs text-muted-foreground">
                  Afternoon
                </div>
                {props.selectList
                  ?.filter((i) => parseInt(i.value.split(":")[0]) >= 12)
                  .map((i, id) => (
                    <SelectItem key={`afternoon-${id}`} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
              </>
            ) : (
              props.selectList?.map((i, id) => (
                <SelectItem key={id} value={i.value}>
                  {i.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      );

    case "checkbox":
      return (
        <div className="items-top flex space-x-2">
          <Checkbox
            id={props.name}
            onCheckedChange={(e) => field.onChange(e === true || null)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={props.name}
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {props.label}
            </label>
            <p className="text-sm text-muted-foreground">{props.placeholder}</p>
          </div>
        </div>
      );

    case "radio":
      return (
        <div className="w-full">
          <FormLabel>{props.label}</FormLabel>
          <RadioGroup
            defaultValue={props.defaultValue}
            onChange={field.onChange}
            className="flex gap-4"
          >
            {props?.selectList?.map((i, id) => (
              <div className="flex items-center w-full" key={id}>
                <RadioGroupItem
                  value={i.value}
                  id={i.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={i.value}
                  className="flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600"
                >
                  {i.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "textarea":
      return (
        <FormControl>
          <Textarea
            type={props.inputType}
            placeholder={props.placeholder}
            {...field}
          ></Textarea>
        </FormControl>
      );
  }
};
export const CustomInput = (props: InputProps) => {
  const { name, label, control, type } = props;

  return (
    // <div className="w-full pt-6">
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {type !== "radio" && type !== "checkbox" && (
            <FormLabel>{label}</FormLabel>
          )}
          <RenderInput field={field} props={props} />
          <FormMessage />
        </FormItem>
      )}
    />
    // </div>
  );
};

type Day = {
  day: string;
  start_time?: string;
  close_time?: string;
};
interface SwitchProps {
  data: { label: string; value: string }[];
  setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>;
}

interface SwitchProps {
  data: { label: string; value: string }[];
  setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>;
  currentSchedule: Day[];
}

export const SwitchInput = ({
  data,
  setWorkSchedule,
  currentSchedule,
}: SwitchProps) => {
  const handleToggleDay = (day: string, isChecked: boolean) => {
    setWorkSchedule((prev) => {
      if (isChecked) {
        const exist = prev.find((d) => d.day === day);
        if (exist) return prev;
        return [...prev, { day, start_time: "09:00", close_time: "17:00" }];
      } else {
        return prev.filter((d) => d.day !== day);
      }
    });
  };

  const handleChange = (day: string, field: string, value: string) => {
    setWorkSchedule((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d))
    );
  };

  const isDayChecked = (day: string) =>
    currentSchedule?.some((d) => d.day === day);

  const getValue = (day: string, field: "start_time" | "close_time") =>
    currentSchedule.find((d) => d.day === day)?.[field] || "";

  return (
    <div>
      {data?.map((el, id) => (
        <div
          key={id}
          className="w-full flex items-center space-y-3 border-t border-t-gray-200 py-3"
        >
          <Switch
            id={el.value}
            className="data-[state=checked]:bg-blue-600 peer"
            checked={isDayChecked(el.value)}
            onCheckedChange={(checked) => handleToggleDay(el.value, checked)}
          />
          <Label htmlFor={el.value} className="w-20 capitalize">
            {el.value}
          </Label>

          <Label className="text-gray-400 font-normal italic peer-data-[state=checked]:hidden pl-10">
            Not working on this day
          </Label>

          <div className="hidden peer-data-[state=checked]:flex items-center gap-2 pl-6">
            <Input
              type="time"
              value={getValue(el.value, "start_time")}
              onChange={(e) =>
                handleChange(el.value, "start_time", e.target.value)
              }
            />
            <Input
              type="time"
              value={getValue(el.value, "close_time")}
              onChange={(e) =>
                handleChange(el.value, "close_time", e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
