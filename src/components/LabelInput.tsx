import React from "react";
import { useFormContext } from "react-hook-form";

type TLabelInput = {
  id: string;
  label: string;
};

const LabelInput = ({ id, label }: TLabelInput) => {
  const { register } = useFormContext();

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="id">{label}</label>
      <input className="p-2" {...register(id)} />
    </div>
  );
};

export default LabelInput;
