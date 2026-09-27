import React from "react";

export default function Source() {
  return (
    <div>
      <div className="font-5 text-[9vw] text-foreground tracking-tighter space-y-8">
        <h3 className="flex justify-between items-center">
          <div>The Real</div>
          <div>
            <img src="/source.svg" />
          </div>
          <div>Source</div>
        </h3>

        <h3 className="relative">
          <div className="absolute left-[60%]">Every Sip.</div>
        </h3>
      </div>

      <p className="font-3 tracking-tight text-2xl text-foreground max-w-[500px] ">
        For centuries, coconuts have carried their own perfectly balanced source
        of refreshment.
      </p>
    </div>
  );
}
