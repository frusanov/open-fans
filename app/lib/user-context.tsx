import { createContext, useContext } from "react";

export type UserContextType = {
  id: string;
} | null;

export const UserContext = createContext<UserContextType>(null);

export const UserContextProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserContextType;
}) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  return {
    user: useContext(UserContext) as UserContextType,
  };
};
