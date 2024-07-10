import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { ILoginResponse, IUser, LoginRequestType } from "../schema/auth";
import { setAccessTokenToHeaders, useAxiosNoAuth } from "../config/axios";
import { useAuth } from "@/context/AuthProvider";

type IUseSignIn = {
  signInMutation: (payload: LoginRequestType) => Promise<void>;
  loading: boolean;
};

export default function useSignIn(): IUseSignIn {
  const { login } = useAuth();
  const [{ loading }, loginPost] = useAxiosNoAuth<
    ExistingDocumentObject & ILoginResponse,
    LoginRequestType,
    any
  >(
    {
      url: "users/session",
      method: "POST",
    },
    { manual: true },
  );

  const signInMutation = async (data: LoginRequestType) => {
    const loginRes = await loginPost({ data });

    const deserializedData = deserialize(loginRes.data);

    // eslint-disable-next-line no-console
    console.log("deserializedData login", deserializedData);
    login(loginRes.data.meta.jwt.res.access, deserializedData);
    setAccessTokenToHeaders(loginRes.data.meta.jwt.res.access);
  };

  return { signInMutation, loading };
}
