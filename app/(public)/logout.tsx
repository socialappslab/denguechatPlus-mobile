import React, { useEffect } from "react";

import { Loading } from "@/components/themed/Loading";
import { useAuth } from "@/context/AuthProvider";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loading />;
}
