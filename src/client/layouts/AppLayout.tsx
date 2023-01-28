import React, { type PropsWithChildren } from "react";

const AppLayout = (props: PropsWithChildren) => {
  return (
    <div className="bg-clear-900 flex h-screen flex-col">
      <main className="h-full flex-1">{props.children}</main>
    </div>
  );
};

export default AppLayout;
