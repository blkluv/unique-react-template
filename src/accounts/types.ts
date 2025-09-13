import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { BN } from "@polkadot/util";
import { IEthereumExtensionResultSafe } from "@unique-nft/utils/extension";
import { ConnectedWalletsName } from "./useWalletCenter";
import { Eip1193Provider, Signer as EthSigner } from "ethers";
import { PolkadotWalletName } from "./PolkadotWallet"; // Assuming PolkadotWalletName is defined here
import { Magic } from "magic-sdk";
import { SignerPayloadJSON } from "@polkadot/types/types"; // Import for Polkadot sign method

export enum SignerTypeEnum {
  Polkadot = "Polkadot",
  Ethereum = "Ethereum",
  Magiclink = 'Magiclink',
  Web3Auth = 'Web3Auth',
}

// Broaden the Signer type to include Polkadot Signer if needed directly,
// but for Account type, we'll make it more specific within the Account itself.
// export type Signer = any | EthSigner; // Kept as 'any' for maximum flexibility if you have other signers, but being more specific is better.
// For the purpose of Account, we will use a union type for the signer.


// BaseWalletType seems more like an internal interface for PolkadotWallet class,
// the properties from it are being merged into Account, so we can adjust Account directly.
// Keeping it for now but noting it might be redundant with the expanded Account type.
export type BaseWalletType<T> = {
  name: string;
  address: string;
  balance?: number;
  normalizedAddress: string;
  signerType: SignerTypeEnum;
  // This signer will be either EthSigner or PolkadotSigner, depending on SignerTypeEnum
  signer: EthSigner | (T extends InjectedAccountWithMeta ? any : undefined); // Polkadot signer from extension typically implements Signer from @polkadot/api/types
  sign?(data: any, account?: any, meta?: any): any; // This 'any' will be refined in the specific Account type
};

export type BaseWalletEntity<T> = {
  getAccounts(): Promise<Map<string, BaseWalletType<T>>>;
};

// WalletsType now represents the raw metadata from different wallet types
export type WalletsType =
  | InjectedAccountWithMeta
  | IEthereumExtensionResultSafe["result"];

export type AccountBalance = {
  raw: BN;
  parsed: string;
};

export type AccountBalances = {
  proper: AccountBalance;
  ethMirror: AccountBalance;
};

// --- START OF CRITICAL CHANGE ---
// Expand the Account type to explicitly include properties required by UniqueChain
// and those present on UniqueWalletType for Polkadot accounts.
export type Account = {
  address: string;
  normalizedAddress: string;
  name: string;
  balance?: number; // Optional balance property
  signerType: SignerTypeEnum;
  // Signer can be an Ethers signer for EVM, or the Polkadot signer from an extension
  signer?: EthSigner | any; // 'any' for Polkadot extension signer for now if no specific type is available universally

  // Polkadot-specific properties (from UniqueWalletType)
  walletType?: PolkadotWalletName; // Present only for Polkadot accounts
  publicKey?: Uint8Array; // Present only for Polkadot accounts
  prefixedAddress?: (prefix?: number) => string; // Present only for Polkadot accounts
  verify?: (message: string | Uint8Array, signature: string | Uint8Array) => boolean; // Present only for Polkadot accounts
  sign?: (payload: SignerPayloadJSON) => Promise<Uint8Array>; // The sign method for Polkadot payload

  // Optional metadata from original wallet connection
  walletMetaInformation?: InjectedAccountWithMeta; // For Polkadot.js
  // Other wallet-specific metadata if needed
};
// --- END OF CRITICAL CHANGE ---

export interface AccountsContextValue {
  accounts: Map<string, Account>;
  setAccounts: React.Dispatch<React.SetStateAction<Map<string, Account>>>;
  selectedAccountId: number;
  setSelectedAccountId: React.Dispatch<React.SetStateAction<number>>;
  selectedAccount: Account | undefined; // Now it's the comprehensive Account type
  setPolkadotAccountsWithBalance: (walletName?: ConnectedWalletsName) => Promise<void>;
  updateEthereumWallet: () => Promise<void>;
  reinitializePolkadotAccountsWithBalance: () => Promise<void>;
  clearAccounts: () => void;
  loginWithMagicLink: (email: string) => Promise<void>;
  logoutMagicLink: () => Promise<void>;
  loginWithWeb3Auth: () => Promise<void>;
  logoutWeb3Auth: () => Promise<void>;
  providerWeb3Auth: Eip1193Provider | null;
  magic: Magic | null;

  setWeb3Auth: React.Dispatch<React.SetStateAction<Web3Auth | null>>; // Use specific React.Dispatch type
  setProviderWeb3Auth: React.Dispatch<React.SetStateAction<Eip1193Provider | null>>; // Use specific React.Dispatch type
}