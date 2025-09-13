import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { UniqueChain } from "@unique-nft/sdk";
import { useAccountsContext } from "../accounts/AccountsContext";
import { Account } from '../accounts/types'; 

export type UniqueChainType = ReturnType<typeof UniqueChain>;

export type SdkContextValueType = {
  sdk?: UniqueChainType;
};

export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

export const baseUrl = process.env.REACT_APP_REST_URL || "";

export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<UniqueChainType>();
  const { selectedAccount } = useAccountsContext();

  useEffect(() => {
    if (selectedAccount) {
      // ✅ FIX: Create a complete SDK-compatible account object
      const sdkCompatibleAccount = {
        ...selectedAccount,
        signer: selectedAccount.signer || null,
        // Add required properties that the SDK expects
        publicKey: selectedAccount.publicKey || new Uint8Array(),
        prefixedAddress: selectedAccount.prefixedAddress || ((prefix?: number) => selectedAccount.address),
        verify: selectedAccount.verify || (() => false),
        sign: selectedAccount.sign || (async (payload: any) => new Uint8Array())
      };

      const sdkInstance = UniqueChain({ baseUrl, account: sdkCompatibleAccount as any });
      setSdk(sdkInstance);
    } else {
      const sdkInstance = UniqueChain({ baseUrl });
      setSdk(sdkInstance);
    }
  }, [selectedAccount]);

  const sdkContextValue = useMemo(() => ({ sdk }), [sdk]);

  return (
    <SdkContext.Provider value={sdkContextValue}>
      {children}
    </SdkContext.Provider>
  );
};

export const useSdkContext = () => useContext(SdkContext);