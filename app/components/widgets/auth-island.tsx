import { useEffect, type FC } from "react";
import { useUserContext } from "~/app/lib/user-context";
import { Avatar, AvatarFallback } from "~/app/components/ui/avatar";

export const AuthIsland: FC = () => {
  const { user } = useUserContext();

  useEffect(() => {
    console.log({ user });
  }, [user]);

  return (
    <div>
      <Avatar>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
};
