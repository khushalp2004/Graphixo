import React from "react";
import { Control } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form";

type CustomFieldProps = {
  control: Control<any> | undefined;
  render: (props: { field: any }) => React.ReactNode;
  name: string;
  formLabel?: string;
  className?: string;
};

export const CustomField = ({
  control,
  render,
  name,
  formLabel,
  className,
}: CustomFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>{render({ field })}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};