import { cn } from "cn";
import React from "react";

const Nutrients = () => {
  const nutrients = [
    {
      description: "of Potassium",
      quantity: "500",
      unit: "mg",
    },
    {
      description: "Natural Hydration",
      quantity: "100%",
      unit: null,
    },
    {
      description: "of sugar",
      quantity: "0",
      unit: "gm",
    },
    {
      description: "per 200Ml",
      quantity: "45",
      unit: "kcl",
    },
  ];
  return (
    <div className="space-y-4">
      {nutrients.map((itm, i) => {
        const dark = i == 1 || i == 2;
        return (
          <div
            key={itm.description}
            className={cn(
              "size-[250px] rounded-full border-[4px] flex flex-col items-center justify-center",
              {
                "bg-coconut text-banana border-banana": dark,
                "bg-banana text-foreground border-foreground": !dark,
              },
            )}
          >
            <h4 className="font-4  font-bold ">
              <span className=" text-6xl">{itm.quantity}</span>
              {itm.unit ? (
                <span className="uppercase text-4xl">{itm.unit}</span>
              ) : null}
            </h4>
            <span className="text-xl font-medium tracking-tight">
              {itm.description}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Nutrients;
