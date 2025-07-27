import type { FC } from "react";
import { AuthIsland } from "./auth-island";

export const Header: FC = () => {
  return (
    <header className="flex justify-between">
      <h1>OpenFans</h1>
      <AuthIsland />
    </header>
  );
};
