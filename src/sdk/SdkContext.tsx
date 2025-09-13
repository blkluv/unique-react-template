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

// It's a good practice to import the Account type to be explicit
import { Account } from '../accounts/types'; 

export type UniqueChainType = ReturnType<typeof UniqueChain>;

export type SdkContextValueType = {
  sdk?: UniqueChainType;
};

/**
 * React context for providing the Unique SDK instance throughout the application.
 *
 * @remarks
 * This context allows any component in the application to access the initialized
 * Unique SDK, enabling interaction with the Unique Network.
 */
export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

export const baseUrl = process.env.REACT_APP_REST_URL || "";

/**
 * A provider component that initializes the Unique SDK and supplies it via context to child components.
 *
 * @param children - The child components that will have access to the Unique SDK through the context.
 * @returns A React component that provides the initialized Unique SDK to its children.
 *
 * @example
 * ```tsx
 * <SdkProvider>
 * <App />
 * </SdkProvider>
 * ```
 */
export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<UniqueChainType>();
  const { selectedAccount } = useAccountsContext();

  useEffect(() => {
    if (selectedAccount) {
      // ✅ FIX: Create a new object that guarantees 'signer' is present.
      // This satisfies the SDK's IAccount interface.
      const sdkAccount = {
        ...selectedAccount,
        signer: selectedAccount.signer || null, // If signer is undefined, set it to null
      } as Account; // Type assertion to let TypeScript know this is an Account

      const sdkInstance = UniqueChain({ baseUrl, account: sdkAccount });
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